import React from "react";
import { suits } from "../data/suits";

type Props = {
  ownedIds?: string[];          // ids the player already owns
  equippedId?: string | null;   // currently equipped suit id
  onChoose?: (id: string) => void; // called when player taps a suit
};

export default function Suits({
  ownedIds = [],
  equippedId = null,
  onChoose,
}: Props) {
  return (
    <div className="p-4 grid gap-3 sm:grid-cols-2">
      {suits.map((suit) => {
        const owned = ownedIds.includes(suit.id) || suit.unlock === 0;
        const equipped = equippedId === suit.id;

        return (
          <div
            key={suit.id}
            className="rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm"
          >
            <img
              src={suit.img}
              alt={suit.name}
              className="h-16 w-16 object-contain rounded-lg"
            />
            <div className="flex-1">
              <div className="font-semibold">{suit.name}</div>
              <div className="text-xs text-gray-500">
                Rarity: {suit.rarity} • Bonus x{suit.bonus}
              </div>
              <div className="text-xs mt-1">
                {owned ? (
                  <span className="text-green-600">Owned</span>
                ) : (
                  <span className="text-amber-600">Unlock: {suit.unlock}</span>
                )}
              </div>
            </div>

            <button
              className={`px-3 py-2 text-sm rounded-xl ${
                equipped
                  ? "bg-black text-white"
                  : owned
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              disabled={!owned}
              onClick={() => onChoose?.(suit.id)}
            >
              {equipped ? "Equipped" : owned ? "Equip" : "Locked"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
