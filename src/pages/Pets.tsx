import React from 'react';
import { PETS } from '../data/pets';
import PetCard from '../components/PetCard';

export default function PetsPage() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-white text-xl font-bold mb-3">Pets</h1>
      <p className="text-zinc-400 text-sm mb-4">Collect and equip a pet to gain passive bonuses.</p>
      <div className="grid grid-cols-2 gap-3">{PETS.map(p => <PetCard key={p.id} pet={p} />)}</div>
    </div>
  );
}
