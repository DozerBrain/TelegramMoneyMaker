import { db } from "./firebase";
import {
  get,
  set,
  ref,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { PlayerProfile, getProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

// ✅ Main function used in your app
export async function submitScore(
  totalEarnings: number,
  profile?: PlayerProfile
) {
  const p = profile || getProfile();

  const row: LeaderRow = {
    uid: p.uid,
    name: p.name,
    country: p.country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  // Save globally and by country
  await set(ref(db, `leaderboard/global/${p.uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${p.country}/${p.uid}`), row);
}

// ✅ Optional helper to fetch top leaderboard results
export async function getTopLeaders(limitCount = 50) {
  const q = query(ref(db, "leaderboard/global"), orderByChild("score"), limitToLast(limitCount));
  const snap = await get(q);
  const data: LeaderRow[] = [];

  snap.forEach((child) => {
    data.push(child.val());
  });

  // Sort descending (highest score first)
  return data.sort((a, b) => b.score - a.score);
}
