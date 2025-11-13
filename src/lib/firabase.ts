// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBGSR1l1ocnZu7i72rK_C51ML_eI87X6Q", // ← your key
  authDomain: "moneymaker-a669c.firebaseapp.com",
  projectId: "moneymaker-a669c",
  storageBucket: "moneymaker-a669c.firebasestorage.app",
  messagingSenderId: "352896227263",
  appId: "1:352896227263:web:3d998d8a2f22f2d7a2730a",
  databaseURL: "https://moneymaker-a669c-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);
