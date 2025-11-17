// src/lib/leaderboard.ts
import { db } from "./firebase";
import { get, set, ref, query, orderByChild, limitToLast } from "firebase/database";
import { getProfile } from "./profile";

// ---- Regions -------------------------------------------------

export type RegionCode = "NA" | "SA" | "EU" | "CIS" | "ME" | "AS" | "AF" | "OC";

export function regionFromCountry(country: string): RegionCode {
  const c = (country || "US").toUpperCase();

  // North America
  if (["US", "CA", "MX"].includes(c)) return "NA";

  // South America (and Central America / Caribbean for our purposes)
  if (
    [
      "AR", "BR", "CL", "CO", "PE", "VE", "UY", "PY", "BO", "EC", "GY", "SR", "GF",
      "TT", "PA", "CR", "NI", "GT", "HN", "SV", "BZ", "DO", "HT", "CU", "JM"
    ].includes(c)
  ) {
    return "SA";
  }

  // CIS / Post-Soviet
  if (
    [
      "RU", "UA", "BY", "KZ", "KG", "TJ", "TM", "UZ",
      "AM", "AZ", "GE", "MD"
    ].includes(c)
  ) {
    return "CIS";
  }

  // Middle East
  if (
    [
      "AE", "SA", "QA", "KW", "BH", "OM",
      "JO", "LB", "SY", "IQ", "IR", "YE",
      "IL", "PS"
    ].includes(c)
  ) {
    return "ME";
  }

  // Asia
  if (
    [
      "CN", "IN", "JP", "KR", "KP", "TH", "VN", "PH", "ID", "MY", "SG",
      "HK", "TW", "PK", "BD", "LK", "NP", "KH", "MM", "LA", "MN"
    ].includes(c)
  ) {
    return "AS";
  }

  // Africa
  if (
    [
      "EG", "ZA", "NG", "MA", "DZ", "TN", "KE", "ET", "GH", "CI", "SN", "UG", "TZ",
      "SD", "CM", "ZM", "ZW", "MW", "BW", "NA", "RW", "BI", "ML", "BF", "NE", "TG",
      "BJ", "GA", "CG", "CD", "AO", "MZ", "GM", "SL", "LR", "GN", "GW", "CV",
      "SO", "DJ", "ER", "LY", "MR", "SS", "CF", "TD"
    ].includes(c)
  ) {
    return "AF";
  }

  // Oceania
  if (
    [
      "AU", "NZ", "FJ", "PG", "WS", "TO", "SB", "VU", "NR", "TV", "KI"
    ].includes(c)
  ) {
    return "OC";
  }

  // Europe (default for the rest)
  if (
    [
      "GB", "UK", "DE", "FR", "ES", "IT", "PT", "NL", "BE", "SE", "NO", "FI", "DK",
      "PL", "CZ", "SK", "HU", "RO", "BG", "GR", "AT", "CH", "IE", "HR", "SI",
      "LT", "LV", "EE", "IS", "LU", "LI", "AD", "MC", "SM", "VA",
      "AL", "MK", "RS", "BA", "XK", "TR", "CY", "MT"
    ].includes(c)
  ) {
    return "EU";
  }

  // Unknown → just put to Europe for now
  return "EU";
}

export function regionLabel(region: RegionCode): string {
  switch (region) {
    case "NA":
      return "North America";
    case "SA":
      return "South America";
    case "EU":
      return "Europe";
    case "CIS":
      return "CIS";
    case "ME":
      return "Middle East";
    case "AS":
      return "Asia";
    case "AF":
      return "Africa";
    case "OC":
      return "Oceania";
    default:
      return region;
  }
}

// ---- Leaderboard row -----------------------------------------

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  region?: RegionCode;   // optional for older rows
  score: number;
  updatedAt: number;
};

// ---- Writer --------------------------------------------------

export async function submitScore(totalEarnings: number) {
  const p = getProfile();

  const uid = String(p.uid || "local");
  const country = (p.country || "US").toUpperCase();
  const region = regionFromCountry(country);
  const name = p.name || p.username || "Player";

  const row: LeaderRow = {
    uid,
    name,
    country,
    region,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };

  // Write in three places
  await set(ref(db, `leaderboard/global/${uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${country}/${uid}`), row);
  await set(ref(db, `leaderboard/byRegion/${region}/${uid}`), row);
}

// ---- Readers -------------------------------------------------

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

export async function topByCountry(country: string, limit = 50): Promise<LeaderRow[]> {
  const cc = country.toUpperCase();
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

export async function topByRegion(region: RegionCode, limit = 50): Promise<LeaderRow[]> {
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
