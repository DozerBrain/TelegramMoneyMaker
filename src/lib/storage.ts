// src/lib/storage.ts

// -------- Safe get/set JSON helpers ----------
function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// -------- LEGACY KEYS (old system) ----------
const KEY_SCORE = "mm_score";
const KEY_TAP = "mm_tap";
const KEY_COLLECTION = "mm_collection";
const KEY_LAST_DROP = "mm_last_drop";

const KEYS = {
  ownedPets: "mm_owned_pets",
  equippedPet: "mm_equipped_pet",
  ownedSuits: "mm_owned_suits",
  equippedSuit: "mm_equipped_suit",
} as const;

const KEY_PROFILE = "mm_profile";
const KEY_SAVE_SNAPSHOT = "mm_save_snapshot";

// -------- TYPES ----------
export type Collection = Record<string, number>;

export type PlayerProfile = {
  username?: string;
  region?: string;
  avatar?: string;
};

// 🔥 NEW: full save structure for the whole game
export type SaveData = {
  // Legacy
  score: number;
  tap: number;
  collection: Collection;
  lastDrop: any | null;

  ownedPets: string[];
  equippedPet: string | null;
  ownedSuits: string[];
  equippedSuit: string | null;
  profile: PlayerProfile;

  // Core
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

  bestSuitName: string;

  // Long-term upgrades
  critChance: number;
  critMult: number;
  autoBonusMult: number;
  couponBoostLevel: number;
  bulkDiscountLevel: number;

  // Cards
  cards: any[];
  couponsSpent: number;

  // Casino chips
  chips: number;
  chipExchangeUsed: number; // how much exchanged today

  // Progression
  achievements: Record<string, { done: boolean; claimed: boolean }>;
  quests: any[];

  // Missions
  spinCooldownEndsAt: number | null;
};

// -------- DEFAULT SAVE ----------
export const defaultSave: SaveData = {
  // Legacy
  score: 0,
  tap: 0,
  collection: {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    ultimate: 0,
  },
  lastDrop: null,
  ownedPets: [],
  equippedPet: null,
  ownedSuits: [],
  equippedSuit: null,
  profile: { username: "Player", region: "World" },

  // Core
  balance: 0,
  totalEarnings: 0,
  taps: 0,
  tapValue: 1,
  autoPerSec: 0,
  multi: 1,

  bestSuitName: "Starter",

  // Long-term stats
  critChance: 0,
  critMult: 5,
  autoBonusMult: 1,
  couponBoostLevel: 0,
  bulkDiscountLevel: 0,

  // Cards
  cards: [],
  couponsSpent: 0,

  // Casino
  chips: 0,
  chipExchangeUsed: 0,

  // Progression
  achievements: {},
  quests: [],

  // Missions
  spinCooldownEndsAt: null,
};

// Unified save key
const FULL_SAVE_KEY = "moneymaker_full_save_v1";

// -------- CORE LOAD/SAVE --------

/** Load full SaveData (with migration from old keys) */
export function loadSave(): SaveData {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { ...defaultSave };
  }

  try {
    // Load the new format first
    const raw = localStorage.getItem(FULL_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSave,
        ...parsed,
        collection: {
          ...defaultSave.collection,
          ...(parsed.collection ?? {}),
        },
      };
    }

    // Migrate legacy
    const legacy: SaveData = {
      ...defaultSave,
      score: get(KEY_SCORE, 0),
      tap: get(KEY_TAP, 0),
      collection: get(KEY_COLLECTION, defaultSave.collection),
      lastDrop: get(KEY_LAST_DROP, null),
      ownedPets: get(KEYS.ownedPets, [] as string[]),
      equippedPet: get(KEYS.equippedPet, null),
      ownedSuits: get(KEYS.ownedSuits, [] as string[]),
      equippedSuit: get(KEYS.equippedSuit, null),
      profile: get(KEY_PROFILE, defaultSave.profile),
      // all other fields are defaults
    };

    set(FULL_SAVE_KEY, legacy);
    return legacy;
  } catch {
    return { ...defaultSave };
  }
}

/** Save full game state (merge patch) */
export function saveSave(patch: Partial<SaveData>): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;

  try {
    const prev = loadSave();
    const next: SaveData = {
      ...prev,
      ...patch,

      // merge collections
      collection: {
        ...prev.collection,
        ...(patch.collection ?? {}),
      },
    };

    localStorage.setItem(FULL_SAVE_KEY, JSON.stringify(next));

    // mirror essential legacy keys
    set(KEY_SCORE, next.score);
    set(KEY_TAP, next.tap);
    set(KEY_COLLECTION, next.collection);
    set(KEY_LAST_DROP, next.lastDrop);
    set(KEYS.ownedPets, next.ownedPets);
    set(KEYS.equippedPet, next.equippedPet);
    set(KEYS.ownedSuits, next.ownedSuits);
    set(KEYS.equippedSuit, next.equippedSuit);
    set(KEY_PROFILE, next.profile);

    // debug backup
    set(KEY_SAVE_SNAPSHOT, next);

    // notify listeners
    window.dispatchEvent(new Event("mm:save"));
  } catch {
    // ignore
  }
}

// ======= PUBLIC HELPERS =======

// SCORE & TAP
export function getScore(): number {
  return loadSave().score ?? 0;
}
export function setScore(v: number) {
  saveSave({ score: v, balance: v });
}

export function getTap(): number {
  const s = loadSave();
  return s.taps ?? s.tap ?? 0;
}
export function setTap(v: number) {
  saveSave({ taps: v, tap: v });
}

// CARDS
export function getCollection(): Collection {
  return loadSave().collection ?? defaultSave.collection;
}
export function setCollection(c: Collection) {
  saveSave({ collection: c });
}
export function setLastDrop(card: any | null) {
  saveSave({ lastDrop: card });
}
export function getLastDrop<T = any>(): T | null {
  return loadSave().lastDrop as T | null;
}

// PETS
export function getOwnedPets(): string[] {
  return loadSave().ownedPets ?? [];
}
export function setOwnedPets(ids: string[]) {
  saveSave({ ownedPets: Array.from(new Set(ids)) });
}
export function getEquippedPet(): string | null {
  return loadSave().equippedPet ?? null;
}
export function setEquippedPet(id: string | null) {
  saveSave({ equippedPet: id });
}

// SUITS
export function getOwnedSuits(): string[] {
  return loadSave().ownedSuits ?? [];
}
export function setOwnedSuits(ids: string[]) {
  saveSave({ ownedSuits: Array.from(new Set(ids)) });
}
export function getEquippedSuit(): string | null {
  return loadSave().equippedSuit ?? null;
}
export function setEquippedSuit(id: string | null) {
  saveSave({ equippedSuit: id });
}

// PROFILE
export function getProfile(): PlayerProfile {
  return loadSave().profile ?? defaultSave.profile;
}
export function setProfile(patch: Partial<PlayerProfile>) {
  const current = getProfile();
  saveSave({ profile: { ...current, ...patch } });
}

// CASINO
export function getChips(): number {
  return loadSave().chips ?? 0;
}
export function setChips(v: number) {
  saveSave({ chips: v });
}

export function getChipExchangeUsed(): number {
  return loadSave().chipExchangeUsed ?? 0;
}
export function setChipExchangeUsed(v: number) {
  saveSave({ chipExchangeUsed: v });
}

// Reset
export const StorageAPI = {
  load: loadSave,
  save: saveSave,
  reset() {
    saveSave({ ...defaultSave });
  },
};
