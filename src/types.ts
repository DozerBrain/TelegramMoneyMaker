// src/types.ts
export type Tab =
  | "home"
  | "shop"
  | "spin"
  | "leaderboard"
  | "profile"
  | "pets"
  | "suits"
  | "more";

export type Suit = {
  id: string;
  name: string;
  img: string; // image path
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Ultimate";
  bonus: number; // e.g., +3 means +3%
  unlock?: number; // optional: some UIs show an unlock price
};
