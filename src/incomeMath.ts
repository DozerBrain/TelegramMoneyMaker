// src/incomeMath.ts
// Central place for income math: cards, suits, pets, coupon config.

import type { Rarity as CardRarity } from "./components/CardFrame";
import { suits } from "./data/suits";
import { PETS } from "./data/pets";

/** Any card-like object that has a rarity */
export type CardLike = {
  rarity: CardRarity;
};

/** How many taps needed to earn 1 coupon */
export const TAPS_PER_COUPON = 100;

/* ---------- CARD BONUS MATH ---------- */
/**
 * Computes global card multiplier from all owned cards.
 * Each card of a given rarity adds some % to income.
 */
export function computeCardMultAll(cards: CardLike[]): number {
  let common = 0,
    uncommon = 0,
    rare = 0,
    epic = 0,
    legendary = 0,
    mythic = 0,
    ultimate = 0;

  for (const c of cards) {
    switch (c.rarity) {
      case "common":
        common++;
        break;
      case "uncommon":
        uncommon++;
        break;
      case "rare":
        rare++;
        break;
      case "epic":
        epic++;
        break;
      case "legendary":
        legendary++;
        break;
      case "mythic":
        mythic++;
        break;
      case "ultimate":
        ultimate++;
        break;
    }
  }

  // % bonuses per card
  const bonusPercent =
    0.5 * common +
    1.0 * uncommon +
    2.0 * rare +
    4.0 * epic +
    7.0 * legendary +
    10.0 * mythic +
    15.0 * ultimate;

  return 1 + bonusPercent / 100;
}

/* ---------- SUIT BONUS MATH ---------- */
/**
 * Returns suit multiplier based on equipped suit id.
 * Uses suit.bonus from data/suits.ts
 */
export function computeSuitMult(equippedSuitId: string | null): number {
  if (!equippedSuitId) return 1;
  const suit = suits.find((s) => s.id === equippedSuitId);
  return suit?.bonus ?? 1;
}

/* ---------- PET BONUS MATH ---------- */

export type PetMultipliers = {
  petTapMult: number;
  petAutoMult: number;
  globalMult: number;
};

/**
 * Returns tap/auto/global multipliers from equipped pet id.
 */
export function computePetMultipliers(
  equippedPetId: string | null
): PetMultipliers {
  // Defaults (no pet)
  let petTapMult = 1;
  let petAutoMult = 1;
  let globalMult = 1;

  if (!equippedPetId) {
    return { petTapMult, petAutoMult, globalMult };
  }

  const pet = PETS.find((p) => p.id === equippedPetId);
  if (!pet) {
    return { petTapMult, petAutoMult, globalMult };
  }

  switch (pet.id) {
    case "mouse":
      // +2% tap income
      petTapMult = 1.02;
      break;
    case "cat":
      // +5% effective tap power
      petTapMult = 1.05;
      break;
    case "dog":
      // +10% tap power
      petTapMult = 1.1;
      break;
    case "eagle":
      // small tap buff (quest/crit flavor)
      petTapMult = 1.05;
      break;
    case "unicorn":
      // +30% passive income
      petAutoMult = 1.3;
      break;
    case "goblin":
      // +50% tap, +10% auto
      petTapMult = 1.5;
      petAutoMult = 1.1;
      break;
    case "dragon":
      // +100% all income
      globalMult = 2.0;
      break;
  }

  return { petTapMult, petAutoMult, globalMult };
}
