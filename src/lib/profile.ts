// src/lib/profile.ts

export type Profile = {
  /** Stable in-game player ID (Telegram user.id or Google uid when available) */
  uid: string;

  /** Raw Telegram user id as string (same as uid for TG users, but kept separately in case) */
  userId?: string;

  /** Optional Google account uid (Firebase Auth) */
  googleUid?: string;

  /** Displayed name in the game */
  name: string;

  /** 2-letter country code like "US", "RU", etc. */
  country: string;

  /** Optional Telegram username like "DozerBrain" */
  username?: string;

  /** Optional email (for Google users) */
  email?: string;

  /** Avatar URL from Telegram or Google photoURL */
  avatarUrl?: string;

  /** Where this profile data came from */
  source?: "TG" | "LOCAL" | "GOOGLE";
};

export type PlayerProfile = Profile; // alias so imports work

const STORAGE_KEY = "moneymaker_profile_v1";

const DEFAULT_PROFILE: Profile = {
  uid: "", // will be filled on first save
  name: "Player",
  country: "US",
};

/** Load profile from localStorage or return default */
export function getProfile(): Profile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PROFILE };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };

    const parsed = JSON.parse(raw) as Partial<Profile>;

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Merge new profile data with existing one.
 * - Never lose Telegram or Google uid/avatar when you only update name / country.
 * - If uid is still empty, generate one (timestamp-based).
 */
export function setProfile(update: Partial<Profile>): Profile {
  const prev = getProfile();

  // Merge old + new
  let next: Profile = {
    ...prev,
    ...update,
  };

  // Prefer explicit provider-specific ids if present
  // (e.g. Google login calling setProfile({ googleUid, uid: authUid, ... }))
  if (update.googleUid && !next.googleUid) {
    next.googleUid = String(update.googleUid);
  }
  if (update.userId && !next.userId) {
    next.userId = String(update.userId);
  }

  // Ensure we always have a stable uid
  if (!next.uid) {
    if (update.uid) {
      next.uid = String(update.uid);
    } else if (prev.uid) {
      next.uid = prev.uid;
    } else if (update.userId) {
      next.uid = String(update.userId);
    } else if (update.googleUid) {
      next.uid = String(update.googleUid);
    } else {
      // Fallback: local-only uid if no Telegram/Google info
      next.uid = String(Date.now());
    }
  }

  // If Telegram gave us an id but uid was empty, sync them
  if (!prev.uid && update.userId && !update.uid) {
    next.uid = String(update.userId);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }

  return next;
}
