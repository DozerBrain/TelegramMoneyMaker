// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile }; // re-export

const KEY = "mm_profile";

// Generate a short numeric UID (6 digits) if we don't have Telegram user
function generateNumericUid(): string {
  const n = Math.floor(100000 + Math.random() * 900000); // 100000–999999
  return String(n);
}

// Try to read Telegram WebApp user (if we are inside Telegram)
function getTelegramUserSafe(): any | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initDataUnsafe?.user || null;
  } catch {
    return null;
  }
}

export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;

      // If we already have a non-"local" uid, just use it
      if (parsed && typeof parsed === "object" && parsed.uid && parsed.uid !== "local") {
        return parsed;
      }
    }
  } catch {
    // ignore and build fresh below
  }

  // Either no profile yet, or uid was "local" → build a better one
  const tgUser = getTelegramUserSafe();

  const uidFromTelegram = tgUser?.id ? String(tgUser.id) : null;
  const uid = uidFromTelegram || generateNumericUid();

  const nameFromTelegram =
    tgUser
      ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
      : "Player";

  const avatarFromTelegram: string | undefined = tgUser?.photo_url || undefined;

  const profile: PlayerProfile = {
    uid,
    name: nameFromTelegram,
    country: "US", // default, player can change in Profile screen
    avatarUrl: avatarFromTelegram,

    // legacy aliases some parts of the app might still read
    userId: uid,
    username: tgUser?.username || nameFromTelegram,
    region: "US",
    updatedAt: Date.now(),
  };

  localStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}

export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();
  const merged: PlayerProfile = {
    ...current,
    ...update,
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

// legacy name used in some pages
export const saveProfile = setProfile;
