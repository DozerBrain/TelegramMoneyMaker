// src/data/countryTraits.ts

export type CountryTrait = {
  id: string;
  name: string;
  description: string;
  icon: string; // small emoji/icon to show in UI
};

// NOTE: We don't have to define every single country here.
// If a country code is missing, we just fall back to a generic trait.
export const COUNTRY_TRAITS: Record<string, CountryTrait> = {
  US: {
    id: "us_finance",
    name: "Wall Street Engine",
    description: "Huge financial flows – boosts your late-game scaling.",
    icon: "📈",
  },
  CA: {
    id: "ca_stable",
    name: "Stable Economy",
    description: "Slow and steady – reliable APS support.",
    icon: "🧊",
  },
  BR: {
    id: "br_energy",
    name: "Raw Energy",
    description: "Explosive growth, but a bit volatile.",
    icon: "🔥",
  },
  RU: {
    id: "ru_power",
    name: "Resource Giant",
    description: "Massive resources – big but risky boosts.",
    icon: "⚡",
  },
  DE: {
    id: "de_industry",
    name: "Industrial Precision",
    description: "Efficient machinery – stronger auto-income.",
    icon: "🏭",
  },
  FR: {
    id: "fr_culture",
    name: "Cultural Magnet",
    description: "Attracts wealth from everywhere over time.",
    icon: "🎭",
  },
  GB: {
    id: "gb_banking",
    name: "Banking Empire",
    description: "Old money, strong compound effects.",
    icon: "🏦",
  },
  CN: {
    id: "cn_mass",
    name: "Massive Market",
    description: "Insane scaling when your numbers get huge.",
    icon: "🐉",
  },
  JP: {
    id: "jp_tech",
    name: "Tech Innovator",
    description: "High-tech tricks – supports crit & combos.",
    icon: "🤖",
  },
  IN: {
    id: "in_growth",
    name: "Hyper Growth",
    description: "Early game is slower, late game explodes.",
    icon: "🌱",
  },
  AU: {
    id: "au_lucky",
    name: "Lucky Continent",
    description: "Slightly more luck on random systems.",
    icon: "🍀",
  },
  // ... you can add more specific country traits over time
};

// Fallback trait if we don't have a specific entry
export const DEFAULT_COUNTRY_TRAIT: CountryTrait = {
  id: "default_growth",
  name: "Growing Market",
  description: "Adds to your global power in subtle ways.",
  icon: "🌍",
};
