// src/lib/storage.ts
import { initialAchievementState } from "../data/achievements";

const KEY = "moneymaker:save:v1";

export type SaveData = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number; // global multiplier
  bestSuitName: string;
  spinCooldownEndsAt: number | null;
  quests: Record<string, { done: boolean; claimed: boolean }>;
  achievements: Record<string, { done: boolean; claimed: boolean }>;
};

export const defaultSave: SaveData = {
  balance: 0,
  totalEarnings: 0,
  taps: 0,
  tapValue: 1,
  autoPerSec: 0,
  multi: 1,
  bestSuitName: "Starter",
  spinCooldownEndsAt: null,
  quests: {
    first100: { done: false, claimed: false },
    first1k: { done: false, claimed: false },
    first10k: { done: false, claimed: false },
  },
  achievements: initialAchievementState(),
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave;
    const parsed = JSON.parse(raw) as SaveData;

    // Merge with defaults to include any newly added achievements
    return {
      ...defaultSave,
      ...parsed,
      achievements: { ...initialAchievementState(), ...(parsed.achievements ?? {}) },
      quests: { ...defaultSave.quests, ...(parsed.quests ?? {}) },
    };
  } catch {
    return defaultSave;
  }
}

export function saveSave(data: SaveData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetSave() {
  localStorage.removeItem(KEY);
}
