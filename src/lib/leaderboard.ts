// src/lib/leaderboard.ts
import { db } from "./firebase";
import {
  get,
  set,
  ref,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import type { Profile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

/**
 * Save player score into Firebase leaderboard.
 * - Uses Telegram UID when available.
 * - Writes to:
 *   - leaderboard/global/<uid>
 *   - leaderboard/byCountry/<COUNTRY>/<uid>
 */
export async function submitScore(
  totalEarnings: number,
  profile?: Profile
): Promise<void> {
  const p =
    profile ??
    (JSON.parse(
      localStorage.getItem("moneymaker_profile_v1") || "{}"
    ) as Partial<Profile>);

  const row: LeaderRow = {
    uid: String(p.uid || p.userId || "local"),
    name: p.name || p.username || "Player",
    country: (p.country || "US").toUpperCase(),
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  const globalRef = ref(db, `leaderboard/global/${row.uid}`);
  const countryRef = ref(db, `leaderboard/byCountry/${row.country}/${row.uid}`);

  await set(globalRef, row);
  await set(countryRef, row);
}

/** Top global players */
export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  try {
    const snap = await get(
      query(ref(db, "leaderboard/global"), orderByChild("score"), limitToLast(limit))
    );
    if (!snap.exists()) return [];
    const rows = Object.values(snap.val() as Record<string, LeaderRow>);
    // orderByChild+limitToLast gives ascending; we want descending
    return rows.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

/** Top players in specific country (by 2-letter code like "US", "RU") */
export async function topByCountry(
  country: string,
  limit = 50
): Promise<LeaderRow[]> {
  const key = (country || "US").toUpperCase();
  try {
    const snap = await get(
      query(
        ref(db, `leaderboard/byCountry/${key}`),
        orderByChild("score"),
        limitToLast(limit)
      )
    );
    if (!snap.exists()) return [];
    const rows = Object.values(snap.val() as Record<string, LeaderRow>);
    return rows.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}
