// src/lib/profile.ts

export type Profile = {
  /** Stable in-game player ID (we want this to be Telegram user.id when available) */
  uid: string;
  /** Raw Telegram user id as string (same as uid, but kept separately in case) */
  userId?: string;

  /** Displayed name in the game */
  name: string;

  /** 2-letter country code like "US", "RU", etc. */
  country: string;

  /** Optional Telegram username like "DozerBrain" */
  username?: string;

  /** Avatar URL from Telegram */
  avatarUrl?: string;

  /** Where this profile data came from: "TG" | "LOCAL" */
  source?: "TG" | "LOCAL";
};

const STORAGE_KEY = "moneymaker_profile_v1";

const DEFAULT_PROFILE: Profile = {
  uid: "", // will be filled on first save
  name: "Player",
  country: "US",
};

/** Load profile from localStorage or return default */
export function getProfile(): Profile {
  if (typeof window === "undefined") return { ...DEFAULT_PROFILE };

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
 * - Never lose Telegram uid/avatar when you only update name / country.
 * - If uid is still empty, generate one (timestamp-based).
 */
export function setProfile(update: Partial<Profile>): Profile {
  const prev = getProfile();

  // Merge old + new
  let next: Profile = {
    ...prev,
    ...update,
  };

  // Ensure we always have a uid
  if (!next.uid) {
    if (update.uid) {
      next.uid = String(update.uid);
    } else if (prev.uid) {
      next.uid = prev.uid;
    } else {
      // Fallback: local-only uid if no Telegram info
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
