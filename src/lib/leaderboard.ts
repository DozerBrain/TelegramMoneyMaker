import { db } from "./firebase";
import {
  get, set, update, ref, query, orderByChild, limitToLast
} from "firebase/database";
import { PlayerProfile, getProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;      // we’ll use totalEarnings as the score
  updatedAt: number;
};

function pathGlobal(uid: string) {
  return `leaderboard/global/${uid}`;
}
function pathCountry(country: string, uid: string) {
  return `leaderboard/byCountry/${country}/${uid}`;
}

export async function pushScore(totalEarnings: number, profile?: PlayerProfile) {
  const p = profile || getProfile();
  const row: LeaderRow = {
    uid: p.uid,
    name: p.name,
    country: p.country,
    score: Math.max(0, Math.floor(totalEarnings)),
    updatedAt: Date.now()
  };

  // Upsert global: only keep best score
  const gRef = ref(db, pathGlobal(p.uid));
  const snap = await get(gRef);
  const prev = snap.exists() ? (snap.val() as LeaderRow) : null;
  const best = !prev || row.score > (prev.score || 0) ? row : { ...prev, ...row };

  await set(gRef, best);
  await set(ref(db, pathCountry(p.country, p.uid)), best);
}

export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const q = query(ref(db, "leaderboard/global"), orderByChild("score"), limitToLast(limit));
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>);
  // orderByChild asc + limitToLast => reverse for desc
  return (arr as LeaderRow[]).sort((a,b)=>b.score-a.score);
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  const q = query(ref(db, `leaderboard/byCountry/${country}`), orderByChild("score"), limitToLast(limit));
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>);
  return (arr as LeaderRow[]).sort((a,b)=>b.score-a.score);
}

/** Call this routinely (e.g., from Home) to keep your row fresh */
export async function heartbeat(totalEarnings: number) {
  try { await pushScore(totalEarnings); } catch {}
}
