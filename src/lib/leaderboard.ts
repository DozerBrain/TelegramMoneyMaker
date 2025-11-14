// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";
import type { PlayerProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

export async function submitScore(
  totalEarnings: number,
  profile?: PlayerProfile
) {
  const p = profile ?? JSON.parse(localStorage.getItem("mm_profile") || "{}");
  const row: LeaderRow = {
    uid: p.uid || p.userId || "local",
    name: p.name || p.username || "Player",
    country: p.country || p.region || "US",
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };
  await set(ref(db, `leaderboard/global/${row.uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${row.country}/${row.uid}`), row);
}

// --- simple readers used by the page; safe fallbacks if DB empty
export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  try {
    const snap = await get(query(ref(db, "leaderboard/global"), orderByChild("score"), limitToLast(limit)));
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, LeaderRow>)
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  try {
    const snap = await get(query(ref(db, `leaderboard/byCountry/${country}`), orderByChild("score"), limitToLast(limit)));
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, LeaderRow>)
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}
