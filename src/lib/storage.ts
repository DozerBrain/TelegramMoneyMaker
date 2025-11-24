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

// 🔥 NEW: full save structure used by App.tsx
export type SaveData = {
  // Legacy fields (still used by some parts)
  score: number;
  tap: number;
  collection: Collection;
  lastDrop: any | null;

  ownedPets: string[];
  equippedPet: string | null;
  ownedSuits: string[];
  equippedSuit: string | null;
  profile: PlayerProfile;

  // 🔥 New core game fields
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

  bestSuitName: string;

  // 🔥 Long-term upgrade stats
  critChance: number;        // 0–1 (e.g. 0.05 = 5%)
  critMult: number;          // e.g. 5 = x5
  autoBonusMult: number;     // e.g. 1.2 = +20% auto
  couponBoostLevel: number;  // integer levels
  bulkDiscountLevel: number; // integer levels

  // Casino
  chips: number;

  // Cards & coupons
  cards: any[]; // CardInstance[]
  couponsSpent: number;

  // Progression
  achievements: Record<string, { done: boolean; claimed: boolean }>;
  quests: any[];

  // Spin / misc
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

  // New core
  balance: 0,
  totalEarnings: 0,
  taps: 0,
  tapValue: 1,
  autoPerSec: 0,
  multi: 1,

  bestSuitName: "Starter",

  // Long-term upgrade stats (defaults)
  critChance: 0,
  critMult: 5,
  autoBonusMult: 1,
  couponBoostLevel: 0,
  bulkDiscountLevel: 0,

  // Casino
  chips: 0,

  // Cards & coupons
  cards: [],
  couponsSpent: 0,

  // Progression
  achievements: {},
  quests: [],

  // Spin
  spinCooldownEndsAt: null,
};

// 🔑 Single unified key for full save
const FULL_SAVE_KEY = "moneymaker_full_save_v1";

// -------- CORE SAVE LOAD/SAVE ----------

/** Load full SaveData, with migration from old split keys if needed */
export function loadSave(): SaveData {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { ...defaultSave };
  }

  try {
    // 1) Try new full-save key first
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

    // 2) No full save yet? -> Migrate from legacy separate keys
    const legacy: SaveData = {
      ...defaultSave,
      score: get(KEY_SCORE, 0),
      tap: get(KEY_TAP, 0),
      collection: get(KEY_COLLECTION, defaultSave.collection),
      lastDrop: get(KEY_LAST_DROP, null as any | null),
      ownedPets: get(KEYS.ownedPets, [] as string[]),
      equippedPet: get(KEYS.equippedPet, null as string | null),
      ownedSuits: get(KEYS.ownedSuits, [] as string[]),
      equippedSuit: get(KEYS.equippedSuit, null as string | null),
      profile: get(KEY_PROFILE, defaultSave.profile),
      // everything else uses defaults from defaultSave
    };

    set(FULL_SAVE_KEY, legacy);
    return legacy;
  } catch {
    return { ...defaultSave };
  }
}

/** Save full game state (partial allowed), merging with existing */
export function saveSave(patch: Partial<SaveData>): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    const prev = loadSave();
    const next: SaveData = {
      ...prev,
      ...patch,
      collection: {
        ...prev.collection,
        ...(patch.collection ?? {}),
      },
    };

    // Write unified save
    localStorage.setItem(FULL_SAVE_KEY, JSON.stringify(next));

    // Mirror some important values to legacy keys for compatibility
    set(KEY_SCORE, next.score);
    set(KEY_TAP, next.tap);
    set(KEY_COLLECTION, next.collection);
    set(KEY_LAST_DROP, next.lastDrop);
    set(KEYS.ownedPets, next.ownedPets);
    set(KEYS.equippedPet, next.equippedPet);
    set(KEYS.ownedSuits, next.ownedSuits);
    set(KEYS.equippedSuit, next.equippedSuit);
    set(KEY_PROFILE, next.profile);

    // Keep KEY_SAVE_SNAPSHOT as a debug/backup
    set(KEY_SAVE_SNAPSHOT, next);

    // Notify listeners
    try {
      window.dispatchEvent(new Event("mm:save"));
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

// ======= PUBLIC HELPERS (same names you already use) =======

// SCORE & TAP (now read from unified save)
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
  const profile = { ...current, ...patch };
  saveSave({ profile });
}

// Legacy-like API object (keep signature)
export const StorageAPI = {
  load: loadSave,
  save: saveSave,
  reset() {
    saveSave({ ...defaultSave });
  },
};
