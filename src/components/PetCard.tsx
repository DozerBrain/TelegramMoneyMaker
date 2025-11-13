import React from 'react';
import { Pet } from '../data/pets';
import { getOwnedPets, setOwnedPets, getEquippedPet, setEquippedPet } from '../lib/storage';

const rarityColor: Record<Pet['rarity'], string> = {
  Common: 'border-slate-500',
  Uncommon: 'border-emerald-500',
  Rare: 'border-cyan-500',
  Epic: 'border-violet-500',
  Legendary: 'border-yellow-500',
  Mythic: 'border-red-500',
  Ultimate: 'border-rose-500',
};

export default function PetCard({ pet }: { pet: Pet }) {
  const owned = getOwnedPets().includes(pet.id);
  const equipped = getEquippedPet() === pet.id;

  const equip = () => {
    if (!owned) return;
    setEquippedPet(equipped ? null : pet.id);
    window.dispatchEvent(new Event('storage')); // refresh listeners
  };

  const markOwned = () => {
    if (owned) return;
    setOwnedPets(Array.from(new Set([...getOwnedPets(), pet.id])));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className={`rounded-2xl p-3 bg-zinc-900/60 border ${rarityColor[pet.rarity]} flex flex-col items-center gap-2`}>
      <img src={pet.img} alt={pet.name} className="w-28 h-28 object-contain" />
      <div className="text-center">
        <div className
