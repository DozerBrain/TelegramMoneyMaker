// src/lib/titles.ts
import { TITLES, type TitleDef } from "../data/titles";

type UnlockContext = {
  totalEarnings: number;
  taps: number;
  countriesOwned: number;
  cardsOwned: number;
  couponsSpent: number;
};

export function getTitleById(id: string | null | undefined): TitleDef | null {
  if (!id) return null;
  return TITLES.find((t) => t.id === id) ?? null;
}

/**
 * Decide which titles should be unlocked based on current stats.
 * This does NOT handle persistence – App.tsx should merge these into save.
 */
export function computeUnlockedTitles(ctx: UnlockContext): string[] {
  const result: string[] = [];

  // Always unlocked base title
  result.push("rookie_tapper");

  if (ctx.couponsSpent >= 100) {
    result.push("coupon_hoarder");
  }

  if (ctx.cardsOwned >= 50) {
    result.push("card_collector");
  }

  if (ctx.countriesOwned >= 10) {
    result.push("world_explorer");
  }

  if (ctx.countriesOwned >= 40) {
    result.push("world_emperor");
  }

  if (ctx.totalEarnings >= 1_000_000_000_000) {
    // 1T
    result.push("tap_myth");
  }

  if (ctx.totalEarnings >= 1_000_000_000_000_000) {
    // 1Q – ultra late game
    result.push("ultra_being");
  }

  // remove duplicates
  return Array.from(new Set(result));
}
