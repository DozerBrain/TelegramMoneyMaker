// src/lib/firebase.ts
// Firebase bootstrap (Realtime Database). Vercel will install deps on deploy.
// Make sure "firebase": "^11.0.0" is in package.json dependencies.

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

// 🔑 Fill these from Firebase Console → Project settings → Your apps (Web)
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

let _app: FirebaseApp | null = null;
let _db: Database | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return _app;
}

export function getDB(): Database {
  if (_db) return _db;
  _db = getDatabase(getFirebaseApp());
  return _db;
}
