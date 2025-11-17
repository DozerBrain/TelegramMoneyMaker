// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";
import { getProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

/**
 * Always push TOTAL EARNINGS, not balance, not tapValue.
 * This must run ANY TIME the player earns money.
 */
export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  // ensure correct UID
  const uid = String(p.uid || p.userId || "local");

  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.max(0, Math.floor(totalEarnings)),
    updatedAt: Date.now(),
  };

  // Write to global
  await set(ref(db, `leaderboard/global/${uid}`), row);

  // Write to country
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
}

// -------- READERS ---------

export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const q = query(
    ref(db, "leaderboard/global"),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, LeaderRow>)
    .sort((a, b) => b.score - a.score);
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  const cc = country.toUpperCase();
  const q = query(
    ref(db, `leaderboard/byCountry/${cc}`),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, LeaderRow>)
    .sort((a, b) => b.score - a.score);
}
