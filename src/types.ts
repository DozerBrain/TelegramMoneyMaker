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
  img: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Ultimate";
  bonus: number;
  unlock?: number;
};

export type PlayerProfile = {
  uid: string;
  name: string;
  country: string;
  avatarUrl?: string;
  // fields some pages are reading:
  userId: string;
  username: string;
  region: string;
  updatedAt: number;
};
