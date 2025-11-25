// src/pages/casino/CasinoPage.tsx
import React, { useState } from "react";
import BlackjackGame from "./BlackjackGame";
import CoinFlipGame from "./CoinFlipGame";

type Props = {
  chips: number;
  setChips: (next: number) => void; // ✅ FIXED — this MUST exist
};

type CasinoGame = "blackjack" | "coinflip";

export default function CasinoPage({ chips, setChips }: Props) {
  const [activeGame, setActiveGame] = useState<CasinoGame>("blackjack");

  return (
    <div className="p-4 pb-20 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-emerald-400">
            Casino
          </div>
          <div className="text-[11px] text-white/60">
            High risk, high reward — chips do NOT convert back easily.
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-white/60">Your chips</div>
          <div className="text-lg font-bold text-emerald-300">
            {chips.toLocaleString()} 🟡
          </div>
        </div>
      </div>

      {/* Game selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveGame("blackjack")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold border
            ${
              activeGame === "blackjack"
                ? "bg-emerald-500 text-emerald-950 border-emerald-300 shadow-lg"
                : "bg-zinc-900 text-white/70 border-white/10"
            }`}
        >
          Blackjack
        </button>
        <button
          onClick={() => setActiveGame("coinflip")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold border
            ${
              activeGame === "coinflip"
                ? "bg-emerald-500 text-emerald-950 border-emerald-300 shadow-lg"
                : "bg-zinc-900 text-white/70 border-white/10"
            }`}
        >
          Coin Flip
        </button>
      </div>

      {/* Game panel */}
      <div className="rounded-2xl bg-zinc-950/80 border border-white/10 p-4">
        {activeGame === "blackjack" && (
          <BlackjackGame chips={chips} setChips={setChips} />
        )}

        {activeGame === "coinflip" && (
          <CoinFlipGame chips={chips} setChips={setChips} />
        )}
      </div>

      <div className="mt-3 text-[10px] text-white/40">
        Casino games use your chips only — no conversion to money.
      </div>
    </div>
  );
}
