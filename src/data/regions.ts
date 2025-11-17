// src/data/regions.ts
import { COUNTRIES, type RegionId } from "./countries";

// Re-export RegionId so other files can import from here if they want
export type { RegionId } from "./countries";

// Human-readable labels
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

// Ordered list for UI
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

// Look up region by country code (US -> NA, RU -> CIS, etc.)
export function getRegionForCountry(code: string): RegionId {
  const cc = (code || "").toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  // default to NA if unknown so we always have **some** region
  return found?.region ?? "NA";
}
