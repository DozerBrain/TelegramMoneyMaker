// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref } from "firebase/database";
import { getProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  const uid = String(p.uid || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  // Write in two places
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
}

// --- Readers used by the page / top bar

// 🔥 SIMPLE VERSION: read whole branch, sort in JS, then limit
export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const snap = await get(ref(db, "leaderboard/global"));
  if (!snap.exists()) return [];

  const all = Object.values(snap.val() as Record<string, LeaderRow>).sort(
    (a, b) => b.score - a.score
  );

  return all.slice(0, limit);
}

export async function topByCountry(
  country: string,
  limit = 50
): Promise<LeaderRow[]> {
  const cc = country.toUpperCase();
  const snap = await get(ref(db, `leaderboard/byCountry/${cc}`));
  if (!snap.exists()) return [];

  const all = Object.values(snap.val() as Record<string, LeaderRow>).sort(
    (a, b) => b.score - a.score
  );

  return all.slice(0, limit);
}
