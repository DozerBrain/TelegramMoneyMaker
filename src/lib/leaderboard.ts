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
import { COUNTRIES, type RegionId } from "../data/countries";

// ----------------- Types -----------------

export type LeaderRow = {
  uid: string;
  name: string;
  country: string; // ISO code like "US"
  score: number;
  updatedAt: number;
  region?: RegionId; // "NA", "EU", ...
};

// ----------------- Region helpers -----------------

function findCountry(code: string) {
  const cc = (code || "").toUpperCase();
  return COUNTRIES.find((c) => c.code === cc);
}

function getRegionForCountry(country: string): RegionId {
  const c = findCountry(country);
  return (c?.region ?? "NA") as RegionId;
}

// Map new short region codes -> old long keys we used before
function regionToLegacyKey(region: RegionId): string {
  switch (region) {
    case "NA":
      return "NorthAmerica";
    case "SA":
      return "SouthAmerica";
    case "EU":
      return "Europe";
    case "CIS":
      return "CIS";
    case "MENA":
      return "MiddleEast";
    case "AF":
      return "Africa";
    case "AS":
      return "Asia";
    case "OC":
      return "Oceania";
    default:
      return String(region);
  }
}

// Small helper to read from a path (or empty if not exist)
async function readNode(
  path: string,
  limit: number
): Promise<LeaderRow[]> {
  const q = query(ref(db, path), orderByChild("score"), limitToLast(limit));
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, LeaderRow>);
}

// Merge rows from multiple paths, dedupe by uid, keep best score
function mergeRows(
  lists: LeaderRow[][],
  limit: number
): LeaderRow[] {
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

  const uid = String(p.uid || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();
  const region = getRegionForCountry(country); // e.g. "NA"
  const legacyRegionKey = regionToLegacyKey(region);

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
    region,
  };

  // ✅ Write to lowercase paths (new)
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
  await set(ref(db, `leaderboard/byRegion/${region}/${uid}`), row);
  await set(
    ref(db, `leaderboard/byRegion/${legacyRegionKey}/${uid}`),
    row
  );

  // ✅ Also mirror to old capital "Leaderboard" paths (for old data / safety)
  await set(ref(db, `Leaderboard/global/${uid}`), row);
  await set(ref(db, `Leaderboard/byCountry/${country}/${uid}`), row);
  await set(
    ref(db, `Leaderboard/byRegion/${region}/${uid}`),
    row
  );
  await set(
    ref(db, `Leaderboard/byRegion/${legacyRegionKey}/${uid}`),
    row
  );
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

  const lower = await readNode(
    `leaderboard/byCountry/${cc}`,
    limit
  );
  const upper = await readNode(
    `Leaderboard/byCountry/${cc}`,
    limit
  );

  return mergeRows([lower, upper], limit);
}

export async function topByRegion(
  region: RegionId,
  limit = 50
): Promise<LeaderRow[]> {
  const legacyKey = regionToLegacyKey(region);

  const lowerNew = await readNode(
    `leaderboard/byRegion/${region}`,
    limit
  );
  const lowerOld = await readNode(
    `leaderboard/byRegion/${legacyKey}`,
    limit
  );

  const upperNew = await readNode(
    `Leaderboard/byRegion/${region}`,
    limit
  );
  const upperOld = await readNode(
    `Leaderboard/byRegion/${legacyKey}`,
    limit
  );

  return mergeRows(
    [lowerNew, lowerOld, upperNew, upperOld],
    limit
  );
}
