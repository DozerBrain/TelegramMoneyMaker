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
import { getProfile } from "./storage"; // ✅ use storage, not ./profile

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;      // totalEarnings as the score
  updatedAt: number;
};

// --- Helpers to normalize your stored profile into the shape we need ---
function getUid(): string {
  // If you later add Telegram user ID or Firebase Auth UID, return it here.
  // For now, persist a guest id based on localStorage.
  const KEY = "mm_uid";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(KEY, id);
  }
  return id;
}

function normalizeProfile() {
  const p = getProfile(); // from storage.ts: { username?, region?, avatar? }
  return {
    uid: getUid(),
    name: (p.username || "Player").toString(),
    country: (p.region || "World").toString(),
  };
}

function pathGlobal(uid: string) {
  return `leaderboard/global/${uid}`;
}
function pathCountry(country: string, uid: string) {
  // sanitize to avoid slashes/spaces in keys
  const c = country.replace(/[^\w-]/g, "_");
  return `leaderboard/byCountry/${c}/${uid}`;
}

export async function pushScore(totalEarnings: number) {
  const p = normalizeProfile();
  const row: LeaderRow = {
    uid: p.uid,
    name: p.name,
    country: p.country,
    score: Math.max(0, Math.floor(totalEarnings)),
    updatedAt: Date.now(),
  };

  // Upsert global: only keep best score
  const gRef = ref(db as any, pathGlobal(p.uid));
  const snap = await get(gRef);
  const prev = snap.exists() ? (snap.val() as LeaderRow) : null;
  const best =
    !prev || row.score > (prev.score || 0)
      ? row
      : { ...prev, name: row.name, country: row.country, updatedAt: row.updatedAt };

  await set(gRef, best);
  await set(ref(db as any, pathCountry(p.country, p.uid)), best);
}

export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const q = query(
    ref(db as any, "leaderboard/global"),
    orderByChild("score"),
    limitToLast(limit)
  );
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>) as LeaderRow[];
  // orderByChild asc + limitToLast => reverse for desc
  return arr.sort((a, b) => b.score - a.score);
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  const q = query(
    ref(db as any, `leaderboard/byCountry/${country.replace(/[^\w-]/g, "_")}`),
    orderByChild("score"),
    limitToLast(limit)
  );
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>) as LeaderRow[];
  return arr.sort((a, b) => b.score - a.score);
}

/** Call this routinely (e.g., from Home) to keep your row fresh */
export async function heartbeat(totalEarnings: number) {
  try {
    await pushScore(totalEarnings);
  } catch {
    // ignore transient errors
  }
}
