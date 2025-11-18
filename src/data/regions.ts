// src/data/regions.ts

// We only use these 7 servers now:
import type { RegionId } from "./countries";

// Human-readable labels
export const REGION_LABELS: Record<RegionId, string> = {
  NA: "North America",
  SA: "South America",
  EU: "Europe",
  AS: "Asia",
  OC: "Oceania",
  MENA: "Middle East",
  AF: "Africa",
};

// Ordered list for UI selectors
export const REGION_LIST: RegionId[] = [
  "NA",
  "SA",
  "EU",
  "AS",
  "OC",
  "MENA",
  "AF",
];
