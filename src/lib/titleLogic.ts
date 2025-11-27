// src/lib/titleLogic.ts
import {
  type TitleId,
  type TitleDef,
  type Rarity,
  getTitleDef,
  getWorldTitles,
} from "../data/titles";

export type TitleState = {
  unlockedTitleIds: TitleId[];
  equippedTitleId: TitleId | null;
};

export const DEFAULT_TITLE_STATE: TitleState = {
  unlockedTitleIds: [],
  equippedTitleId: null,
};

export function isTitleUnlocked(state: TitleState, id: TitleId): boolean {
  return state.unlockedTitleIds.includes(id);
}

export function unlockTitle(state: TitleState, id: TitleId): TitleState {
  if (state.unlockedTitleIds.includes(id)) return state;
  return {
    ...state,
    unlockedTitleIds: [...state.unlockedTitleIds, id],
  };
}

export function equipTitle(state: TitleState, id: TitleId | null): TitleState {
  if (id === null) {
    return { ...state, equippedTitleId: null };
  }
  if (!state.unlockedTitleIds.includes(id)) {
    // Can't equip what you don't own
    return state;
  }
  return { ...state, equippedTitleId: id };
}

export function getEquippedTitle(state: TitleState): TitleDef | undefined {
  return getTitleDef(state.equippedTitleId);
}

/**
 * Given how many world countries the player owns,
 * return the *best* world title they qualify for (or null if none).
 *
 * This is used by achievements or to auto-unlock titles,
 * but DOES NOT auto-equip them. Player still chooses.
 */
export function getBestWorldTitleForOwned(ownedCount: number): TitleDef | null {
  const list = getWorldTitles();
  let best: TitleDef | null = null;

  for (const t of list) {
    if ((t.worldMinOwned ?? Infinity) <= ownedCount) {
      best = t;
    } else {
      break;
    }
  }
  return best;
}

/**
 * Rarity → style key so UI can read it.
 * Later we can centralize these in one place if we want.
 */
export function rarityToTailwind(rarity: Rarity) {
  switch (rarity) {
    case "common":
      return {
        border: "border-zinc-500",
        fill: "bg-zinc-900",
        glow: "shadow-[0_0_18px_rgba(148,163,184,0.35)]",
      };
    case "uncommon":
      return {
        border: "border-emerald-400",
        fill: "bg-emerald-900/30",
        glow: "shadow-[0_0_18px_rgba(16,185,129,0.50)]",
      };
    case "rare":
      return {
        border: "border-sky-400",
        fill: "bg-sky-900/30",
        glow: "shadow-[0_0_18px_rgba(56,189,248,0.55)]",
      };
    case "epic":
      return {
        border: "border-purple-400",
        fill: "bg-purple-900/30",
        glow: "shadow-[0_0_22px_rgba(192,132,252,0.70)]",
      };
    case "legendary":
      return {
        border: "border-amber-300",
        fill: "bg-amber-900/25",
        glow: "shadow-[0_0_26px_rgba(252,211,77,0.90)]",
      };
    case "mythic":
      return {
        border: "border-rose-300",
        fill: "bg-rose-900/25",
        glow: "shadow-[0_0_26px_rgba(248,113,113,0.95)]",
      };
    case "ultimate":
      return {
        border: "border-fuchsia-300",
        fill: "bg-slate-950",
        glow: "shadow-[0_0_32px_rgba(244,114,182,1)]",
      };
    default:
      return {
        border: "border-zinc-500",
        fill: "bg-zinc-900",
        glow: "shadow-[0_0_18px_rgba(148,163,184,0.35)]",
      };
  }
}
