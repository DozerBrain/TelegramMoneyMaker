// src/data/suits.ts
import type { Suit } from "../types";

export const SUITS: Suit[] = [
  { id: "starter", name: "Starter", unlock: 0, img: "/suits/starter.png", bonus: 1, rarity: "Common" },
  { id: "emerald", name: "Emerald", unlock: 10_000, img: "/suits/emerald.png", bonus: 2, rarity: "Rare" },
  { id: "velvet", name: "Velvet", unlock: 100_000, img: "/suits/velvet.png", bonus: 4, rarity: "Epic" },
  { id: "millionaire", name: "Millionaire", unlock: 1_000_000, img: "/suits/millionaire.png", bonus: 6, rarity: "Legendary" },
  { id: "crypto-king", name: "Crypto King", unlock: 1_000_000_000, img: "/suits/crypto.png", bonus: 10, rarity: "Mythic" },
];

// ✅ add this line only:
export const suits = SUITS;
