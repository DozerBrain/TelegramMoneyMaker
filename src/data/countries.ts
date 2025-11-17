// src/data/countries.ts

export type RegionId =
  | "NA"   // North America
  | "SA"   // South America
  | "EU"   // Europe
  | "CIS"  // CIS / Post-Soviet
  | "MENA" // Middle East & North Africa
  | "AF"   // Sub-Saharan Africa
  | "AS"   // Asia & Pacific
  | "OC";  // Oceania

export type CountryCode = string;

export type Country = {
  code: CountryCode;   // "US"
  name: string;        // "United States"
  flag: string;        // "🇺🇸"
  region: RegionId;    // "NA"
};

// High-level regions for UI pills
export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "NA", label: "North America" },
  { id: "SA", label: "South America" },
  { id: "EU", label: "Europe" },
  { id: "CIS", label: "CIS" },
  { id: "MENA", label: "MENA" },
  { id: "AF", label: "Africa" },
  { id: "AS", label: "Asia" },
  { id: "OC", label: "Oceania" },
];

// For quick mapping id -> human label
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

// Simple list used for region picker
export const REGION_LIST: RegionId[] = ["NA", "SA", "EU", "CIS", "MENA", "AF", "AS", "OC"];

// 🔥 Full list of countries (UN members + a few extra like Taiwan / Palestine)
export const COUNTRIES: Country[] = [
  // --- North America (NA) ---
  { code: "US", name: "United States", flag: "🇺🇸", region: "NA" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "NA" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", region: "NA" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", region: "NA" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", region: "NA" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", region: "NA" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", region: "NA" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", region: "NA" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", region: "NA" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", region: "NA" },
  { code: "PA", name: "Panama", flag: "🇵🇦", region: "NA" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", region: "NA" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", region: "NA" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", region: "NA" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", region: "NA" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", region: "NA" },
  { code: "GD", name: "Grenada", flag: "🇬🇩", region: "NA" },
  { code: "HT", name: "Haiti", flag: "🇭🇹", region: "NA" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", region: "NA" },
  { code: "KN", name: "Saint Kitts and Nevis", flag: "🇰🇳", region: "NA" },
  { code: "LC", name: "Saint Lucia", flag: "🇱🇨", region: "NA" },
  { code: "VC", name: "Saint Vincent and the Grenadines", flag: "🇻🇨", region: "NA" },
  { code: "TT", name: "Trinidad and Tobago", flag: "🇹🇹", region: "NA" },

  // --- South America (SA) ---
  { code: "AR", name: "Argentina", flag: "🇦🇷", region: "SA" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", region: "SA" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "SA" },
  { code: "CL", name: "Chile", flag: "🇨🇱", region: "SA" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", region: "SA" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", region: "SA" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", region: "SA" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", region: "SA" },
  { code: "PE", name: "Peru", flag: "🇵🇪", region: "SA" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", region: "SA" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", region: "SA" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", region: "SA" },

  // --- Europe (EU) ---
  { code: "AL", name: "Albania", flag: "🇦🇱", region: "EU" },
  { code: "AD", name: "Andorra", flag: "🇦🇩", region: "EU" },
  { code: "AT", name: "Austria", flag: "🇦🇹", region: "EU" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", region: "EU" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", region: "EU" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", region: "EU" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", region: "EU" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", region: "EU" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", region: "EU" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", region: "EU" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", region: "EU" },
  { code: "FI", name: "Finland", flag: "🇫🇮", region: "EU" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "EU" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "EU" },
  { code: "GR", name: "Greece", flag: "🇬🇷", region: "EU" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", region: "EU" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", region: "EU" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", region: "EU" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "EU" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", region: "EU" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", region: "EU" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", region: "EU" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", region: "EU" },
  { code: "MT", name: "Malta", flag: "🇲🇹", region: "EU" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", region: "EU" },
  { code: "MC", name: "Monaco", flag: "🇲🇨", region: "EU" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", region: "EU" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "EU" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", region: "EU" },
  { code: "NO", name: "Norway", flag: "🇳🇴", region: "EU" },
  { code: "PL", name: "Poland", flag: "🇵🇱", region: "EU" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "EU" },
  { code: "RO", name: "Romania", flag: "🇷🇴", region: "EU" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", region: "EU" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", region: "EU" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", region: "EU" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", region: "EU" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "EU" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "EU" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", region: "EU" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", region: "EU" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "EU" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", region: "EU" },

  // --- CIS (CIS) ---
  { code: "RU", name: "Russia", flag: "🇷🇺", region: "CIS" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", region: "CIS" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", region: "CIS" },
  { code: "KG", name: "Kyrgyzstan", flag: "🇰🇬", region: "CIS" },
  { code: "TJ", name: "Tajikistan", flag: "🇹🇯", region: "CIS" },
  { code: "TM", name: "Turkmenistan", flag: "🇹🇲", region: "CIS" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", region: "CIS" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", region: "CIS" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", region: "CIS" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", region: "CIS" },

  // --- MENA (MENA) ---
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "MENA" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", region: "MENA" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", region: "MENA" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", region: "MENA" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "MENA" },
  { code: "EH", name: "Western Sahara", flag: "🇪🇭", region: "MENA" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", region: "MENA" },
  { code: "IL", name: "Israel", flag: "🇮🇱", region: "MENA" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", region: "MENA" },
  { code: "IR", name: "Iran", flag: "🇮🇷", region: "MENA" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", region: "MENA" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", region: "MENA" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", region: "MENA" },
  { code: "LY", name: "Libya", flag: "🇱🇾", region: "MENA" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", region: "MENA" },
  { code: "OM", name: "Oman", flag: "🇴🇲", region: "MENA" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", region: "MENA" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "MENA" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "MENA" },
  { code: "SD", name: "Sudan", flag: "🇸🇩", region: "MENA" },
  { code: "SY", name: "Syria", flag: "🇸🇾", region: "MENA" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", region: "MENA" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", region: "MENA" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", region: "MENA" },

  // --- Sub-Saharan Africa (AF) ---
  { code: "AO", name: "Angola", flag: "🇦🇴", region: "AF" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", region: "AF" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", region: "AF" },
  { code: "BJ", name: "Benin", flag: "🇧🇯", region: "AF" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", region: "AF" },
  { code: "CD", name: "Congo (DRC)", flag: "🇨🇩", region: "AF" },
  { code: "CF", name: "Central African Republic", flag: "🇨🇫", region: "AF" },
  { code: "CG", name: "Congo (Republic)", flag: "🇨🇬", region: "AF" },
  { code: "CI", name: "Côte d’Ivoire", flag: "🇨🇮", region: "AF" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", region: "AF" },
  { code: "CV", name: "Cabo Verde", flag: "🇨🇻", region: "AF" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", region: "AF" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", region: "AF" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", region: "AF" },
  { code: "GM", name: "Gambia", flag: "🇬🇲", region: "AF" },
  { code: "GN", name: "Guinea", flag: "🇬🇳", region: "AF" },
  { code: "GQ", name: "Equatorial Guinea", flag: "🇬🇶", region: "AF" },
  { code: "GW", name: "Guinea-Bissau", flag: "🇬🇼", region: "AF" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", region: "AF" },
  { code: "KM", name: "Comoros", flag: "🇰🇲", region: "AF" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", region: "AF" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", region: "AF" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", region: "AF" },
  { code: "ML", name: "Mali", flag: "🇲🇱", region: "AF" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", region: "AF" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", region: "AF" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", region: "AF" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", region: "AF" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", region: "AF" },
  { code: "NE", name: "Niger", flag: "🇳🇪", region: "AF" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "AF" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", region: "AF" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", region: "AF" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", region: "AF" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", region: "AF" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", region: "AF" },
  { code: "SS", name: "South Sudan", flag: "🇸🇸", region: "AF" },
  { code: "ST", name: "São Tomé and Príncipe", flag: "🇸🇹", region: "AF" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", region: "AF" },
  { code: "TD", name: "Chad", flag: "🇹🇩", region: "AF" },
  { code: "TG", name: "Togo", flag: "🇹🇬", region: "AF" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", region: "AF" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", region: "AF" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "AF" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", region: "AF" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", region: "AF" },

  // --- Asia & Pacific (AS) ---
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", region: "AS" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", region: "AS" },
  { code: "BN", name: "Brunei", flag: "🇧🇳", region: "AS" },
  { code: "BT", name: "Bhutan", flag: "🇧🇹", region: "AS" },
  { code: "CN", name: "China", flag: "🇨🇳", region: "AS" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", region: "AS" },
  { code: "MO", name: "Macau", flag: "🇲🇴", region: "AS" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", region: "AS" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", region: "AS" },
  { code: "IN", name: "India", flag: "🇮🇳", region: "AS" },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "AS" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭", region: "AS" },
  { code: "KP", name: "North Korea", flag: "🇰🇵", region: "AS" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", region: "AS" },
  { code: "LA", name: "Laos", flag: "🇱🇦", region: "AS" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", region: "AS" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", region: "AS" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", region: "AS" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", region: "AS" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", region: "AS" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", region: "AS" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", region: "AS" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "AS" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", region: "AS" },
  { code: "TL", name: "Timor-Leste", flag: "🇹🇱", region: "AS" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", region: "AS" },

  // --- Oceania (OC) ---
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "OC" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", region: "OC" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", region: "OC" },
  { code: "MH", name: "Marshall Islands", flag: "🇲🇭", region: "OC" },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", region: "OC" },
  { code: "NR", name: "Nauru", flag: "🇳🇷", region: "OC" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", region: "OC" },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", region: "OC" },
  { code: "PW", name: "Palau", flag: "🇵🇼", region: "OC" },
  { code: "SB", name: "Solomon Islands", flag: "🇸🇧", region: "OC" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", region: "OC" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", region: "OC" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", region: "OC" },
  { code: "WS", name: "Samoa", flag: "🇼🇸", region: "OC" },
];

// 👉 For now, POPULAR_COUNTRIES = all countries
export const POPULAR_COUNTRIES = COUNTRIES;

// Helper: get region for a country code
export function getRegionForCountry(code: string): RegionId {
  const cc = (code || "US").toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  if (found) return found.region;
  // default fallback
  return "NA";
}

// Helper: flag from country code
export function codeToFlag(code: string): string {
  const cc = (code || "US").toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  return found?.flag ?? "🏳️";
}

// Helper: full name from country code
export function countryNameFromCode(code: string): string {
  const cc = (code || "US").toUpperCase();
  const found = COUNTRIES.find((c) => c.code === cc);
  return found?.name ?? cc;
}
