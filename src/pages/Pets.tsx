// src/pages/Pets.tsx
import React from "react";
import { PETS } from "../data/pets";
import PetCard from "../components/PetCard";
import CardFrame from "../components/CardFrame";

export default function Pets() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-emerald-200">Pets</h1>
      <div className="grid grid-cols-1 gap-3">
        {PETS.map((pet) => (
          <CardFrame key={pet.id}>
            <PetCard pet={pet} />
          </CardFrame>
        ))}
      </div>
    </div>
  );
}
