// src/data/titles.ts

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

export type TitleSource =
  | "world"
  | "cards"
  | "creatures"
  | "event"
  | "special";

export type TitleId = string;

export type TitleDef = {
  id: TitleId;
  label: string;
  rarity: Rarity;
  source: TitleSource;
  // Optional description to show in profile / picker
  description?: string;
  // Optional world-specific data (for world titles)
  worldMinOwned?: number; // countries needed to "qualify"
};

/**
 * Central list of ALL titles in the game.
 */
export const TITLES: TitleDef[] = [
  // 🌍 WORLD TRACK (based on countries owned – 197 total)
  {
    id: "world_local_boss",
    label: "Local Boss",
    rarity: "common",
    source: "world",
    worldMinOwned: 1,
    description: "You claimed your first country.",
  },
  {
    id: "world_regional_overlord",
    label: "Regional Overlord",
    rarity: "uncommon",
    source: "world",
    worldMinOwned: 10,
    description: "You dominate your region.",
  },
  {
    id: "world_continental_ruler",
    label: "Continental Ruler",
    rarity: "rare",
    source: "world",
    worldMinOwned: 30,
    description: "You rule a continent’s worth of land.",
  },
  {
    id: "world_global_tycoon",
    label: "Global Tycoon",
    rarity: "epic",
    source: "world",
    worldMinOwned: 60,
    description: "You control a massive slice of the world economy.",
  },
  {
    id: "world_emperor",
    label: "World Emperor",
    rarity: "legendary",
    source: "world",
    worldMinOwned: 100,
    description: "Over half the world bends to your will.",
  },
  {
    id: "world_universal_legend",
    label: "Universal Legend",
    rarity: "mythic",
    source: "world",
    worldMinOwned: 150,
    description: "Your name echoes across all nations.",
  },
  {
    id: "world_multiversal_overlord",
    label: "Multiversal Overlord",
    rarity: "ultimate",
    source: "world",
    worldMinOwned: 197, // all countries
    description: "Full world domination. Nothing left to conquer.",
  },

  // 🏆 ACHIEVEMENT / PROGRESSION TITLES
  {
    id: "rookie_tapper",
    label: "Rookie Tapper",
    rarity: "common",
    source: "special",
    description: "You started your tapping journey.",
  },
  {
    id: "coupon_hoarder",
    label: "Coupon Hoarder",
    rarity: "uncommon",
    source: "special",
    description: "You love squeezing every bonus.",
  },
  {
    id: "card_collector",
    label: "Card Collector",
    rarity: "rare",
    source: "cards",
    description: "Your collection is starting to look dangerous.",
  },
  {
    id: "tap_myth",
    label: "Tap Myth",
    rarity: "legendary",
    source: "special",
    description: "Your taps are the stuff of legend.",
  },
  {
    id: "ultra_being",
    label: "Ultra Being",
    rarity: "ultimate",
    source: "special",
    description: "You exist beyond normal tapper limits.",
  },

  // 🏆 SUIT-BASED TITLES (from suit achievements)
  {
    id: "suit_millionaire_mogul",
    label: "Millionaire Mogul",
    rarity: "legendary",
    source: "special",
    description: "Unlocked when you obtain the Millionaire suit.",
  },
  {
    id: "suit_crypto_phantom",
    label: "Crypto Phantom",
    rarity: "mythic",
    source: "special",
    description: "Unlocked when you obtain the Crypto suit.",
  },

  // 🃏 Example future card title (placeholder)
  // {
  //   id: "cards_king_of_cards",
  //   label: "King of Cards",
  //   rarity: "epic",
  //   source: "cards",
  //   description: "Earned by maxing your card collection.",
  // },

  // 🐉 Example future creature title (placeholder)
  // {
  //   id: "creatures_beast_master",
  //   label: "Beast Master",
  //   rarity: "legendary",
  //   source: "creatures",
  //   description: "Earned by training your creatures to the max.",
  // },
];

export function getTitleDef(id: TitleId | null | undefined): TitleDef | undefined {
  if (!id) return undefined;
  return TITLES.find((t) => t.id === id);
}

export function getWorldTitles(): TitleDef[] {
  return TITLES.filter(
    (t) => t.source === "world" && t.worldMinOwned != null
  ).sort((a, b) => (a.worldMinOwned ?? 0) - (b.worldMinOwned ?? 0));
}
