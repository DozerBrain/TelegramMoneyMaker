export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

export type Card = {
  id: number;
  rarity: Rarity;
  name: string;
  image: string;
  weight: number; // drop weight
};

export const CARDS: Card[] = [
  { id: 1, rarity: "common",    name: "Common",    image: "/cards/common.png",    weight: 5120 },
  { id: 2, rarity: "uncommon",  name: "Uncommon",  image: "/cards/uncommon.png",  weight: 2930 },
  { id: 3, rarity: "rare",      name: "Rare",      image: "/cards/rare.png",      weight: 1460 },
  { id: 4, rarity: "epic",      name: "Epic",      image: "/cards/epic.png",      weight: 360  },
  { id: 5, rarity: "legendary", name: "Legendary", image: "/cards/legendary.png", weight: 100  },
  { id: 6, rarity: "mythic",    name: "Mythic",    image: "/cards/mythic.png",    weight: 7    },
  { id: 7, rarity: "ultimate",  name: "Ultimate",  image: "/cards/ultimate.png",  weight: 0.5  },
];

export function weightedPick(list: Card[]) {
  const total = list.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of list) { r -= c.weight; if (r <= 0) return c; }
  return list[0];
}
