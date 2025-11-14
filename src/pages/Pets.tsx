// src/pages/Pets.tsx
import React from "react";
import { PETS } from "../data/pets";
import PetCard from "../components/PetCard";

export default function PetsPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-semibold text-emerald-200">Pets</h1>
      <div className="grid grid-cols-2 gap-3">
        {PETS.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
