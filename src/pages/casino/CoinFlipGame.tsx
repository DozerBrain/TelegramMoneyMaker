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
  const [lastFlip, setLastFlip] = useState<Side | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);

  const minBet = 10;

  function handleBetChange(value: string) {
    const n = Number(value.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(minBet, Math.min(n, chips));
    setBet(clamped);
  }

  function setQuickBet(amount: number) {
    const clamped = Math.max(minBet, Math.min(amount, chips));
    setBet(clamped);
  }

  function handleFlip() {
    if (chips <= 0) {
      alert("You have no chips. Exchange money into chips first.");
      return;
    }
    if (bet < minBet) {
      alert(`Minimum bet is ${minBet} chips.`);
      return;
    }
    if (bet > chips) {
      alert("You don't have enough chips for that bet.");
      return;
    }

    const flip: Side = Math.random() < 0.5 ? "heads" : "tails";
    const win = flip === choice;

    if (win) {
      onChipsChange(chips + bet);
    } else {
      onChipsChange(Math.max(0, chips - bet));
    }

    setLastFlip(flip);
    setLastWin(win);
  }

  return (
    <div className="space-y-3 text-sm text-white">
      {/* Choose side */}
      <div className="flex gap-2">
        <button
          onClick={() => setChoice("heads")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            choice === "heads"
              ? "bg-emerald-500 text-emerald-950"
              : "bg-zinc-800 text-white/70"
          }`}
        >
          Heads
        </button>
        <button
          onClick={() => setChoice("tails")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            choice === "tails"
              ? "bg-emerald-500 text-emerald-950"
              : "bg-zinc-800 text-white/70"
          }`}
        >
          Tails
        </button>
      </div>

      {/* Bet input + quick bets */}
      <div className="space-y-2">
        <div className="text-xs text-white/60">
          Bet (min {minBet} chips)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
          />
          <div className="flex gap-1">
            {[10, 50, 100, 500].map((v) => (
              <button
                key={v}
                onClick={() => setQuickBet(v)}
                className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flip button */}
      <button
        onClick={handleFlip}
        className="w-full py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
      >
        Flip the Coin
      </button>

      {/* Last result */}
      <div className="text-xs text-white/60">
        {lastFlip === null ? (
          <span>No flips yet.</span>
        ) : (
          <span>
            Last flip:&nbsp;
            <span className="font-semibold text-white">
              {lastFlip.toUpperCase()}
            </span>{" "}
            –{" "}
            {lastWin ? (
              <span className="text-emerald-400 font-semibold">
                YOU WON +{bet} chips
              </span>
            ) : (
              <span className="text-red-400 font-semibold">
                YOU LOST -{bet} chips
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
