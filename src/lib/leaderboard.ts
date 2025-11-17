// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

export async function submitScore(totalEarnings: number) {
  // Load profile from our profile store
  const raw = localStorage.getItem("moneymaker_profile_v1") || "{}";
  const p = JSON.parse(raw || "{}") as {
    uid?: string;
    userId?: string;
    name?: string;
    username?: string;
    country?: string;
    region?: string;
  };

  const uid = String(p.uid || p.userId || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || p.region || "US").toUpperCase();

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  // Write in two places
  await set(ref(db, `leaderboard/global/${row.uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${row.country}/${row.uid}`), row);
}

// --- Readers used by the page / top bar
export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const q = query(
    ref(db, "leaderboard/global"),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snap = await get(q);
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, LeaderRow>;
  return Object.values(data).sort((a, b) => b.score - a.score);
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
  const data = snap.val() as Record<string, LeaderRow>;
  return Object.values(data).sort((a, b) => b.score - a.score);
}
