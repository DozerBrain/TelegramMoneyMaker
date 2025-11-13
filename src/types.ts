// src/types.ts
export type Tab =
  | "home"
  | "profile"
  | "leaderboard"
  | "shop"
  | "pets"
  | "suits"
  | "more";

export type Suit = {
  id: string;
  name: string;
  img: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Ultimate";
  bonus: number; // e.g. +3 means +3% or whatever your game logic uses
};
