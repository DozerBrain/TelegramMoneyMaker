// src/data/regions.ts
import type { RegionId } from "./countries";
import { COUNTRIES } from "./countries";

// Region labels for the UI
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

// List for UI pills
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

// Returns region for a given country code
export function getRegionForCountry(code: string): RegionId {
  const cc = (code || "").toUpperCase();

  const found = COUNTRIES.find((c) => c.code === cc);
  if (found) return found.region;

  // fallback to Asia instead of undefined
  return "AS";
}
