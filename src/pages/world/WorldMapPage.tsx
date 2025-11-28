// src/pages/world/WorldMapPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../lib/profile";
import { COUNTRIES, REGIONS, type RegionId } from "../../data/countries";
import {
  loadWorldSave,
  saveWorldSave,
  computeTotals,
  REGION_NEIGHBORS,
  regionOfCountry,
  type WorldSave,
} from "../../lib/worldMapLogic";
import WorldHeader from "./WorldHeader";
import RegionGrid from "./RegionGrid";
import CountryList from "./CountryList";
import CountryConquest from "./CountryConquest";

type Props = {
  // Current money balance
  balance: number;
  // Optional: function to modify balance (we use this to deduct on win)
  setBalance?: (fn: (prev: number) => number) => void;
};

export default function WorldMapPage({ balance, setBalance }: Props) {
  // --- player home country / region ----------------------------------------
  const { homeCountry, homeRegion } = useMemo(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = regionOfCountry(cc);
    return { homeCountry: cc, homeRegion: region };
  }, []);

  const [world, setWorld] = useState<WorldSave>(() =>
    loadWorldSave(homeCountry, homeRegion)
  );

  const [selectedRegion, setSelectedRegion] =
    useState<RegionId>(homeRegion);

  // Active conquest
  const [activeCountry, setActiveCountry] = useState<string | null>(
    null
  );
  const [pendingCost, setPendingCost] = useState<number | null>(null);

  // recompute unlockedRegions when owned changes
  useEffect(() => {
    const nextUnlocked = new Set<RegionId>(world.unlockedRegions);

    // ensure homeRegion is always unlocked
    nextUnlocked.add(homeRegion);

    for (const r of REGIONS) {
      const countriesInRegion = COUNTRIES.filter(
        (c) => c.region === r.id
      ).map((c) => c.code.toUpperCase());

      const ownedUpper = world.owned.map((o) => o.toUpperCase());

      const allOwned =
        countriesInRegion.length > 0 &&
        countriesInRegion.every((code) => ownedUpper.includes(code));

      if (allOwned) {
        const neighbors = REGION_NEIGHBORS[r.id] ?? [];
        for (const n of neighbors) {
          nextUnlocked.add(n);
        }
      }
    }

    const finalUnlocked = Array.from(nextUnlocked);

    if (
      finalUnlocked.slice().sort().join(",") !==
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

  // computed totals + tier
  const {
    apsBonusTotal,
    couponBonusTotal,
    tierLabel,
    ownedCount,
    nextTierAt,
  } = useMemo(() => computeTotals(world.owned), [world.owned]);

  // 🔥 NEW: broadcast world bonuses + countriesOwned to the main game state
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("MM_MAP_BONUS", {
          detail: {
            apsBonus: apsBonusTotal,
            couponBonus: couponBonusTotal,
            countriesOwned: ownedCount,
          },
        })
      );
    } catch {
      // ignore if window/custom event not available
    }
  }, [apsBonusTotal, couponBonusTotal, ownedCount]);

  const ownedSet = useMemo(
    () => new Set(world.owned.map((c) => c.toUpperCase())),
    [world.owned]
  );

  // Called when user presses "Conquer"
  function handleBuyCountry(code: string, cost: number) {
    const upper = code.toUpperCase();
    if (ownedSet.has(upper)) return;
    if (balance < cost) return; // extra safety

    // Open conquest for this country, remember entry cost
    setActiveCountry(upper);
    setPendingCost(cost);
  }

  // Handle updating world save from CountryConquest
  function handleUpdateWorld(next: WorldSave) {
    // detect if the active country has just been newly owned
    if (activeCountry && pendingCost != null && setBalance) {
      const wasOwnedBefore = world.owned
        .map((c) => c.toUpperCase())
        .includes(activeCountry.toUpperCase());
      const nowOwned = next.owned
        .map((c) => c.toUpperCase())
        .includes(activeCountry.toUpperCase());

      // Only deduct money when conquest actually succeeds
      if (!wasOwnedBefore && nowOwned) {
        setBalance((prev) => Math.max(0, prev - pendingCost));
      }
    }

    setWorld(next);
  }

  function handleCloseConquest() {
    setActiveCountry(null);
    setPendingCost(null);
  }

  return (
    <div className="p-4 pb-20 text-white relative">
      <WorldHeader
        apsBonusTotal={apsBonusTotal}
        couponBonusTotal={couponBonusTotal}
        tierLabel={tierLabel}
        ownedCount={ownedCount}
        nextTierAt={nextTierAt}
      />

      <RegionGrid
        selectedRegion={selectedRegion}
        unlockedRegions={world.unlockedRegions}
        onSelectRegion={setSelectedRegion}
      />

      <CountryList
        selectedRegion={selectedRegion}
        ownedSet={ownedSet}
        worldOwnedCount={ownedCount}
        balance={balance}
        onBuy={handleBuyCountry}
      />

      {activeCountry && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <CountryConquest
            key={activeCountry}
            countryCode={activeCountry}
            save={world}
            onUpdateSave={handleUpdateWorld}
            onClose={handleCloseConquest}
          />
        </div>
      )}
    </div>
  );
}
