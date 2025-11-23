// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGsRIliOcn1zu7i72rK_C51ML_eI8Z6X0",
  authDomain: "moneymaker-a669c.firebaseapp.com",
  databaseURL: "https://moneymaker-a669c-default-rtdb.firebaseio.com",
  projectId: "moneymaker-a669c",
  storageBucket: "moneymaker-a669c.firebasestorage.app",
  messagingSenderId: "352896227263",
  appId: "1:352896227263:web:3d900d8a2f22f2d7a2730a",
};

// Initialize core Firebase app
export const app = initializeApp(firebaseConfig);

// Realtime Database
export const db = getDatabase(app);

// Firebase Auth
export const auth = getAuth(app);

// Google provider for sign-in
export const googleProvider = new GoogleAuthProvider();
