// src/incomeMath.ts
// Central place for income math: cards, suits, pets, coupon config, world-map bonuses.

import type { Rarity as CardRarity } from "./components/CardFrame";
import { suits } from "./data/suits";
import { PETS } from "./data/pets";

/** Any card-like object that has a rarity */
export type CardLike = {
  rarity: CardRarity;
};

/** How many taps needed to earn 1 coupon (base, before bonuses) */
export const TAPS_PER_COUPON = 100;

/* -------------------------------------------------------------------------- */
/*                              CARD BONUS MATH                               */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              SUIT BONUS MATH                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns suit multiplier based on equipped suit id.
 * Uses suit.bonus from data/suits.ts
 */
export function computeSuitMult(equippedSuitId: string | null): number {
  if (!equippedSuitId) return 1;
  const suit = suits.find((s) => s.id === equippedSuitId);
  return suit?.bonus ?? 1;
}

/* -------------------------------------------------------------------------- */
/*                               PET BONUS MATH                               */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             WORLD MAP BONUSES                              */
/* -------------------------------------------------------------------------- */

/**
 * Bonuses coming from the World Map mini-game.
 * apsBonus     = flat +APS added to autoPerSec
 * couponBonus  = extra coupon bonus as fraction (0.05 = +5% coupons)
 */
export type WorldMapBonus = {
  apsBonus: number;
  couponBonus: number;
};

/**
 * Effective taps needed per coupon, including:
 * - base TAPS_PER_COUPON
 * - couponBoostLevel (each level = +10% coupon gain)
 * - world map couponBonus (sum of country bonuses, e.g. 0.05 = +5%)
 *
 * You can use this instead of manual math in App.tsx.
 */
export function computeEffectiveTapsPerCoupon(
  couponBoostLevel: number,
  worldBonus?: WorldMapBonus | null
): number {
  const worldCoupon = worldBonus?.couponBonus ?? 0; // fraction
  const totalFactor = 1 + couponBoostLevel * 0.1 + worldCoupon;

  // higher factor = more coupons, so fewer taps per coupon
  return TAPS_PER_COUPON / Math.max(totalFactor, 0.0001);
}

/**
 * Compute auto income per second (before rounding), including:
 * - base autoPerSec
 * - world map apsBonus (flat APS)
 * - all multiplicative bonuses
 */
export function computeAutoIncomePerSecond(params: {
  baseAutoPerSec: number;
  worldApsBonus?: number; // flat APS from map
  multi: number;
  autoBonusMult: number;
  suitMult: number;
  petAutoMult: number;
  cardMultAll: number;
  globalMult: number;
}): number {
  const {
    baseAutoPerSec,
    worldApsBonus = 0,
    multi,
    autoBonusMult,
    suitMult,
    petAutoMult,
    cardMultAll,
    globalMult,
  } = params;

  const effectiveBase = baseAutoPerSec + worldApsBonus;
  if (effectiveBase <= 0) return 0;

  return (
    effectiveBase *
    multi *
    autoBonusMult *
    suitMult *
    petAutoMult *
    cardMultAll *
    globalMult
  );
}

/* -------------------------------------------------------------------------- */
/*                           TAP GAIN + CRIT (OPTIONAL)                       */
/* -------------------------------------------------------------------------- */

/**
 * Central tap gain math including crit.
 * You can move Home.tsx to use this later if you like.
 */
export function computeTapGain(params: {
  tapValue: number;
  multi: number;
  suitMult: number;
  petTapMult: number;
  cardMultAll: number;
  globalMult: number;
  critChance: number; // 0.05 = 5%
  critMult: number; // e.g. 5 = x5
}): { gain: number; didCrit: boolean } {
  const {
    tapValue,
    multi,
    suitMult,
    petTapMult,
    cardMultAll,
    globalMult,
    critChance,
    critMult,
  } = params;

  const totalTapMult = multi * suitMult * petTapMult * cardMultAll * globalMult;
  const baseGain = Math.max(1, Math.floor(tapValue * totalTapMult));

  let gain = baseGain;
  let didCrit = false;

  if (critChance > 0 && Math.random() < critChance) {
    didCrit = true;
    gain = Math.max(1, Math.floor(baseGain * critMult));
  }

  return { gain, didCrit };
}