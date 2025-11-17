// src/data/regions.ts

export type RegionId =
  | "NorthAmerica"
  | "SouthAmerica"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania"
  | "MiddleEast"
  | "CIS"
  | "Unknown";

export const REGION_LABELS: Record<RegionId, string> = {
  NorthAmerica: "North America",
  SouthAmerica: "South America",
  Europe: "Europe",
  Asia: "Asia",
  Africa: "Africa",
  Oceania: "Oceania",
  MiddleEast: "Middle East",
  CIS: "CIS",
  Unknown: "World",
};

/**
 * Very simple country → region mapping.
 * We can always expand this later.
 */
export function getRegionForCountry(country: string): RegionId {
  const cc = country.toUpperCase();

  // North America
  if (["US", "CA", "MX"].includes(cc)) return "NorthAmerica";

  // South America
  if (
    [
      "BR",
      "AR",
      "CL",
      "CO",
      "PE",
      "UY",
      "PY",
      "BO",
      "VE",
      "EC",
      "GY",
      "SR",
      "GF",
    ].includes(cc)
  )
    return "SouthAmerica";

  // CIS / post-Soviet (you + neighbors)
  if (
    [
      "RU",
      "UA",
      "BY",
      "KZ",
      "KG",
      "TJ",
      "TM",
      "UZ",
      "AM",
      "AZ",
      "GE",
      "MD",
    ].includes(cc)
  )
    return "CIS";

  // Middle East
  if (
    [
      "TR",
      "AE",
      "SA",
      "QA",
      "KW",
      "OM",
      "BH",
      "JO",
      "LB",
      "SY",
      "IQ",
      "IR",
      "YE",
      "IL",
      "PS",
    ].includes(cc)
  )
    return "MiddleEast";

  // Asia (big bucket)
  if (
    [
      // East Asia
      "CN",
      "JP",
      "KR",
      "KP",
      "TW",
      "HK",
      "MO",
      "MN",
      // South Asia
      "IN",
      "PK",
      "BD",
      "LK",
      "NP",
      "BT",
      "MV",
      // SE Asia
      "TH",
      "VN",
      "KH",
      "LA",
      "MM",
      "MY",
      "SG",
      "ID",
      "PH",
      "BN",
      "TL",
    ].includes(cc)
  )
    return "Asia";

  // Europe
  if (
    [
      "DE",
      "FR",
      "IT",
      "ES",
      "PT",
      "NL",
      "BE",
      "LU",
      "IE",
      "GB",
      "SE",
      "NO",
      "FI",
      "DK",
      "PL",
      "CZ",
      "SK",
      "HU",
      "RO",
      "BG",
      "HR",
      "SI",
      "AT",
      "CH",
      "GR",
      "CY",
      "EE",
      "LV",
      "LT",
      "IS",
      "AL",
      "BA",
      "ME",
      "MK",
      "RS",
      "XK",
    ].includes(cc)
  )
    return "Europe";

  // Oceania
  if (["AU", "NZ", "PG", "FJ", "WS", "TO", "SB", "VU", "NC", "PF"].includes(cc))
    return "Oceania";

  // Africa
  if (
    [
      "ZA",
      "NG",
      "EG",
      "DZ",
      "MA",
      "TN",
      "KE",
      "UG",
      "TZ",
      "GH",
      "CI",
      "SN",
      "CM",
      "ET",
      "SD",
      "AO",
      "MZ",
      "ZW",
      "NA",
      "BW",
      "ZM",
      "MW",
      "LR",
      "SL",
      "ML",
      "BF",
      "NE",
      "TD",
      "CF",
      "CG",
      "CD",
      "BI",
      "RW",
      "SO",
      "DJ",
      "ER",
      "GM",
      "GN",
      "GW",
      "CV",
      "ST",
      "SC",
      "MU",
      "MG",
      "LS",
      "SZ",
      "BJ",
      "GA",
      "GQ",
      "KM",
    ].includes(cc)
  )
    return "Africa";

  // Fallback
  return "Unknown";
}
