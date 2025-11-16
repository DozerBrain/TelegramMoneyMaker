// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";
import type { Profile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  region?: string;
  avatarUrl?: string;
  score: number;
  updatedAt: number;
};

export async function submitScore(
  totalEarnings: number,
  profile?: Profile
) {
  const p: Profile =
    profile ??
    (JSON.parse(localStorage.getItem("moneymaker_profile_v1") || "null") as Profile) ??
    { uid: "local", name: "Player", country: "US" };

  const row: LeaderRow = {
    uid: p.uid || p.userId || "local",
    name: p.name || p.username || "Player",
    country: p.country || "US",
    region: p.region,
    avatarUrl: p.avatarUrl,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  // Global leaderboard
  await set(ref(db, `leaderboard/global/${row.uid}`), row);

  // Country shard (e.g. leaderboard/byCountry/US/uid)
  await set(ref(db, `leaderboard/byCountry/${row.country}/${row.uid}`), row);

  // In the future you can also add region shard, for example:
  // if (row.region) {
  //   await set(ref(db, `leaderboard/byRegion/${row.country}/${row.region}/${row.uid}`), row);
  // }
}

// --- simple readers used by the page; safe fallbacks if DB empty
export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  try {
    const snap = await get(
      query(ref(db, "leaderboard/global"), orderByChild("score"), limitToLast(limit))
    );
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, LeaderRow>).sort(
      (a, b) => b.score - a.score
    );
  } catch {
    return [];
  }
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  try {
    const snap = await get(
      query(
        ref(db, `leaderboard/byCountry/${country}`),
        orderByChild("score"),
        limitToLast(limit)
      )
    );
    if (!snap.exists()) return [];
    return Object.values(snap.val() as Record<string, LeaderRow>).sort(
      (a, b) => b.score - a.score
    );
  } catch {
    return [];
  }
}
