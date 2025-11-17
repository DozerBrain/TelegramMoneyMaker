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
import { getProfile } from "./profile";
import { getRegionForCountry, type RegionId } from "../data/countries";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
  region?: RegionId;
};

export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  const uid = String(p.uid || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();
  const region = getRegionForCountry(country);

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
    region,
  };

  // Write in three places
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
  await set(ref(db, `leaderboard/byRegion/${region}/${uid}`), row);
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
  return Object.values(snap.val() as Record<string, LeaderRow>).sort(
    (a, b) => b.score - a.score
  );
}

export async function topByCountry(
  country: string,
  limit = 50
): Promise<LeaderRow[]> {
  const cc = (country || "US").toUpperCase();
  const q = query(
    ref(db, `leaderboard/byCountry/${cc}`),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, LeaderRow>).sort(
    (a, b) => b.score - a.score
  );
}

export async function topByRegion(
  region: RegionId,
  limit = 50
): Promise<LeaderRow[]> {
  const q = query(
    ref(db, `leaderboard/byRegion/${region}`),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, LeaderRow>).sort(
    (a, b) => b.score - a.score
  );
}
