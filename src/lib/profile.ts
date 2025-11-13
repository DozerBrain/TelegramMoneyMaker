// src/lib/profile.ts
import { get, set } from "./tiny-store";

export type Profile = {
  userId: string;
  username: string;
  country: string; // ISO-2 code like "US"
  region?: string;
};

const KEY = "mm_profile";

export function getProfile(): Profile {
  const existing = get<Profile | null>(KEY, null);
  if (existing) return existing;

  const generated: Profile = {
    userId: "u_" + Math.random().toString(36).slice(2, 10),
    username: "Player_" + Math.random().toString(36).slice(2, 6),
    country: "US",
  };
  set(KEY, generated);
  return generated;
}

export function setProfile(p: Profile) {
  set(KEY, p);
}
