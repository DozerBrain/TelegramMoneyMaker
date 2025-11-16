// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile };

const KEY = "mm_profile";

/** Short numeric UID: 1..99,999,999 (max 8 digits) */
function makeUid(): string {
  const n = Math.floor(Math.random() * 99_999_999) + 1;
  return String(n);
}

/** Try to enrich profile with Telegram WebApp user (name + photo) */
function applyTelegram(profile: PlayerProfile): PlayerProfile {
  try {
    const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser) return profile;

    const p = { ...profile };

    // Fill name only if it's still generic
    if ((!p.name || p.name === "Player") && tgUser.first_name) {
      const last = tgUser.last_name ? ` ${tgUser.last_name}` : "";
      p.name = `${tgUser.first_name}${last}`;
    }

    // Avatar
    if (!p.avatarUrl && tgUser.photo_url) {
      p.avatarUrl = tgUser.photo_url;
    }

    return p;
  } catch {
    return profile;
  }
}

export function getProfile(): PlayerProfile {
  let p: PlayerProfile | null = null;

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      p = JSON.parse(raw) as PlayerProfile;
    }
  } catch {
    p = null;
  }

  // If nothing or broken, create a new profile
  if (!p || typeof p !== "object") {
    p = {
      uid: makeUid(),
      userId: "",         // will be filled below
      name: "Player",
      username: "Player",
      country: "US",
      region: "US",
      avatarUrl: undefined,
      updatedAt: Date.now(),
    };
  }

  // ✅ IMPORTANT: never change an existing UID
  if (!p.uid) {
    p.uid = makeUid();
  }

  // Keep legacy aliases in sync
  p.userId = p.userId || p.uid;
  p.username = p.username || p.name || "Player";
  p.country = p.country || (p as any).region || "US";
  p.region = p.region || p.country || "US";
  p.updatedAt = p.updatedAt || Date.now();

  // Add Telegram name/photo if available
  const withTelegram = applyTelegram(p);

  localStorage.setItem(KEY, JSON.stringify(withTelegram));
  return withTelegram;
}

export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged: PlayerProfile = {
    ...current,
    ...update,
    updatedAt: Date.now(),
  };

  // Do NOT touch uid here – keep it stable
  merged.userId = merged.userId || merged.uid;
  merged.username = merged.username || merged.name || "Player";
  merged.region = merged.region || merged.country || "US";

  localStorage.setItem(KEY, JSON.stringify(merged));
}

// legacy alias
export const saveProfile = setProfile;
