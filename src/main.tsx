// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🧩 Styles (import your globals)
import "./index.css";

// 🧠 Telegram WebApp setup
import { initTelegramUI } from "./lib/telegram";
initTelegramUI(); // works inside Telegram, no-op elsewhere

// 📦 Storage helpers
import {
  getOwnedPets, setOwnedPets, getEquippedPet, setEquippedPet,
  getOwnedSuits, setOwnedSuits, getEquippedSuit, setEquippedSuit,
  getCollection, setCollection, getTap, setTap, getScore, setScore,
} from "./lib/storage";

// 🔰 Seed defaults once (safe even if called multiple times)
(function seedOnce() {
  try {
    // 🐾 Pets
    const ownedPets = getOwnedPets();
    if (!ownedPets || ownedPets.length === 0) {
      setOwnedPets(["mouse"]); // give Common pet
      setEquippedPet("mouse");
    } else if (!getEquippedPet()) {
      setEquippedPet(ownedPets[0]);
    }

    // 👔 Suits
    const ownedSuits = getOwnedSuits();
    if (!ownedSuits || ownedSuits.length === 0) {
      setOwnedSuits(["starter"]); // give Starter suit
      setEquippedSuit("starter");
    } else if (!getEquippedSuit()) {
      setEquippedSuit(ownedSuits[0]);
    }

    // 🃏 Cards collection (rarity counts)
    const col = getCollection();
    if (!col || typeof col !== "object") {
      setCollection({
        common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0, ultimate: 0,
      });
    }

    // 👆 Tap / Score sanity
    const tap = Number(getTap());
    if (!Number.isFinite(tap) || tap < 0) setTap(0);

    const score = Number(getScore());
    if (!Number.isFinite(score) || score < 0) setScore(0);
  } catch {
    // ignore seeding errors silently (e.g., SSR or private mode)
  }
})();

// 🚀 Render App
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
