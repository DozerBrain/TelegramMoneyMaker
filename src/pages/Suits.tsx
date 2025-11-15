// src/pages/Suits.tsx
import React, { useEffect, useState } from "react";
import { suits } from "../data/suits";
import {
  getOwnedSuits,
  setOwnedSuits,
  getEquippedSuit,
  setEquippedSuit,
} from "../lib/storage";
import { formatMoneyShort } from "../lib/format";

type Props = {
  // current balance from App
  balance: number;
};

export default function SuitsPage({ balance }: Props) {
  // bump state to re-render when storage changes
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

  // 🔓 Auto-unlock suits once balance reaches their unlock requirement
  useEffect(() => {
    const owned = getOwnedSuits();
    let updated = [...owned];
    let changed = false;

    for (const s of suits) {
      // Starter should always be owned
      if (s.unlock === 0 && !updated.includes(s.id)) {
        updated.push(s.id);
        changed = true;
      }

      // If player reached the unlock amount and doesn't own it yet → grant it
      if (s.unlock > 0 && balance >= s.unlock && !updated.includes(s.id)) {
        updated.push(s.id);
        changed = true;
      }
    }

    if (changed) {
      setOwnedSuits(updated);
      window.dispatchEvent(new Event("mm:save"));
    }
  }, [balance]);

  const ownedIds = getOwnedSuits();
  const equippedId = getEquippedSuit();

  function handleEquip(id: string, owned: boolean) {
    if (!owned) return;
    setEquippedSuit(id);
    window.dispatchEvent(new Event("mm:save"));
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold text-white">Suits</h1>
      <p className="text-xs text-gray-400">
        Suits unlock automatically when your balance reaches their requirement.
      </p>

      <div className="grid gap-3">
        {suits.map((suit) => {
          const owned = ownedIds.includes(suit.id) || suit.unlock === 0;
          const equipped = equippedId === suit.id;

          return (
            <div
              key={suit.id}
              className="rounded-2xl border border-gray-800 bg-black/40 p-4 flex items-center gap-4 shadow-sm"
            >
              <img
                src={suit.img}
                alt={suit.name}
                className="h-16 w-16 object-contain rounded-lg"
              />

              <div className="flex-1">
                <div className="font-semibold text-white">{suit.name}</div>
                <div className="text-xs text-gray-400">
                  Rarity: {suit.rarity} • Bonus x{suit.bonus}
                </div>
                <div className="text-xs mt-1">
                  {owned ? (
                    <span className="text-emerald-400">Owned</span>
                  ) : (
                    <span className="text-amber-400">
                      Unlock at {formatMoneyShort(suit.unlock)}
                    </span>
                  )}
                </div>
              </div>

              <button
                className={`px-3 py-2 text-sm rounded-xl transition ${
                  equipped
                    ? "bg-emerald-500 text-emerald-950"
                    : owned
                    ? "bg-gray-900 text-white hover:bg-gray-700"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!owned}
                onClick={() => handleEquip(suit.id, owned)}
              >
                {equipped ? "Equipped" : owned ? "Equip" : "Locked"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
