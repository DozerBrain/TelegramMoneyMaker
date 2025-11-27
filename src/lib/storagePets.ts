// src/lib/storagePets.ts
import { loadSave, saveSave } from "./storageCore";

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
