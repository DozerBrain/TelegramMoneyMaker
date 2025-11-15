// src/components/PetCard.tsx
import React, { useEffect, useState } from "react";
import { Pet } from "../data/pets";
import {
  getOwnedPets,
  setOwnedPets,
  getEquippedPet,
  setEquippedPet,
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

export default function PetCard({ pet }: { pet: Pet }) {
  // local bump to re-render on save events
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

  const equip = () => {
    if (!owned) return;
    setEquippedPet(equipped ? null : pet.id);
    window.dispatchEvent(new Event("mm:save"));
  };

  const markOwned = () => {
    if (owned) return;
    setOwnedPets(Array.from(new Set([...getOwnedPets(), pet.id])));
    window.dispatchEvent(new Event("mm:save"));
  };

  return (
    <div
      className={
        "rounded-2xl p-3 bg-zinc-900/60 border " +
        rarityColor[pet.rarity] +
        " flex flex-col items-center gap-2"
      }
    >
      <img src={pet.img} alt={pet.name} class
