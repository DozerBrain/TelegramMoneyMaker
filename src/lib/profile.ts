// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile };

const KEY = "mm_profile";

/** Generate a short numeric UID (6–8 digits) once per device */
function generateShortUid(): string {
  const min = 100000; // 6 digits
  const max = 99999999; // up to 8 digits
  const n = Math.floor(min + Math.random() * (max - min));
  return String(n);
}

export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      if (parsed && typeof parsed === "object") {
        // If old profile had 'local' or missing uid → upgrade once
        if (!parsed.uid || parsed.uid === "local") {
          const newUid = generateShortUid();
          parsed.uid = newUid;
          parsed.userId = newUid;
          parsed.region = parsed.region || parsed.country || "US";
          parsed.updatedAt = Date.now();
          localStorage.setItem(KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch {
    // ignore and create new below
  }

  // First-time profile creation
  const uid = generateShortUid();
  const p: PlayerProfile = {
    uid,
    name: "Player",
    country: "US",
    avatarUrl: undefined,
    userId: uid,
    username: "Player",
    region: "US",
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(p));
  return p;
}

export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();

  // IMPORTANT: never change uid here
  const merged: PlayerProfile = {
    ...current,
    ...update,
    uid: current.uid,
    userId: current.userId || current.uid,
    region: update.region || current.region || current.country || "US",
    updatedAt: Date.now(),
  };

  localStorage.setItem(KEY, JSON.stringify(merged));
}

// legacy alias
export const saveProfile = setProfile;
