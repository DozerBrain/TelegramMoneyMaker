// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile }; // re-export so pages can `import { PlayerProfile } from '../lib/profile'`

const KEY = "mm_profile";

export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  const p: PlayerProfile = {
    uid: "local",
    name: "Player",
    country: "US",
    avatarUrl: undefined,
    // legacy aliases some pages may read
    userId: "local",
    username: "Player",
    region: "US",
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(p));
  return p;
}

export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged = { ...current, ...update, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

// legacy name used in some pages
export const saveProfile = setProfile;
