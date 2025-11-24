// src/pages/casino/CoinFlip.tsx
import React, { useState } from "react";

export default function CoinFlip({ chips, setChips }) {
  const [bet, setBet] = useState(100);
  const [side, setSide] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<null | "heads" | "tails">(null);

  function play() {
    if (bet <= 0 || bet > chips) return;
    if (!side) return;

    const flip = Math.random() < 0.5 ? "heads" : "tails";
    setResult(flip);

    if (flip === side) {
      setChips((c) => c + bet); // +win
    } else {
      setChips((c) => c - bet); // -lose
    }
  }

  return (
    <div className="text-sm">

      <div className="mb-3">
        <div className="text-white/60 mb-1">Your bet</div>
        <input
          type="number"
          className="w-full p-2 rounded bg-zinc-800 border border-white/10"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide("heads")}
          className={`flex-1 py-2 rounded-xl font-semibold ${
            side === "heads"
              ? "bg-emerald-600"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Heads
        </button>

        <button
          onClick={() => setSide("tails")}
          className={`flex-1 py-2 rounded-xl font-semibold ${
            side === "tails"
              ? "bg-emerald-600"
              : "bg-zinc-800 text-white/60"
          }`}
        >
          Tails
        </button>
      </div>

      <button
        onClick={play}
        className="w-full py-2 rounded-xl bg-emerald-500 font-bold"
      >
        Flip
      </button>

      {result && (
        <div className="mt-4 text-center text-lg">
          Result:{" "}
          <span
            className={
              result === side ? "text-emerald-400" : "text-red-400"
            }
          >
            {result.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
