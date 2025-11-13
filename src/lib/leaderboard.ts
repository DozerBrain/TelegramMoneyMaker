// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";
import { getProfile } from "./storage";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

function uid(): string {
  const KEY = "mm_uid";
  let id = localStorage.getItem(KEY);
  if (!id) { id = "guest_" + Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, id); }
  return id;
}
function sanitizeCountry(c: string) { return (c || "World").toString().replace(/[^\w-]/g, "_"); }
function pathGlobal(u: string) { return `leaderboard/global/${u}`; }
function pathCountry(country: string, u: string) { return `leaderboard/byCountry/${sanitizeCountry(country)}/${u}`; }

export async function pushScore(totalEarnings: number) {
  const p = getProfile();
  const u = uid();
  const row: LeaderRow = {
    uid: u,
    name: (p.username || "Player").toString(),
    country: (p.region || "World").toString(),
    score: Math.max(0, Math.floor(totalEarnings)),
    updatedAt: Date.now(),
  };
  const gRef = ref(db as any, pathGlobal(u));
  const snap = await get(gRef);
  const prev = snap.exists() ? (snap.val() as LeaderRow) : null;
  const best = !prev || row.score > (prev.score || 0)
    ? row
    : { ...prev, name: row.name, country: row.country, updatedAt: row.updatedAt };

  await set(gRef, best);
  await set(ref(db as any, pathCountry(row.country, u)), best);
}

export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const q = query(ref(db as any, "leaderboard/global"), orderByChild("score"), limitToLast(limit));
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>) as LeaderRow[];
  return arr.sort((a, b) => b.score - a.score);
}

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  const q = query(ref(db as any, `leaderboard/byCountry/${sanitizeCountry(country)}`), orderByChild("score"), limitToLast(limit));
  const s = await get(q);
  if (!s.exists()) return [];
  const arr = Object.values(s.val() as Record<string, LeaderRow>) as LeaderRow[];
  return arr.sort((a, b) => b.score - a.score);
}

export async function heartbeat(totalEarnings: number) { try { await pushScore(totalEarnings); } catch {} }
