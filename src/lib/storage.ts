// src/lib/storage.ts

// -------- 🔒 Safe get/set JSON helpers ----------
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

// -------- 🧮 SCORE & TAP COUNTER ----------
const KEY_SCORE = 'mm_score';
const KEY_TAP = 'mm_tap';
export function getScore(): number {
  return get(KEY_SCORE, 0);
}
export function setScore(v: number) {
  set(KEY_SCORE, v);
}
export function getTap(): number {
  return get(KEY_TAP, 0);
}
export function setTap(v: number) {
  set(KEY_TAP, v);
}

// -------- 🎴 CARDS ----------
const KEY_COLLECTION = 'mm_collection';
const KEY_LAST_DROP = 'mm_last_drop';

// Card collection is { rarity: number }
export type Collection = Record<string, number>;

export function getCollection(): Collection {
  return get(KEY_COLLECTION, {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    ultimate: 0,
  });
}
export function setCollection(c: Collection) {
  set(KEY_COLLECTION, c);
}

export function setLastDrop(card: any | null) {
  set(KEY_LAST_DROP, card);
}
export function getLastDrop<T = any>(): T | null {
  return get(KEY_LAST_DROP, null);
}

// -------- 🐾 PETS + SUITS ----------
const KEYS = {
  ownedPets: 'mm_owned_pets',
  equippedPet: 'mm_equipped_pet',
  ownedSuits: 'mm_owned_suits',
  equippedSuit: 'mm_equipped_suit',
} as const;

// PETS
export function getOwnedPets(): string[] {
  return get(KEYS.ownedPets, [] as string[]);
}
export function setOwnedPets(ids: string[]) {
  set(KEYS.ownedPets, ids);
}
export function getEquippedPet(): string | null {
  return get(KEYS.equippedPet, null as string | null);
}
export function setEquippedPet(id: string | null) {
  set(KEYS.equippedPet, id);
}

// SUITS
export function getOwnedSuits(): string[] {
  return get(KEYS.ownedSuits, [] as string[]);
}
export function setOwnedSuits(ids: string[]) {
  set(KEYS.ownedSuits, ids);
}
export function getEquippedSuit(): string | null {
  return get(KEYS.equippedSuit, 'starter'); // default
}
export function setEquippedSuit(id: string) {
  set(KEYS.equippedSuit, id);
}
