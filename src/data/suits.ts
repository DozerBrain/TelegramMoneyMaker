export type Suit = {
  id: string;
  name: string;
  unlock: number;          // cost
  img: string;             // /suits/<file>.png
  bonus: number;           // multiplier
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
};

export const suits: Suit[] = [
  { id: "starter",     name: "Starter",     unlock: 0,        img: "/suits/starter.png",     bonus: 1,   rarity: "Common" },
  { id: "emerald",     name: "Emerald",     unlock: 10_000,   img: "/suits/emerald.png",     bonus: 2,   rarity: "Rare" },
  { id: "velvet",      name: "Velvet",      unlock: 100_000,  img: "/suits/velvet.png",      bonus: 3,   rarity: "Epic" },
  { id: "millionaire", name: "Millionaire", unlock: 1_000_000,img: "/suits/millionaire.png", bonus: 4,   rarity: "Epic" },
  { id: "crypto",      name: "Crypto",      unlock: 5_000_000,img: "/suits/crypto.png",      bonus: 5,   rarity: "Legendary" },
];
