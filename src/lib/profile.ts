// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile }; // so other files can: import { PlayerProfile } from "../lib/profile";

const KEY = "mm_profile";

/**
 * Generate a short numeric UID from 1 to 99,999,999 (max 8 digits).
 * Examples: "7", "48291", "90012345"
 */
function makeUid(): string {
  const n = Math.floor(Math.random() * 99_999_999) + 1;
  return String(n);
}

/**
 * Load player profile from localStorage.
 * If missing or broken -> create a fresh one with a short numeric UID.
 */
export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;

      // --- Fix / migrate old profiles ---
      // If UID missing or "local", assign a fresh short numeric UID
      if (!parsed.uid || parsed.uid === "local") {
        parsed.uid = makeUid();
      }

      // Legacy aliases (for older code)
      parsed.userId = parsed.userId || parsed.uid;
      parsed.username = parsed.username || parsed.name || "Player";
      parsed.country = parsed.country || (parsed as any).region || "US";
      parsed.region = parsed.region || parsed.country || "US";
      parsed.updatedAt = parsed.updatedAt || Date.now();

      localStorage.setItem(KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch {
    // fall through to create a new profile
  }

  // --- First-time player: create default profile ---
  const uid = makeUid();
  const p: PlayerProfile = {
    uid,
    userId: uid,
    name: "Player",
    username: "Player",
    country: "US",
    region: "US",
    avatarUrl: undefined,
    updatedAt: Date.now(),
  };

  localStorage.setItem(KEY, JSON.stringify(p));
  return p;
}

/**
 * Update and save profile.
 * You can pass partial fields: setProfile({ name: "Dozer Brain" })
 */
export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged: PlayerProfile = {
    ...current,
    ...update,
    updatedAt: Date.now(),
  };

  // Keep aliases in sync
  merged.userId = merged.userId || merged.uid;
  merged.username = merged.username || merged.name || "Player";
  merged.region = merged.region || merged.country || "US";

  localStorage.setItem(KEY, JSON.stringify(merged));
}

// Legacy name some files might import
export const saveProfile = setProfile;
