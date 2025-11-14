// src/lib/profile.ts
import { PlayerProfile } from "../types/player";

const KEY = "mm_profile";

/**
 * Load the saved player profile or create a default one.
 */
export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      // return directly if valid
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // fall through to default
  }

  const defaultProfile: PlayerProfile = {
    uid: "local",
    name: "Player",
    country: "US",
    avatarUrl: undefined,
    // aliases for backward compatibility
    userId: "local",
    username: "Player",
    region: "US",
    updatedAt: Date.now(),
  };

  localStorage.setItem(KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

/**
 * Replace or update the profile in localStorage.
 * If you only want to update certain fields, pass partial.
 */
export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged = { ...current, ...update, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(merged));
}
