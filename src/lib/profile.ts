// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile };

const KEY = "mm_profile";

/**
 * Try to read Telegram WebApp user (if running inside Telegram).
 */
function readTelegramUser() {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (!user) return null;
    return user as {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  } catch {
    return null;
  }
}

/**
 * Main profile getter.
 *
 * Priority:
 *   1) existing saved profile (non-"local" uid)
 *   2) Telegram user data (if available)
 *   3) fallback "local" guest profile
 */
export function getProfile(): PlayerProfile {
  let existing: PlayerProfile | null = null;

  // 1) Try to read existing profile from localStorage
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      existing = JSON.parse(raw) as PlayerProfile;
    }
  } catch {
    existing = null;
  }

  // If we already have a non-local UID, just return it
  if (existing && existing.uid && existing.uid !== "local") {
    return existing;
  }

  // 2) Try Telegram user
  const tgUser = readTelegramUser();
  if (tgUser) {
    const fullUid = String(tgUser.id); // keep full for uniqueness
    const displayName =
      (tgUser.first_name || "") +
        (tgUser.last_name ? ` ${tgUser.last_name}` : "") ||
      tgUser.username ||
      existing?.name ||
      "Player";

    const profile: PlayerProfile = {
      uid: fullUid,
      userId: fullUid,
      // what we show in UI can be a shortened ID if you want:
      // shortId: fullUid.slice(-8),
      name: displayName,
      username: tgUser.username ?? existing?.username,
      avatarUrl: tgUser.photo_url || existing?.avatarUrl,
      country: existing?.country || "US",
      region: existing?.region || existing?.country || "US",
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {
      // ignore write errors
    }

    return profile;
  }

  // 3) Fallback: guest "local" profile
  const fallback: PlayerProfile = {
    uid: "local",
    userId: "local",
    name: existing?.name || "Player",
    username: existing?.username,
    avatarUrl: existing?.avatarUrl,
    country: existing?.country || "US",
    region: existing?.region || existing?.country || "US",
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(fallback));
  } catch {
    // ignore
  }

  return fallback;
}

/**
 * Save / update profile fields, but do NOT randomly change uid.
 * If you pass an explicit `uid`, we keep it; otherwise we keep current uid.
 */
export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged: PlayerProfile = {
    ...current,
    ...update,
    uid: update.uid ?? current.uid,
    userId: update.userId ?? current.userId ?? current.uid,
    country: update.country ?? current.country ?? "US",
    region: update.region ?? current.region ?? current.country ?? "US",
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

// Legacy alias some pages might still import
export const saveProfile = setProfile;
