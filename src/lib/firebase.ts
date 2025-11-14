// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBGsRIliOcn1zu7i72rK_C51ML_eI8Z6X0",
  authDomain: "moneymaker-a669c.firebaseapp.com",
  databaseURL: "https://moneymaker-a669c-default-rtdb.firebaseio.com",
  projectId: "moneymaker-a669c",
  storageBucket: "moneymaker-a669c.firebasestorage.app",
  messagingSenderId: "352896227263",
  appId: "1:352896227263:web:3d900d8a2f22f2d7a2730a",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
