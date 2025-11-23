// src/lib/cloudSave.ts
import { db } from "./firebase";
import { ref, get, set } from "firebase/database";
import { getProfile } from "./profile";
import type { SaveData } from "./storage";

// Pull latest save from cloud for current uid
export async function loadCloudSave(): Promise<SaveData | null> {
  const p = getProfile();
  const uid = p.uid;
  if (!uid) return null;

  const snap = await get(ref(db, `userSaves/${uid}`));
  if (!snap.exists()) return null;

  return snap.val() as SaveData;
}

// Push local save to cloud
export async function saveCloudSave(save: SaveData): Promise<void> {
  const p = getProfile();
  const uid = p.uid;
  if (!uid) return;

  await set(ref(db, `userSaves/${uid}`), save);
}
