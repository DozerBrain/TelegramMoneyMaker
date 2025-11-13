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

// -------- SCORE & TAP ----------
const KEY_SCORE = 'mm_score';
const KEY_TAP = 'mm_tap';
export function getScore(): number { return get(KEY_SCORE, 0); }
export function setScore(v: number) { set(KEY_SCORE, v); }
export function getTap(): number { return get(KEY_TAP, 0); }
export function setTap(v: number) { set(KEY_TAP, v); }

// -------- CARDS ----------
const KEY_COLLECTION = 'mm_collection';
const KEY_LAST_DROP = 'mm_last_drop';

export type Collection = Record<string, number>;
export function getCollection(): Collection {
  return get(KEY_COLLECTION, {
    common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, ultimate: 0,
  });
}
export function setCollection(c: Collection) { set(KEY_COLLECTION, c); }
export function setLastDrop(card: any | null) { set(KEY_LAST_DROP, card); }
export function getLastDrop<T = any>(): T | null { return get(KEY_LAST_DROP, null as T | null); }

// -------- PETS + SUITS ----------
const KEYS = {
  ownedPets: 'mm_owned_pets',
  equippedPet: 'mm_equipped_pet',
  ownedSuits: 'mm_owned_suits',
  equippedSuit: 'mm_equipped_suit',
} as const;

// PETS
export function getOwnedPets(): string[] { return get(KEYS.ownedPets, [] as string[]); }
export function setOwnedPets(ids: string[]) { set(KEYS.ownedPets, Array.from(new Set(ids))); }
export function getEquippedPet(): string | null { return get(KEYS.equippedPet, null as string | null); }
export function setEquippedPet(id: string | null) { set(KEYS.equippedPet, id); }

// SUITS
export function getOwnedSuits(): string[] { return get(KEYS.ownedSuits, [] as string[]); }
export function setOwnedSuits(ids: string[]) { set(KEYS.ownedSuits, Array.from(new Set(ids))); }
export function getEquippedSuit(): string | null { return get(KEYS.equippedSuit, null as string | null); }
export function setEquippedSuit(id: string | null) { set(KEYS.equippedSuit, id); }

// -------- PROFILE ----------
export type PlayerProfile = { username?: string; region?: string; avatar?: string; };
const KEY_PROFILE = 'mm_profile';
export function getProfile(): PlayerProfile { return get(KEY_PROFILE, { username: 'Player', region: 'World' }); }
export function setProfile(patch: Partial<PlayerProfile>) {
  const p = { ...getProfile(), ...patch };
  set(KEY_PROFILE, p);
}

// ======= Legacy compatibility exports (so old imports don't crash) =======
const KEY_SAVE_SNAPSHOT = 'mm_save_snapshot';

export type SaveData = {
  score: number; tap: number; collection: Collection; lastDrop: any | null;
  ownedPets: string[]; equippedPet: string | null;
  ownedSuits: string[]; equippedSuit: string | null;
  profile: PlayerProfile;
};

export const defaultSave: SaveData = {
  score: 0, tap: 0,
  collection: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, ultimate: 0 },
  lastDrop: null,
  ownedPets: [], equippedPet: null,
  ownedSuits: [], equippedSuit: null,
  profile: { username: 'Player', region: 'World' },
};

export function loadSave(): SaveData {
  return {
    score: getScore(), tap: getTap(), collection: getCollection(), lastDrop: getLastDrop(),
    ownedPets: getOwnedPets(), equippedPet: getEquippedPet(),
    ownedSuits: getOwnedSuits(), equippedSuit: getEquippedSuit(),
    profile: getProfile(),
  };
}
export function saveSave(data: SaveData): void {
  setScore(data.score); setTap(data.tap); setCollection(data.collection); setLastDrop(data.lastDrop);
  setOwnedPets(data.ownedPets); setEquippedPet(data.equippedPet);
  setOwnedSuits(data.ownedSuits); setEquippedSuit(data.equippedSuit);
  setProfile(data.profile);
  set(KEY_SAVE_SNAPSHOT, data);
}
export const StorageAPI = { load: loadSave, save: saveSave, reset() { saveSave({ ...defaultSave }); } };
