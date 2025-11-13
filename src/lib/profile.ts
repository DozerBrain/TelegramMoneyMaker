// src/lib/profile.ts
import { ref, get, set } from "firebase/database";
import { db } from "./firebase";

export type Profile = {
  uid: string;
  username: string;
  country: string;
  bestScore: number;
};

export async function saveProfile(profile: Profile) {
  try {
    await set(ref(db, "profiles/" + profile.uid), profile);
  } catch (err) {
    console.error("Error saving profile:", err);
  }
}

export async function getProfile(uid: string): Promise<Profile | null> {
  try {
    const snap = await get(ref(db, "profiles/" + uid));
    if (!snap.exists()) return null;
    return snap.val() as Profile;
  } catch (err) {
    console.error("Error loading profile:", err);
    return null;
  }
}
