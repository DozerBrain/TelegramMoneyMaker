// src/lib/worldMapLogic.ts
import {
  COUNTRIES,
  type Country,
  type RegionId,
} from "../data/countries";

/**
 * Local save format for the world mini-game.
 * We keep it separate from the main save so we don't break anything.
 */
export type WorldSave = {
  owned: string[]; // country codes, e.g. ["US", "CA"]
  unlockedRegions: RegionId[]; // e.g. ["NA", "SA"]
};

// localStorage key for this mini-game
export const WORLD_KEY = "moneymaker_world_v1";

/**
 * Find region for a given country code.
 */
export function regionOfCountry(code: string): RegionId {
  const cc = code.toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  return (found?.region ?? "NA") as RegionId;
}

export function findCountry(code: string): Country | undefined {
  const cc = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === cc);
}

/**
 * GLOBAL cost curve.
 *
 * Region does NOT affect price anymore.
 * Every next country you own in the entire world makes all future countries more expensive.
 *
 * ownedCount = how many countries the player already owns (global).
 */
export function costForCountry(
  code: string,
  ownedCount: number = 0
): number {
  // Base starting price for the very first country
  const base = 50_000;

  // Safety: no negatives
  const safeOwned = Math.max(0, ownedCount);

  // Tapper-style exponential growth: +12% per owned country
  // So cost grows smoothly and NEVER goes down, no matter the region.
  const growthPerCountry = 1.12;
  const scale = Math.pow(growthPerCountry, safeOwned);

  const cost = Math.floor(base * scale);
  return cost;
}

/**
 * APS bonus and coupon bonus for a single country (base values).
 * - apsBonus = flat +APS
 * - couponBonus = +X (we interpret as +0.05 => +5% later)
 *
 * This still depends on REGION (not price), which is fine –
 * cost is global, bonuses are flavor per region.
 */
export function countryBonuses(
  code: string
): { apsBonus: number; couponBonus: number } {
  const region = regionOfCountry(code);
  switch (region) {
    case "NA":
      return { apsBonus: 1.0, couponBonus: 0.05 };
    case "EU":
      return { apsBonus: 1.3, couponBonus: 0.06 };
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
      return { apsBonus: 1.0, couponBonus: 0.05 };
  }
}

/**
 * Region graph: which regions unlock next once you finish one.
 * This is the "close by region" logic with your 7 servers only.
 */
export const REGION_NEIGHBORS: Record<RegionId, RegionId[]> = {
  NA: ["SA", "EU"],
  SA: ["NA", "AF"],
  EU: ["NA", "MENA", "AF", "AS"],
  AS: ["EU", "OC", "MENA"],
  OC: ["AS"],
  MENA: ["EU", "AF", "AS"],
  AF: ["SA", "EU", "MENA"],
};

// ==== WORLD RANK / TIER SYSTEM ============================================

type WorldTier = {
  id: number;
  label: string;
  minOwned: number; // countries needed to reach this tier
  apsMult: number;
  couponMult: number;
};

const WORLD_TIERS: WorldTier[] = [
  {
    id: 1,
    label: "Local Boss",
    minOwned: 1,
    apsMult: 1.0,
    couponMult: 1.0,
  },
  {
    id: 2,
    label: "Regional Overlord",
    minOwned: 10,
    apsMult: 1.25,
    couponMult: 1.1,
  },
  {
    id: 3,
    label: "Global Tycoon",
    minOwned: 25,
    apsMult: 1.5,
    couponMult: 1.2,
  },
  {
    id: 4,
    label: "World Emperor",
    minOwned: 50,
    apsMult: 1.8,
    couponMult: 1.35,
  },
  {
    id: 5,
    label: "Universal Legend",
    minOwned: 100,
    apsMult: 2.2,
    couponMult: 1.5,
  },
];

export function getWorldTier(ownedCount: number) {
  let current = WORLD_TIERS[0];
  for (const tier of WORLD_TIERS) {
    if (ownedCount >= tier.minOwned) {
      current = tier;
    }
  }
  const idx = WORLD_TIERS.indexOf(current);
  const next = WORLD_TIERS[idx + 1] ?? null;

  return {
    tier: current,
    nextTierAt: next ? next.minOwned : null,
  };
}

export function loadWorldSave(
  homeCountry: string,
  homeRegion: RegionId
): WorldSave {
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
      owned:
        Array.isArray(parsed.owned) && parsed.owned.length > 0
          ? parsed.owned.map(String)
          : [homeCountry],
      unlockedRegions:
        Array.isArray(parsed.unlockedRegions) &&
        parsed.unlockedRegions.length > 0
          ? (parsed.unlockedRegions as RegionId[])
          : [homeRegion],
    };
  } catch {
    return { owned: [homeCountry], unlockedRegions: [homeRegion] };
  }
}

export function computeTotals(owned: string[]) {
  let apsBonusTotal = 0;
  let couponBonusTotal = 0;

  for (const code of owned) {
    const { apsBonus, couponBonus } = countryBonuses(code);
    apsBonusTotal += apsBonus;
    couponBonusTotal += couponBonus;
  }

  const ownedCount = owned.length;
  const { tier, nextTierAt } = getWorldTier(ownedCount);

  // Apply tier multipliers
  apsBonusTotal *= tier.apsMult;
  couponBonusTotal *= tier.couponMult;

  return {
    apsBonusTotal,
    couponBonusTotal,
    tierLabel: tier.label,
    ownedCount,
    nextTierAt,
  };
}

export function saveWorldSave(save: WorldSave) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(WORLD_KEY, JSON.stringify(save));
    }
  } catch {
    // ignore
  }

  // 🔥 Also broadcast totals to the main app (App.tsx can listen later)
  if (typeof window !== "undefined") {
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
}
