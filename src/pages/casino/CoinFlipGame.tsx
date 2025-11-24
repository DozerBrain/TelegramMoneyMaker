// src/pages/casino/CoinFlipGame.tsx
import React, { useState } from "react";

type Props = {
  chips: number;
  onChipsChange: (next: number) => void;
};

type Side = "heads" | "tails";

export default function CoinFlipGame({ chips, onChipsChange }: Props) {
  const [bet, setBet] = useState<number>(10);
  const [choice, setChoice] = useState<Side>("heads");
  const [lastResult, setLastResult] = useState<null | {
    win: boolean;
    side: Side;
    amount: number;
  }>(null);
  const [flipping, setFlipping] = useState(false);

  const maxBet = Math.max(10, Math.floor(chips / 2)); // can't bet more than half stack

  function handleBetChange(raw: string) {
    const v = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(v)) return;
    const clamped = Math.min(Math.max(1, v), maxBet);
    setBet(clamped);
  }

  function handleAllIn() {
    const v = Math.max(1, Math.floor(chips / 2));
    setBet(v);
  }

  function handleFlip() {
    if (flipping) return;
    if (bet <= 0) return;
    if (bet > chips) {
      alert("You don't have enough chips for that bet.");
      return;
    }

    setFlipping(true);

    // subtract bet immediately
    onChipsChange(chips - bet);

    setTimeout(() => {
      const rolled: Side = Math.random() < 0.5 ? "heads" : "tails";
      const win = rolled === choice;

      let delta = -bet;
      if (win) {
        delta = bet; // net profit: +bet (because we already subtracted)
      }

      const finalChips = chips - bet + (win ? bet * 2 : 0);
      onChipsChange(finalChips);

      setLastResult({
        win,
        side: rolled,
        amount: win ? bet : -bet,
      });

      setFlipping(false);
    }, 900);
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-white">
          Coin Flip – 50 / 50
        </div>
        <div className="text-[11px] text-white/60">
          Pick a side, place your bet, and pray to RNG. Winnings are in chips.
        </div>
      </div>

      {/* Choice buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setChoice("heads")}
          className={`flex-1 py-2 rounded-xl border text-sm font-semibold
            ${
              choice === "heads"
                ? "bg-emerald-500 text-emerald-950 border-emerald-300"
                : "bg-zinc-900 text-white/70 border-white/10"
            }`}
        >
          Heads
        </button>
        <button
          onClick={() => setChoice("tails")}
          className={`flex-1 py-2 rounded-xl border text-sm font-semibold
            ${
              choice === "tails"
                ? "bg-emerald-500 text-emerald-950 border-emerald-300"
                : "bg-zinc-900 text-white/70 border-white/10"
            }`}
        >
          Tails
        </button>
      </div>

      {/* Bet input */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Bet amount (chips)</span>
          <span>Max: {maxBet.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-1.5 text-sm outline-none focus:border-emerald-400"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            inputMode="numeric"
          />
          <button
            onClick={handleAllIn}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-emerald-950 text-xs font-semibold"
          >
            1/2 STACK
          </button>
        </div>
      </div>

      {/* Flip button */}
      <button
        onClick={handleFlip}
        disabled={flipping || bet <= 0 || bet > chips}
        className={`w-full py-2.5 rounded-2xl text-sm font-semibold mt-1
          ${
            flipping || bet <= 0 || bet > chips
              ? "bg-zinc-700 text-zinc-400"
              : "bg-emerald-500 text-emerald-950 active:scale-[0.97]"
          }`}
      >
        {flipping ? "Flipping..." : "Flip the coin"}
      </button>

      {/* Last result */}
      {lastResult && (
        <div
          className={`mt-2 rounded-2xl p-3 text-sm border ${
            lastResult.win
              ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-100"
              : "bg-red-500/10 border-red-400/40 text-red-100"
          }`}
        >
          <div className="font-semibold mb-1">
            {lastResult.win ? "You won!" : "You lost."}
          </div>
          <div className="text-[13px]">
            Coin landed on{" "}
            <span className="font-semibold">{lastResult.side}</span>.{" "}
            {lastResult.win
              ? `+${lastResult.amount.toLocaleString()} chips`
              : `${lastResult.amount.toLocaleString()} chips`}
          </div>
        </div>
      )}
    </div>
  );
}
