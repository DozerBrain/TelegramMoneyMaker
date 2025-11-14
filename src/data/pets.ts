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
  unlock: string;   // how to unlock
};

export const PETS: Pet[] = [
  { id: "mouse",   name: "Coin Mouse",      rarity: "Common",    img: "/pets/mouse.png",   effect: "+2% tap income, small coin finds", unlock: "Start playing" },
  { id: "cat",     name: "Emerald Cat",     rarity: "Uncommon",  img: "/pets/cat.png",     effect: "+5% chance double tap",            unlock: "Reach 1,000 coins" },
  { id: "dog",     name: "Cash Dog",        rarity: "Rare",      img: "/pets/dog.png",     effect: "+10% tap power",                    unlock: "Open a Rare card" },
  { id: "eagle",   name: "Golden Eagle",    rarity: "Epic",      img: "/pets/eagle.png",   effect: "+20% quest rewards, +5% crit",      unlock: "Open an Epic card" },
  { id: "unicorn", name: "Unicorn Pegasus", rarity: "Legendary", img: "/pets/unicorn.png", effect: "+30% passive income",               unlock: "Spin jackpot (Legendary)" },
  { id: "goblin",  name: "Fourarms Goblin", rarity: "Mythic",    img: "/pets/goblin.png",  effect: "+50% tap income, 1m auto-collect",  unlock: "Spin jackpot (Mythic)" },
  { id: "dragon",  name: "Crypto Dragon",   rarity: "Ultimate",  img: "/pets/dragon.png",  effect: "+100% all income, Money Storm",     unlock: "Spin jackpot (Ultimate)" },
];
