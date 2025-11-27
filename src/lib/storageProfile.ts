// src/lib/storageProfile.ts
import { loadSave, saveSave, defaultSave, type PlayerProfile } from "./storageCore";

// PROFILE
export function getProfile(): PlayerProfile {
  return loadSave().profile ?? defaultSave.profile;
}

export function setProfile(patch: Partial<PlayerProfile>) {
  const current = getProfile();
  const profile = { ...current, ...patch };
  saveSave({ profile });
}
