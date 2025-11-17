// src/data/regions.ts

export type RegionId =
  | "NorthAmerica"
  | "SouthAmerica"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania"
  | "CIS"
  | "MENA"
  | "Unknown";

export const REGION_LABELS: Record<RegionId, string> = {
  NorthAmerica: "North America",
  SouthAmerica: "South America",
  Europe: "Europe",
  Asia: "Asia",
  Africa: "Africa",
  Oceania: "Oceania",
  CIS: "CIS",
  MENA: "Middle East & North Africa",
  Unknown: "Other",
};

// order for chips
export const REGION_LIST: RegionId[] = [
  "NorthAmerica",
  "SouthAmerica",
  "Europe",
  "CIS",
  "MENA",
  "Asia",
  "Africa",
  "Oceania",
  "Unknown",
];

// Very rough mapping: country code -> region
const COUNTRY_REGION: Record<string, RegionId> = {
  // North America
  US: "NorthAmerica",
  CA: "NorthAmerica",
  MX: "NorthAmerica",

  // South America
  BR: "SouthAmerica",
  AR: "SouthAmerica",
  CL: "SouthAmerica",
  CO: "SouthAmerica",
  PE: "SouthAmerica",
  VE: "SouthAmerica",
  UY: "SouthAmerica",
  PY: "SouthAmerica",
  BO: "SouthAmerica",
  EC: "SouthAmerica",

  // Europe
  GB: "Europe",
  FR: "Europe",
  DE: "Europe",
  IT: "Europe",
  ES: "Europe",
  PT: "Europe",
  NL: "Europe",
  BE: "Europe",
  PL: "Europe",
  CZ: "Europe",
  SK: "Europe",
  AT: "Europe",
  CH: "Europe",
  SE: "Europe",
  NO: "Europe",
  FI: "Europe",
  DK: "Europe",
  IE: "Europe",
  HU: "Europe",
  RO: "Europe",
  BG: "Europe",
  GR: "Europe",
  RS: "Europe",
  HR: "Europe",

  // CIS (post-Soviet)
  RU: "CIS",
  UA: "CIS",
  KZ: "CIS",
  BY: "CIS",
  UZ: "CIS",
  KG: "CIS",
  TJ: "CIS",
  TM: "CIS",
  AZ: "CIS",
  AM: "CIS",
  GE: "CIS",
  MD: "CIS",

  // MENA
  TR: "MENA",
  SA: "MENA",
  AE: "MENA",
  QA: "MENA",
  BH: "MENA",
  KW: "MENA",
  OM: "MENA",
  IR: "MENA",
  IQ: "MENA",
  JO: "MENA",
  LB: "MENA",
  SY: "MENA",
  EG: "MENA",
  MA: "MENA",
  DZ: "MENA",
  TN: "MENA",
  LY: "MENA",
  YE: "MENA",

  // Asia (rest)
  IN: "Asia",
  PK: "Asia",
  BD: "Asia",
  LK: "Asia",
  NP: "Asia",
  CN: "Asia",
  JP: "Asia",
  KR: "Asia",
  TH: "Asia",
  VN: "Asia",
  ID: "Asia",
  MY: "Asia",
  SG: "Asia",
  PH: "Asia",
  HK: "Asia",
  TW: "Asia",

  // Africa (rest)
  NG: "Africa",
  ZA: "Africa",
  KE: "Africa",
  GH: "Africa",
  ET: "Africa",
  TZ: "Africa",
  UG: "Africa",

  // Oceania
  AU: "Oceania",
  NZ: "Oceania",
};

export function getRegionForCountry(code: string): RegionId {
  const cc = (code || "").toUpperCase();
  return COUNTRY_REGION[cc] || "Unknown";
}
