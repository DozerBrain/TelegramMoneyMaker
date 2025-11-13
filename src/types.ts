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
  img: string; // path to image
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" | "Ultimate";
  bonus: number; // e.g., +3 means +3%
};

// (optional but recommended, used by leaderboard/profile)
export type PlayerProfile = {
  uid: string;
  name: string;
  country: string;
  avatarUrl?: string;
  // compat fields some files referenced earlier:
  userId?: string;
  username?: string;
  region?: string;
  updatedAt: number;
};
