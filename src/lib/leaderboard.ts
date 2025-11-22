// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref } from "firebase/database";
import { getProfile } from "./profile";
import {
  getRegionForCountry,
  type RegionId,
} from "../data/countries";

// ----------------- Types -----------------

export type LeaderRow = {
  uid: string;
  name: string;
  country: string; // ISO code like "US"
  score: number;
  updatedAt: number;
  region?: RegionId; // "NA", "EU", ...
  avatarUrl?: string; // for avatar bubble
};

// ----------------- Small helpers -----------------

// Read from a path (or empty if not exist)
// Simpler: no Firebase query, just get everything and sort in JS.
async function readNode(path: string, limit: number): Promise<LeaderRow[]> {
  const snap = await get(ref(db, path));
  if (!snap.exists()) return [];

  const raw = snap.val() as Record<string, LeaderRow> | null;
  if (!raw) return [];

  return Object.values(raw)
    .filter((r) => r && typeof r.score === "number")
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Merge rows from multiple paths, dedupe by uid, keep best score
function mergeRows(lists: LeaderRow[][], limit: number): LeaderRow[] {
  const byId: Record<string, LeaderRow> = {};

  for (const list of lists) {
    for (const r of list) {
      const key = String(r.uid);
      if (!byId[key] || r.score > byId[key].score) {
        byId[key] = r;
      }
    }
  }

  return Object.values(byId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ----------------- Writer -----------------

export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  // Use uid from profile; fall back to userId; if nothing, still create a row
  const uid = String(p.uid || p.userId || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();
  const region = getRegionForCountry(country);
  const avatarUrl = p.avatarUrl;

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
    region,
    avatarUrl,
  };

  // New lowercase paths
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
  await set(ref(db, `leaderboard/byRegion/${region}/${uid}`), row);

  // Mirror into old "Leaderboard" capital paths (for safety / old clients)
  await set(ref(db, `Leaderboard/global/${uid}`), row);
  await set(ref(db, `Leaderboard/byCountry/${country}/${uid}`), row);
  await set(ref(db, `Leaderboard/byRegion/${region}/${uid}`), row);
}

// ----------------- Readers -----------------

export async function topGlobal(limit = 50): Promise<LeaderRow[]> {
  const lower = await readNode("leaderboard/global", limit);
  const upper = await readNode("Leaderboard/global", limit);
  return mergeRows([lower, upper], limit);
}

export async function topByCountry(
  country: string,
  limit = 50
): Promise<LeaderRow[]> {
  const cc = (country || "US").toUpperCase();

  const lower = await readNode(`leaderboard/byCountry/${cc}`, limit);
  const upper = await readNode(`Leaderboard/byCountry/${cc}`, limit);

  return mergeRows([lower, upper], limit);
}

export async function topByRegion(
  region: RegionId,
  limit = 50
): Promise<LeaderRow[]> {
  const lower = await readNode(`leaderboard/byRegion/${region}`, limit);
  const upper = await readNode(`Leaderboard/byRegion/${region}`, limit);

  return mergeRows([lower, upper], limit);
}
