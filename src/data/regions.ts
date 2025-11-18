// src/data/regions.ts

import {
  type RegionId,
  REGION_LABELS,
  REGION_LIST,
  getRegionForCountry as getRegionForCountryFromCountries,
} from "./countries";

// Re-export RegionId so other files can import from here
export type { RegionId } from "./countries";

// Re-export region labels and list from countries.ts
export { REGION_LABELS, REGION_LIST };

// Single canonical helper: country -> region/server
export function getRegionForCountry(code: string): RegionId {
  return getRegionForCountryFromCountries(code);
}
