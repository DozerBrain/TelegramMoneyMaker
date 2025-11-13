// src/lib/leaderboard.ts
import { getDB } from "./firebase";
import {
  ref, set, update, serverTimestamp,
  query, orderByChild, limitToLast, onValue, get
} from "firebase/database";

export type LBUser = {
  userId: string;
  username: string;
  country: string;
  region?: string;
  score: number;
  updatedAt: number;
};

// 🔼 Write a user score to global / country / region leaderboards
export async function submitScore(u: LBUser) {
  const db = getDB();
  const safe = {
    ...u,
    username: sanitize(u.username, 24),
    country: sanitize(u.country, 4).toUpperCase(),
    region: u.region ? sanitize(u.region, 24) : undefined,
    score: Math.max(0, Math.floor(u.score || 0)),
    updatedAt: Date.now(),
  };

  const updates: Record<string, any> = {};
  updates[`/leaderboard/global/${safe.userId}`] = safe;
  updates[`/leaderboard/countries/${safe.country}/${safe.userId}`] = safe;
  if (safe.region) {
    updates[`/leaderboard/regions/${safe.country}/${safe.region}/${safe.userId}`] = safe;
  }
  await update(ref(db), updates);
}

// 🔽 Read top N
export async function fetchTopGlobal(limit = 100): Promise<LBUser[]> {
  const q = query(ref(getDB(), "/leaderboard/global"), orderByChild("score"), limitToLast(limit));
  const snap = await get(q);
  return sortDesc(snapToArr<LBUser>(snap));
}

export async function fetchTopCountry(country: string, limit = 100): Promise<LBUser[]> {
  const path = `/leaderboard/countries/${country.toUpperCase()}`;
  const q = query(ref(getDB(), path), orderByChild("score"), limitToLast(limit));
  const snap = await get(q);
  return sortDesc(snapToArr<LBUser>(snap));
}

export async function fetchTopRegion(country: string, region: string, limit = 100): Promise<LBUser[]> {
  const path = `/leaderboard/regions/${country.toUpperCase()}/${region}`;
  const q = query(ref(getDB(), path), orderByChild("score"), limitToLast(limit));
  const snap = await get(q);
  return sortDesc(snapToArr<LBUser>(snap));
}

// Live listener (optional)
export function onTopGlobal(limit = 50, cb: (rows: LBUser[]) => void) {
  const q = query(ref(getDB(), "/leaderboard/global"), orderByChild("score"), limitToLast(limit));
  return onValue(q, (snap) => cb(sortDesc(snapToArr<LBUser>(snap))));
}

// Helpers
function sanitize(s: string, max = 32) {
  return String(s || "").replace(/[^\w\- .]/g, "").slice(0, max);
}
function snapToArr<T = any>(snap: any): T[] {
  const out: T[] = [];
  snap.forEach((c: any) => out.push(c.val()));
  return out;
}
function sortDesc<T extends { score: number }>(a: T[]) {
  return a.sort((x, y) => y.score - x.score);
}
