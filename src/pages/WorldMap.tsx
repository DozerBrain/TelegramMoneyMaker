// src/pages/WorldMap.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getProfile } from "../lib/profile";
import {
  COUNTRIES,
  REGIONS,
  type Country,
  type RegionId,
} from "../data/countries";
import { formatMoneyShort } from "../lib/format";

/**
 * Local save format for the world mini-game.
 * We keep it separate from the main save so we don't break anything.
 */
type WorldSave = {
  owned: string[]; // country codes, e.g. ["US", "CA"]
  unlockedRegions: RegionId[]; // e.g. ["NA", "SA"]
};

// ---- Helpers ---------------------------------------------------------------

function regionOfCountry(code: string): RegionId {
  const cc = code.toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  return (found?.region ?? "NA") as RegionId;
}

function findCountry(code: string): Country | undefined {
  const cc = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === cc);
}

function codeToFlag(code: string): string {
  return findCountry(code)?.flag ?? "🏳️";
}

/**
 * Very simple cost formula per country.
 * You can tweak this later.
 */
function costForCountry(code: string): number {
  const region = regionOfCountry(code);
  switch (region) {
    case "NA":
      return 50_000;
    case "EU":
      return 75_000;
    case "CIS":
      return 60_000;
    case "SA":
      return 40_000;
    case "MENA":
      return 55_000;
    case "AF":
      return 30_000;
    case "AS":
      return 65_000;
    case "OC":
      return 45_000;
    default:
      return 50_000;
  }
}

/**
 * APS bonus and coupon bonus for a single country.
 * Very simple for now: richer regions give a bit more.
 * - apsBonus = flat +APS
 * - couponBonus = +X (we'll interpret as +0.05 => +5% later)
 */
function countryBonuses(code: string): { apsBonus: number; couponBonus: number } {
  const region = regionOfCountry(code);
  switch (region) {
    case "NA":
      return { apsBonus: 1, couponBonus: 0.05 };
    case "EU":
      return { apsBonus: 1.3, couponBonus: 0.06 };
    case "CIS":
      return { apsBonus: 1.1, couponBonus: 0.05 };
    case "SA":
      return { apsBonus: 0.9, couponBonus: 0.045 };
    case "MENA":
      return { apsBonus: 1.0, couponBonus: 0.05 };
    case "AF":
      return { apsBonus: 0.7, couponBonus: 0.04 };
    case "AS":
      return { apsBonus: 1.2, couponBonus: 0.055 };
    case "OC":
      return { apsBonus: 1.0, couponBonus: 0.05 };
    default:
      return { apsBonus: 1, couponBonus: 0.05 };
  }
}

/**
 * Region graph: which regions unlock next once you finish one.
 * This is the "close by region" logic.
 */
const REGION_NEIGHBORS: Record<RegionId, RegionId[]> = {
  NA: ["SA", "EU"],
  SA: ["NA", "AF"],
  EU: ["NA", "CIS", "MENA", "AF"],
  CIS: ["EU", "AS", "MENA"],
  MENA: ["EU", "CIS", "AF"],
  AF: ["SA", "EU", "MENA"],
  AS: ["CIS", "OC"],
  OC: ["AS"],
};

// localStorage key for this mini-game
const WORLD_KEY = "moneymaker_world_v1";

function loadWorldSave(homeCountry: string, homeRegion: RegionId): WorldSave {
  if (typeof window === "undefined") {
    return { owned: [homeCountry], unlockedRegions: [homeRegion] };
  }

  try {
    const raw = localStorage.getItem(WORLD_KEY);
    if (!raw) {
      return { owned: [homeCountry], unlockedRegions: [homeRegion] };
    }
    const parsed = JSON.parse(raw) as Partial<WorldSave>;
    return {
      owned: Array.isArray(parsed.owned) && parsed.owned.length > 0
        ? parsed.owned.map(String)
        : [homeCountry],
      unlockedRegions:
        Array.isArray(parsed.unlockedRegions) && parsed.unlockedRegions.length > 0
          ? (parsed.unlockedRegions as RegionId[])
          : [homeRegion],
    };
  } catch {
    return { owned: [homeCountry], unlockedRegions: [homeRegion] };
  }
}

function saveWorldSave(save: WorldSave) {
  try {
    localStorage.setItem(WORLD_KEY, JSON.stringify(save));
  } catch {
    // ignore
  }

  // 🔥 Also broadcast totals to the main app (App.tsx can listen later)
  const { apsBonusTotal, couponBonusTotal } = computeTotals(save.owned);
  window.dispatchEvent(
    new CustomEvent("MM_MAP_BONUS", {
      detail: {
        apsBonus: apsBonusTotal,
        couponBonus: couponBonusTotal,
      },
    })
  );
}

function computeTotals(owned: string[]) {
  let apsBonusTotal = 0;
  let couponBonusTotal = 0;

  for (const code of owned) {
    const { apsBonus, couponBonus } = countryBonuses(code);
    apsBonusTotal += apsBonus;
    couponBonusTotal += couponBonus;
  }

  return { apsBonusTotal, couponBonusTotal };
}

// ---------------------------------------------------------------------------

type Props = {
  // For now, only read balance so we can show if user can afford.
  balance: number;
  // Later we can call setBalance to actually spend money:
  // setBalance: (fn: (prev: number) => number) => void;
};

export default function WorldMapPage({ balance }: Props) {
  // --- figure out player home country / region from profile ---------------
  const { homeCountry, homeRegion } = useMemo(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = regionOfCountry(cc);
    return { homeCountry: cc, homeRegion: region };
  }, []);

  const [world, setWorld] = useState<WorldSave>(() =>
    loadWorldSave(homeCountry, homeRegion)
  );

  const [selectedRegion, setSelectedRegion] = useState<RegionId>(homeRegion);

  // recompute unlockedRegions when owned changes
  useEffect(() => {
    const nextUnlocked = new Set<RegionId>(world.unlockedRegions);

    // if somehow homeRegion is missing, always add it
    nextUnlocked.add(homeRegion);

    // for every region, if all its countries are owned, unlock neighbors
    for (const r of REGIONS) {
      const countriesInRegion = COUNTRIES.filter(
        (c) => c.region === r.id
      ).map((c) => c.code.toUpperCase());

      const allOwned =
        countriesInRegion.length > 0 &&
        countriesInRegion.every((code) =>
          world.owned.map((o) => o.toUpperCase()).includes(code)
        );

      if (allOwned) {
        const neighbors = REGION_NEIGHBORS[r.id] ?? [];
        for (const n of neighbors) {
          nextUnlocked.add(n);
        }
      }
    }

    const finalUnlocked = Array.from(nextUnlocked);

    if (
      finalUnlocked.sort().join(",") !==
      world.unlockedRegions.slice().sort().join(",")
    ) {
      const updated: WorldSave = {
        owned: world.owned,
        unlockedRegions: finalUnlocked as RegionId[],
      };
      setWorld(updated);
      saveWorldSave(updated);
    } else {
      // still store + broadcast totals
      saveWorldSave(world);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.owned]);

  // computed totals
  const { apsBonusTotal, couponBonusTotal } = useMemo(
    () => computeTotals(world.owned),
    [world.owned]
  );

  const ownedSet = useMemo(
    () => new Set(world.owned.map((c) => c.toUpperCase())),
    [world.owned]
  );
  const unlockedRegionSet = useMemo(
    () => new Set(world.unlockedRegions),
    [world.unlockedRegions]
  );

  const countriesInSelectedRegion = useMemo(
    () => COUNTRIES.filter((c) => c.region === selectedRegion),
    [selectedRegion]
  );

  function handleBuyCountry(code: string) {
    const cost = costForCountry(code);
    if (balance < cost) {
      alert("Not enough money to buy this country yet.");
      return;
    }

    if (ownedSet.has(code.toUpperCase())) return;

    const updated: WorldSave = {
      owned: [...world.owned, code.toUpperCase()],
      unlockedRegions: world.unlockedRegions,
    };

    setWorld(updated);
    saveWorldSave(updated);

    // NOTE: we are NOT actually subtracting from balance yet.
    // Later we can call a prop setBalance from App.tsx.
  }

  return (
    <div className="p-4 pb-20 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-emerald-400">
            World Map
          </div>
          <div className="text-[11px] text-white/60">
            Conquer countries to boost APS & coupons.
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-white/60">Map APS bonus</div>
          <div className="text-emerald-400 font-semibold">
            +{apsBonusTotal.toFixed(1)} APS
          </div>
          <div className="mt-1 text-white/60">Map coupon bonus</div>
          <div className="text-emerald-400 font-semibold">
            +{(couponBonusTotal * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Fake world map block */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-3 mb-4">
        <div className="text-[11px] text-white/60 mb-2">
          Tap a region to focus it. Locked regions are hidden in the fog with ?.
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {REGIONS.map((r) => {
            const isUnlocked = unlockedRegionSet.has(r.id);
            const isSelected = selectedRegion === r.id;

            if (!isUnlocked) {
              return (
                <div
                  key={r.id}
                  className="relative rounded-xl bg-black/70 border border-white/10 flex items-center justify-center h-16"
                >
                  <span className="text-2xl">?</span>
                  <span className="absolute bottom-1 text-[9px] text-white/40">
                    {r.label}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`rounded-xl h-16 border flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-emerald-600/80 border-emerald-300 shadow-lg shadow-emerald-500/30"
                    : "bg-zinc-900/80 border-white/15"
                }`}
              >
                <span className="text-[11px] font-semibold">
                  {r.label}
                </span>
                <span className="text-[9px] text-white/60 mt-1">
                  {COUNTRIES.filter((c) => c.region === r.id).length} countries
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Countries list */}
      <div className="mb-2 text-[11px] text-white/60">
        Countries in{" "}
        <span className="text-emerald-400 font-semibold">
          {
            REGIONS.find((r) => r.id === selectedRegion)?.label ??
            selectedRegion
          }
        </span>
      </div>

      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 max-h-[50vh] overflow-y-auto">
        {countriesInSelectedRegion.length === 0 ? (
          <div className="px-4 py-6 text-sm text-white/60 text-center">
            No countries defined for this region yet.
          </div>
        ) : (
          countriesInSelectedRegion.map((c) => {
            const owned = ownedSet.has(c.code.toUpperCase());
            const cost = costForCountry(c.code);
            const { apsBonus, couponBonus } = countryBonuses(c.code);

            return (
              <div
                key={c.code}
                className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-white/50">
                      {c.code} · +{apsBonus.toFixed(1)} APS · +
                      {(couponBonus * 100).toFixed(1)}% coupons
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    ${formatMoneyShort(cost)}
                  </div>

                  {owned ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[10px] text-emerald-300">
                      OWNED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyCountry(c.code)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 disabled:bg-zinc-700 disabled:text-white/40"
                      disabled={balance < cost}
                    >
                      {balance < cost ? "Too expensive" : "Buy"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 text-[10px] text-white/40">
        Tip: once you own all countries in a region, nearby regions will unlock
        and appear on the map.
      </div>
    </div>
  );
}
