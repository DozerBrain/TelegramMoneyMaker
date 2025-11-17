// src/data/regions.ts
import { COUNTRIES, type RegionId } from "./countries";

// For pills / labels in UI
export const REGION_LABELS: Record<RegionId, string> = {
  NA: "North America",
  SA: "South America",
  EU: "Europe",
  CIS: "CIS",
  MENA: "MENA",
  AF: "Africa",
  AS: "Asia",
  OC: "Oceania",
};

export const REGION_LIST: RegionId[] = [
  "NA",
  "SA",
  "EU",
  "CIS",
  "MENA",
  "AF",
  "AS",
  "OC",
];

/**
 * Given a 2-letter country code like "US" or "RU",
 * return our RegionId ("NA", "CIS", etc).
 */
export function getRegionForCountry(code: string): RegionId {
  const cc = (code || "").toUpperCase();

  const found = COUNTRIES.find((c) => c.code === cc);
  if (found) return found.region;

  // Fallback guess if country not in list: put into Asia so it's not undefined
  return "AS";
}
