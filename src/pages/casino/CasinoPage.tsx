// src/pages/casino/CasinoPage.tsx
import React, { useState } from "react";
import CoinFlip from "./CoinFlip";
import BlackjackPlaceholder from "./BlackjackPlaceholder";

export default function CasinoPage({ balance, chips, setChips }) {
  const [tab, setTab] = useState<"blackjack" | "coin">("blackjack");

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-4">

      {/* Casino header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold">Casino</div>
        <div className="text-sm text-emerald-400">
          Chips: {chips.toLocaleString()}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("blackjack")}
          className={`flex-1 py-2 rounded-xl font-semibold ${
            tab === "blackjack"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Blackjack
        </button>

        <button
          onClick={() => setTab("coin")}
          className={`flex-1 py-2 rounded-xl font-semibold ${
            tab === "coin"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Coin Flip
        </button>
      </div>

      {/* Content */}
      {tab === "blackjack" && <BlackjackPlaceholder />}
      {tab === "coin" && (
        <CoinFlip chips={chips} setChips={setChips} />
      )}
    </div>
  );
}
