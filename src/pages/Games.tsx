// src/pages/Games.tsx
import React, { useState } from "react";
import WorldMapPage from "./WorldMap";
import CasinoPage from "./casino/CasinoPage";

export default function GamesPage({ balance, chips, setChips }) {
  const [mode, setMode] = useState<"world" | "casino">("world");

  return (
    <div className="p-4 pb-20 text-white">

      {/* Header */}
      <div className="mb-4">
        <div className="text-lg font-bold text-emerald-400">Games</div>
        <div className="text-[11px] text-white/60">
          Conquer the world or visit the casino.
        </div>
      </div>

      {/* TOP TABS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("world")}
          className={`flex-1 py-2 text-sm rounded-xl font-semibold ${
            mode === "world"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Conquer the World
        </button>

        <button
          onClick={() => setMode("casino")}
          className={`flex-1 py-2 text-sm rounded-xl font-semibold ${
            mode === "casino"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Casino
        </button>
      </div>

      {/* CONTENT */}
      {mode === "world" && <WorldMapPage balance={balance} />}
      {mode === "casino" && (
        <CasinoPage balance={balance} chips={chips} setChips={setChips} />
      )}
    </div>
  );
}
