// src/components/cards/cardConfig.ts
import type { Rarity } from "../CardFrame";

/** Art paths for each rarity */
export const ART: Record<Rarity, string> = {
  common: "/cards/common.png",
  uncommon: "/cards/uncommon.png",
  rare: "/cards/rare.png",
  epic: "/cards/epic.png",
  legendary: "/cards/legendary.png",
  mythic: "/cards/mythic.png",
  ultimate: "/cards/ultimate.png",
};

/** Serial prefixes */
const PREFIX: Record<Rarity, string> = {
  common: "CM",
  uncommon: "UC",
  rare: "RR",
  epic: "EP",
  legendary: "LG",
  mythic: "MY",
  ultimate: "UL",
};

/** Generate the next serial number for a rarity */
export function nextSerial(r: Rarity) {
  const key = `mm_serial_${r}`;
  const n = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  return `#${PREFIX[r]}-${String(n).padStart(4, "0")} | MNYMKR v1.0`;
}

/** Drop table (sum ~100%) */
export type DropRow = { r: Rarity; p: number };

export const DROPS: DropRow[] = [
  { r: "ultimate", p: 0.005 },
  { r: "mythic", p: 0.07 },
  { r: "legendary", p: 1.0 },
  { r: "epic", p: 3.6 },
  { r: "rare", p: 14.6 },
  { r: "uncommon", p: 29.3 },
  { r: "common", p: 51.2 },
];

/** Roll one rarity using the drop table */
export function rollRarity(): Rarity {
  const x = Math.random() * 100;
  let acc = 0;
  for (const row of DROPS) {
    acc += row.p;
    if (x <= acc) return row.r;
  }
  return "common";
}

/** Rarity ordering + labels used in the collection UI */
export const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "ultimate",
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  ultimate: "Ultimate",
};
