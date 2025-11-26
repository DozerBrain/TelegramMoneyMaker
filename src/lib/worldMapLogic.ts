// src/lib/worldMapLogic.ts
import {
  COUNTRIES,
  REGIONS,
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
 * Simple cost formula per country.
 * You can tweak these numbers later.
 */
export function costForCountry(code: string): number {
  const region = regionOfCountry(code);
  switch (region) {
    case "NA":
      return 50_000;
    case "EU":
      return 75_000;
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
 * - apsBonus = flat +APS
 * - couponBonus = +X (we interpret as +0.05 => +5% later)
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

  return { apsBonusTotal, couponBonusTotal };
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
