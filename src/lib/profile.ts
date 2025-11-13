import { ref, set, update } from "firebase/database";
import { db } from "./firebase";

export type PlayerProfile = {
  uid: string;
  name: string;
  country: string;     // ISO like "US", "GB", "RU" etc.
  avatarUrl?: string;
  createdAt: number;
  lastSeen: number;
};

const LS_KEY = "moneymaker:profile:v1";

function randomId(len = 16) {
  const abc = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += abc[Math.floor(Math.random() * abc.length)];
  return out;
}

function guessCountry(): string {
  // simple default; player can edit in Profile page
  return "US";
}

export function loadOrCreateProfile(): PlayerProfile {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);

  const uid = randomId(20);
  const prof: PlayerProfile = {
    uid,
    name: `Banker#${uid.slice(0, 5)}`,
    country: guessCountry(),
    createdAt: Date.now(),
    lastSeen: Date.now(),
  };
  localStorage.setItem(LS_KEY, JSON.stringify(prof));

  // write baseline to /users/{uid}
  set(ref(db, `users/${uid}`), prof).catch(()=>{});
  return prof;
}

export function saveProfile(p: PlayerProfile) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
  update(ref(db, `users/${p.uid}`), { ...p, lastSeen: Date.now() }).catch(()=>{});
}

export function getProfile(): PlayerProfile {
  return JSON.parse(localStorage.getItem(LS_KEY) || JSON.stringify(loadOrCreateProfile()));
}
