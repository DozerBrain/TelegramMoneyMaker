// src/components/SuitCard.tsx
import React from "react";
import type { Suit } from "../types";
import {
  getOwnedSuits,
  setOwnedSuits,
  getEquippedSuit,
  setEquippedSuit,
} from "../lib/storage";

export default function SuitCard({ suit }: { suit: Suit }) {
  const owned = getOwnedSuits().includes(suit.id);
  const equipped = getEquippedSuit() === suit.id;

  const equip = () => {
    if (!owned) return;
    setEquippedSuit(suit.id);
    window.dispatchEvent(new Event("storage"));
  };

  const markOwned = () => {
    if (owned) return;
    setOwnedSuits(Array.from(new Set([...getOwnedSuits(), suit.id])));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="rounded-2xl p-3 bg-zinc-900/60 border border-zinc-700 flex flex-col items-center gap-2">
      <img src={suit.img} alt={suit.name} className="w-28 h-28 object-contain" />
      <div className="text-center">
        <div className="text-white font-semibold">{suit.name}</div>
        <div className="text-xs text-emerald-300">Bonus x{suit.bonus}</div>
        <div className="text-[11px] text-zinc-400">Unlock: {suit.unlock}</div>
      </div>

      {!owned ? (
        <button
          onClick={markOwned}
          className="mt-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm"
        >
          Mark as Owned
        </button>
      ) : (
        <button
          onClick={equip}
          className={`mt-1 px-3 py-1 rounded-lg text-sm ${
            equipped
              ? "bg-zinc-700 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {equipped ? "Equipped" : "Equip"}
        </button>
      )}
    </div>
  );
}
