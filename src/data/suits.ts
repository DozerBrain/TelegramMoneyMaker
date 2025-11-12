export type Suit = { name: string; unlock: number; image: string };

export const SUITS: Suit[] = [
  { name: "Starter",     unlock: 0,          image: "/suits/starter.png" },
  { name: "Emerald",     unlock: 10_000,     image: "/suits/emerald.png" },
  { name: "Velvet",      unlock: 100_000,    image: "/suits/velvet.png" },
  { name: "Millionaire", unlock: 1_000_000,  image: "/suits/millionaire.png" },
  { name: "Crypto King", unlock: 1_000_000_000, image: "/suits/crypto.png" },
];
