import React from 'react';
import { SUITS } from '../data/suits';
import SuitCard from '../components/SuitCard';

export default function SuitsPage() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-white text-xl font-bold mb-3">Wardrobe</h1>
      <p className="text-zinc-400 text-sm mb-4">See your suits, bonuses, and equip to activate.</p>
      <div className="grid grid-cols-2 gap-3">{SUITS.map(s => <SuitCard key={s.id} suit={s} />)}</div>
    </div>
  );
}
