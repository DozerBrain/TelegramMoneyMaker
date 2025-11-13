import { PlayerProfile } from "../types";

const KEY = "mm_profile";

export function getProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const p: PlayerProfile = {
    uid: "local",
    name: "Player",
    country: "US",
    avatarUrl: undefined,
    userId: "local",
    username: "Player",
    region: "US",
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(p));
  return p;
}
