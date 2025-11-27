// src/lib/storageSuits.ts
import { loadSave, saveSave } from "./storageCore";

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
