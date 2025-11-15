// src/components/PetCard.tsx
import React, { useEffect, useState } from "react";
import { Pet } from "../data/pets";
import {
  getOwnedPets,
  setOwnedPets,
  getEquippedPet,
  setEquippedPet,
  getTap,
  getCollection,
} from "../lib/storage";

const rarityColor: Record<Pet["rarity"], string> = {
  Common: "border-slate-500",
  Uncommon: "border-emerald-500",
  Rare: "border-cyan-500",
  Epic: "border-violet-500",
  Legendary: "border-yellow-500",
  Mythic: "border-red-500",
  Ultimate: "border-rose-500",
};

// 🔐 Jackpot flags (will be set later from Spin.tsx)
function hasLegendaryJackpot(): boolean {
  try {
    return localStorage.getItem("mm_jp_legendary") === "1";
  } catch {
    return false;
  }
}
function hasMythicJackpot(): boolean {
  try {
    return localStorage.getItem("mm_jp_mythic") === "1";
  } catch {
    return false;
  }
}
function hasUltimateJackpot(): boolean {
  try {
    return localStorage.getItem("mm_jp_ultimate") === "1";
  } catch {
    return false;
  }
}

// 🔐 Check if the player has met the unlock condition for this pet
function canUnlockPet(petId: string): boolean {
  const taps = getTap();
  const col = getCollection() as any;

  const legendaryCount = (col.legendary ?? 0) as number;
  const mythicCount = (col.mythic ?? 0) as number;

  switch (petId) {
    case "mouse":
      // 1. Mouse — 100 taps
      return taps >= 100;

    case "cat":
      // 2. Cat — 1,000 taps
      return taps >= 1_000;

    case "dog":
      // 3. Dog — 10,000 taps
      return taps >= 10_000;

    case "eagle":
      // 4. Golden Eagle — open a Legendary card
      return legendaryCount > 0;

    case "unicorn":
      // 5. Unicorn Pegasus — Mythic card OR Jackpot (Legendary tier)
      return mythicCount > 0 || hasLegendaryJackpot();

    case "goblin":
      // 6. Fourarms Goblin — spin Jackpot (Mythic tier)
      return hasMythicJackpot();

    case "dragon":
      // 7. Crypto Dragon — spin Jackpot (Ultimate tier)
      return hasUltimateJackpot();

    default:
      return false;
  }
}

export default function PetCard({ pet }: { pet: Pet }) {
  const [, bump] = useState(0);

  useEffect(() => {
    const onSaved = () => bump((x) => x + 1);

    window.addEventListener("mm:save", onSaved as any);
    window.addEventListener("storage", onSaved as any);

    return () => {
      window.removeEventListener("mm:save", onSaved as any);
      window.removeEventListener("storage", onSaved as any);
    };
  }, []);

  const owned = getOwnedPets().includes(pet.id);
  const equipped = getEquippedPet() === pet.id;
  const unlockable = !owned && canUnlockPet(pet.id);

  const equip = () => {
    if (!owned) return;
    setEquippedPet(equipped ? null : pet.id);
    window.dispatchEvent(new Event("mm:save"));
  };

  const markOwned = () => {
    if (owned) return;
    if (!canUnlockPet(pet.id)) return; // safety: don’t unlock if condition not met
    setOwnedPets(Array.from(new Set([...getOwnedPets(), pet.id])));
    window.dispatchEvent(new Event("mm:save"));
  };

  return (
    <div
      className={
        "rounded-2xl p-3 bg-zinc-900/60 border flex flex-col items-center gap-2 " +
        rarityColor[pet.rarity]
      }
    >
      <img
        src={pet.img}
        alt={pet.name}
        className="w-24 h-24 object-contain"
      />

      <div className="text-center">
        <div className="font-bold text-white text-base">{pet.name}</div>
        <div className="text-[11px] text-gray-400">{pet.rarity}</div>
      </div>

      <div className="text-[11px] text-emerald-200 text-center px-1">
        {pet.effect}
      </div>

      <div className="text-[10px] text-gray-400 text-center px-1">
        Unlock: {pet.unlock}
      </div>

      {!owned ? (
        <button
          onClick={markOwned}
          disabled={!unlockable}
          className={
            "mt-2 px-3 py-1 rounded-lg text-sm transition " +
            (unlockable
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed")
          }
        >
          {unlockable ? "Unlock" : "Locked"}
        </button>
      ) : (
        <button
          onClick={equip}
          className={
            "mt-2 px-3 py-1 rounded-lg text-sm transition " +
            (equipped
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-blue-600 hover:bg-blue-700 text-white")
          }
        >
          {equipped ? "Equipped" : "Equip"}
        </button>
      )}
    </div>
  );
}
