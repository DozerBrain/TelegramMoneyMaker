// src/lib/profile.ts
import type { PlayerProfile } from "../types";

export type { PlayerProfile };

const KEY = "mm_profile";

/** Try to read Telegram WebApp user, if we are really inside a Telegram Mini App */
function readTelegramUser(): {
  uid: string;
  name: string;
  country: string;
  avatarUrl?: string;
} | undefined {
  if (typeof window === "undefined") return undefined;

  const tg = (window as any).Telegram?.WebApp;
  const unsafe = tg?.initDataUnsafe;
  const u = unsafe?.user;
  if (!u) return undefined;

  const fullName =
    (u.first_name || "") +
    (u.last_name ? " " + u.last_name : "");

  const name =
    fullName.trim() ||
    u.username ||
    "Player";

  // Telegram has language_code, not real country, but we’ll use it as a fallback
  const country = (u.language_code || "US").toUpperCase();

  const avatarUrl = (u as any).photo_url as string | undefined;

  return {
    uid: String(u.id),
    name,
    country,
    avatarUrl,
  };
}

/** Main profile getter */
export function getProfile(): PlayerProfile {
  // 1️⃣ Try localStorage first
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlayerProfile;
        if (parsed && typeof parsed === "object" && parsed.uid) {
          return parsed;
        }
      }
    } catch {
      // ignore parse errors, will fall back below
    }
  }

  // 2️⃣ Try Telegram user
  const tgUser = readTelegramUser();

  // 3️⃣ Build base profile (NO RANDOM ID)
  const base: PlayerProfile = {
    uid: tgUser?.uid ?? "local",
    name: tgUser?.name ?? "Player",
    country: tgUser?.country ?? "US",
    avatarUrl: tgUser?.avatarUrl,
    // legacy aliases
    userId: tgUser?.uid ?? "local",
    username: tgUser?.name ?? "Player",
    region: tgUser?.country ?? "US",
    updatedAt: Date.now(),
  };

  // 4️⃣ Save once if we can
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(base));
    } catch {
      // if storage fails (very rare), we still return base
    }
  }

  return base;
}

/** Update profile fields (name, country, etc.) but NEVER change uid */
export function setProfile(update: Partial<PlayerProfile>) {
  const current = getProfile();

  const merged: PlayerProfile = {
    ...current,
    ...update,
    // force UID + aliases to stay the same
    uid: current.uid,
    userId: current.userId ?? current.uid,
    region: update.country ?? current.region ?? current.country,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}
