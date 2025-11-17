// src/data/countries.ts

export type CountryInfo = {
  code: string; // "US"
  name: string; // "United States"
};

export const POPULAR_COUNTRIES: CountryInfo[] = [
  { code: "US", name: "United States" },
  { code: "RU", name: "Russia" },
  { code: "TR", name: "Türkiye" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "UA", name: "Ukraine" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "MX", name: "Mexico" },
  { code: "CA", name: "Canada" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "UAE" },
  { code: "IR", name: "Iran" },
  { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PL", name: "Poland" },
];

// Turn "US" → "🇺🇸"
export function codeToFlag(code: string): string {
  const cc = (code || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return cc;

  const first = cc.charCodeAt(0) - 65 + 0x1f1e6;
  const second = cc.charCodeAt(1) - 65 + 0x1f1e6;
  return String.fromCodePoint(first, second);
}

// Get human name from code (fallback = just "US")
export function countryNameFromCode(code: string): string {
  const cc = (code || "").toUpperCase();
  const found = POPULAR_COUNTRIES.find((c) => c.code === cc);
  return found ? found.name : cc;
}
