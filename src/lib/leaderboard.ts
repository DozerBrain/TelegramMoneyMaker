import { db } from "./firebase";
import {
  get, set, ref, query, orderByChild, limitToLast
} from "firebase/database";
import { PlayerProfile, getProfile } from "./profile";

export type LeaderRow = {
  uid: string;
  name: string;
  country: string;
  score: number;
  updatedAt: number;
};

export async function submitScore(totalEarnings: number, profile?: PlayerProfile) {
  const p = profile || getProfile();
  const row: LeaderRow = {
    uid: p.uid,
    name: p.name,
    country: p.country,
    score: Math.floor(totalEarnings),
    updatedAt: Date.now(),
  };
  await set(ref(db, `leaderboard/global/${p.uid}`), row);
  await set(ref(db, `leaderboard/byCountry/${p.country}/${p.uid}`), row);
}
