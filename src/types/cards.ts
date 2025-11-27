// src/types/cards.ts
import type { Rarity as CardRarity } from "../components/CardFrame";

export type CardInstance = {
  id: string;
  rarity: CardRarity;
  serial: string;
  obtainedAt: number;
};
