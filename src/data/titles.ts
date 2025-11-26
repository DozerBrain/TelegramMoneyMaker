// src/data/titles.ts

export type TitleRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

export type TitleDef = {
  id: string;
  label: string;
  description: string;
  rarity: TitleRarity;
};

export const TITLES: TitleDef[] = [
  {
    id: "rookie_tapper",
    label: "Rookie Tapper",
    description: "You just joined the grind.",
    rarity: "common",
  },
  {
    id: "coupon_hoarder",
    label: "Coupon Hoarder",
    description: "Spent a mountain of coupons.",
    rarity: "uncommon",
  },
  {
    id: "card_collector",
    label: "Card Collector",
    description: "Built a serious card collection.",
    rarity: "rare",
  },
  {
    id: "world_explorer",
    label: "World Explorer",
    description: "Started conquering the map.",
    rarity: "epic",
  },
  {
    id: "world_emperor",
    label: "World Emperor",
    description: "Rule over a huge part of the world.",
    rarity: "legendary",
  },
  {
    id: "tap_myth",
    label: "Tap Myth",
    description: "Your total earnings are unreal.",
    rarity: "mythic",
  },
  {
    id: "ultra_being",
    label: "ULTRA Being",
    description: "Transcended normal players completely.",
    rarity: "ultimate",
  },
];

// 🔥 Rarity color system – same across game (cards, titles, future creatures)
export const TITLE_RARITY_CLASS: Record<TitleRarity, string> = {
  common: "text-zinc-300",
  uncommon: "text-emerald-300",
  rare: "text-sky-300",
  epic: "text-purple-300",
  legendary: "text-orange-300",
  mythic: "text-pink-300",
  ultimate:
    "bg-gradient-to-r from-emerald-300 via-sky-300 to-pink-300 bg-clip-text text-transparent",
};
