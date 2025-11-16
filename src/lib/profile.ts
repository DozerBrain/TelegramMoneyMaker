// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile };

const KEY = "mm_profile";

function generateUID() {
  try {
    return crypto.randomUUID();
  } catch {
    // fallback
    return "uid_" + Math.random().toString(36).slice(2) + Date.now();
  }
}

export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}

  // ---- CREATE BRAND NEW PROFILE ----
  const uid = generateUID();

  const p: PlayerProfile = {
    uid,
    name: "Player",
    country: "US",
    avatarUrl: undefined,

    // legacy fields for the pages that still read them
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
  const merged = { ...current, ...update, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

export const saveProfile = setProfile;
