// src/lib/leaderboard.ts
import { ref, set, get, query, orderByChild, limitToLast } from "firebase/database";
import { db } from "./firebase";

export type PlayerData = {
  username: string;
  score: number;
  country: string;
  updatedAt: number;
};

// Save or update player score
export async function savePlayerScore(uid: string, data: PlayerData) {
  try {
    await set(ref(db, "leaderboard/" + uid), data);
  } catch (err) {
    console.error("Error saving player score:", err);
  }
}

// Get top players globally
export async function getTopPlayers(limit = 20): Promise<PlayerData[]> {
  try {
    const q = query(ref(db, "leaderboard"), orderByChild("score"), limitToLast(limit));
    const snap = await get(q);
    if (!snap.exists()) return [];
    const items: PlayerData[] = Object.values(snap.val());
    // Sort descending by score
    return items.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return [];
  }
}
