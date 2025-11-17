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

// ✅ getRegionForCountry from regions, RegionId type from countries
import { getRegionForCountry } from "../data/regions";
import type { RegionId } from "../data/countries";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
  // optional region label like "NA"
  region?: RegionId;
};

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

export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  const uid = String(p.uid || "local");
  const name = p.name || p.username || "Player";
  const country = (p.country || "US").toUpperCase();
  const region = getRegionForCountry(country); // e.g. "NA"

  const row: LeaderRow = {
    uid,
    name,
    country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
    region,
  };

  const legacyRegionKey = regionToLegacyKey(region);

  // ✅ Write everywhere (new + legacy paths)
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);

  // new region node
  await set(ref(db, `leaderboard/byRegion/${region}/${uid}`), row);

  // legacy region node (so old data still works)
  await set(ref(db, `leaderboard/byRegion/${legacyRegionKey}/${uid}`), row);
}

// --- Readers used by the page / top bar ---

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

  const data = snap.val() as Record<string, LeaderRow>;
  return Object.values(data).sort((a, b) => b.score - a.score);
}

export async function topByRegion(
  region: RegionId,
  limit = 50
): Promise<LeaderRow[]> {
  const legacyKey = regionToLegacyKey(region);

  // Read new node
  const qNew = query(
    ref(db, `leaderboard/byRegion/${region}`),
    orderByChild("score"),
    limitToLast(limit)
  );
  const snapNew = await get(qNew);

  let rows: LeaderRow[] = [];
  if (snapNew.exists()) {
    rows = rows.concat(
      Object.values(snapNew.val() as Record<string, LeaderRow>)
    );
  }

  // Also read legacy node (old data)
  if (legacyKey !== region) {
    const qOld = query(
      ref(db, `leaderboard/byRegion/${legacyKey}`),
      orderByChild("score"),
      limitToLast(limit)
    );
    const snapOld = await get(qOld);
    if (snapOld.exists()) {
      rows = rows.concat(
        Object.values(snapOld.val() as Record<string, LeaderRow>)
      );
    }
  }

  // De-dupe by uid and keep best score
  const byId: Record<string, LeaderRow> = {};
  for (const r of rows) {
    const key = String(r.uid);
    if (!byId[key] || r.score > byId[key].score) {
      byId[key] = r;
    }
  }

  return Object.values(byId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
