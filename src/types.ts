// src/types.ts
export type Tab =
  | "home"
  | "shop"
  | "missions"
  | "leaderboard"
  | "profile"
  | "inventory"
  | "cards"
  | "suits"
  | "pets"
  | "games"
  | "world";

export type Suit = {
  id: string;
  name: string;
  img: string;
  bonus: number;
  rarity:
    | "Common"
    | "Uncommon"
    | "Rare"
    | "Epic"
    | "Legendary"
    | "Mythic"
    | "Ultimate";
  unlock: number;
};

export type PlayerProfile = {
  uid: string;
  name: string;
  country: string;
  avatarUrl?: string;

  // legacy aliases some files read
  userId?: string;
  username?: string;
  region?: string;

  updatedAt: number;
};
