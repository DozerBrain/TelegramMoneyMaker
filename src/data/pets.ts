// src/data/pets.ts
export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic"
  | "Ultimate";

export type Pet = {
  id: string;
  name: string;
  rarity: Rarity;
  img: string;      // /pets/*.png
  effect: string;   // short text shown in UI
  unlock: string;   // how to unlock (display text)
};

export const PETS: Pet[] = [
  {
    id: "mouse",
    name: "Coin Mouse",
    rarity: "Common",
    img: "/pets/mouse.png",
    effect: "+2% tap income, small coin finds",
    unlock: "Reach 100 taps",
  },
  {
    id: "cat",
    name: "Emerald Cat",
    rarity: "Uncommon",
    img: "/pets/cat.png",
    effect: "+5% chance double tap",
    unlock: "Reach 1,000 taps",
  },
  {
    id: "dog",
    name: "Cash Dog",
    rarity: "Rare",
    img: "/pets/dog.png",
    effect: "+10% tap power",
    unlock: "Reach 10,000 taps",
  },
  {
    id: "eagle",
    name: "Golden Eagle",
    rarity: "Epic",
    img: "/pets/eagle.png",
    effect: "+20% quest rewards, +5% crit",
    unlock: "Open a Legendary card",
  },
  {
    id: "unicorn",
    name: "Unicorn Pegasus",
    rarity: "Legendary",
    img: "/pets/unicorn.png",
    effect: "+30% passive income",
    unlock: "Open a Mythic card or Jackpot (Legendary)",
  },
  {
    id: "goblin",
    name: "Fourarms Goblin",
    rarity: "Mythic",
    img: "/pets/goblin.png",
    effect: "+50% tap income, 1m auto-collect",
    unlock: "Spin Jackpot (Mythic)",
  },
  {
    id: "dragon",
    name: "Crypto Dragon",
    rarity: "Ultimate",
    img: "/pets/dragon.png",
    effect: "+100% all income, Money Storm",
    unlock: "Spin Jackpot (Ultimate)",
  },
];
