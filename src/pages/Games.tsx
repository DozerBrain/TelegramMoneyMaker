// src/pages/Games.tsx
import React from "react";
import WorldMapPage from "./WorldMap";

type Props = {
  balance: number;
  // later we can add:
  // setBalance: (fn: (prev: number) => number) => void;
};

export default function GamesPage({ balance }: Props) {
  return (
    <div className="p-4 pb-20 text-white">
      <h1 className="text-lg font-semibold mb-3">Games</h1>

      {/* Game list */}
      <div className="space-y-3">
        {/* Conquer the World (World Map) */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Conquer the World</div>
              <div className="text-[11px] text-white/60">
                Buy countries, unlock regions, and boost your APS & coupons.
              </div>
            </div>
          </div>

          {/* Embed the existing WorldMap mini-game */}
          <div className="border-t border-white/10">
            <WorldMapPage balance={balance} />
          </div>
        </div>

        {/* Casino placeholder – we’ll build this next */}
        <div className="rounded-2xl bg-zinc-900/60 border border-dashed border-emerald-500/40 px-4 py-3">
          <div className="text-sm font-semibold text-emerald-300">
            Casino (coming soon)
          </div>
          <div className="text-[11px] text-white/60 mt-1">
            Blackjack, Roulette, CoinFlip, Slots and more — using Chips
            currency and daily exchange limits.
          </div>
        </div>
      </div>
    </div>
  );
}
