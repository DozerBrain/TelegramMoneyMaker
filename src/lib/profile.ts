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
 * Order:
 *   1) existing saved profile with non-"local" uid
 *   2) Telegram user (if available)
 *   3) fallback "local" guest profile
 */
export function getProfile(): PlayerProfile {
  let existing: PlayerProfile | null = null;

  // 1) read saved profile
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) existing = JSON.parse(raw) as PlayerProfile;
  } catch {
    existing = null;
  }

  if (existing && existing.uid && existing.uid !== "local") {
    return existing;
  }

  // 2) try Telegram
  const tgUser = readTelegramUser();
  if (tgUser) {
    const fullUid = String(tgUser.id);
    const fullName =
      (tgUser.first_name || "") +
        (tgUser.last_name ? ` ${tgUser.last_name}` : "") || "";
    const displayName =
      fullName || tgUser.username || existing?.name || "Player";

    const profile: PlayerProfile = {
      uid: fullUid,
      userId: fullUid,
      name: displayName,
      username: tgUser.username ?? existing?.username,
      avatarUrl: tgUser.photo_url || existing?.avatarUrl,
      country: existing?.country || "US",
      region: existing?.region || existing?.country || "US",
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch {}
    return profile;
  }

  // 3) fallback guest
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
  } catch {}

  return fallback;
}

/**
 * Save / update profile fields without changing uid unless you explicitly pass it.
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
  } catch {}
}

// legacy alias
export const saveProfile = setProfile;
