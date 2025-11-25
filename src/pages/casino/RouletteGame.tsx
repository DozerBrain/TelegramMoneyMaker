// src/pages/casino/RouletteGame.tsx
import React, { useState } from "react";

type Props = {
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;
};

type BetType = "red" | "black";

const MIN_BET = 10;

export default function RouletteGame({ chips, setChips }: Props) {
  const [betType, setBetType] = useState<BetType>("red");
  const [bet, setBet] = useState<number>(MIN_BET);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [lastColor, setLastColor] = useState<BetType | "green" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);

  function handleBetChange(raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(MIN_BET, Math.min(n, chips));
    setBet(clamped);
  }

  function spin() {
    if (chips <= 0) {
      alert("You have no chips.");
      return;
    }
    if (bet < MIN_BET) {
      alert(`Minimum bet is ${MIN_BET} chips.`);
      return;
    }
    if (bet > chips) {
      alert("You don't have enough chips for that bet.");
      return;
    }

    // 0–36
    const n = Math.floor(Math.random() * 37);
    const color: BetType | "green" =
      n === 0 ? "green" : n % 2 === 0 ? "black" : "red";

    setLastNumber(n);
    setLastColor(color);

    let win = false;
    if (color === betType) {
      // x2 payout (get bet back + same amount)
      setChips((c) => c + bet);
      win = true;
    } else {
      setChips((c) => c - bet);
    }
    setLastWin(win);
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/60">
        Simple roulette: bet on <span className="text-red-400">red</span> or{" "}
        <span className="text-white">black</span>. 0 is green (house wins).
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setBetType("red")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            betType === "red"
              ? "bg-red-500 text-red-950"
              : "bg-zinc-800 text-white/70"
          }`}
        >
          Red
        </button>
        <button
          onClick={() => setBetType("black")}
          className={`flex-1 py-2 rounded-full text-sm font-semibold ${
            betType === "black"
              ? "bg-zinc-200 text-black"
              : "bg-zinc-800 text-white/70"
          }`}
        >
          Black
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">
          Bet (min {MIN_BET} chips)
        </div>
        <input
          type="tel"
          value={bet}
          onChange={(e) => handleBetChange(e.target.value)}
          className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
        />
      </div>

      <button
        onClick={spin}
        className="w-full py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
      >
        Spin
      </button>

      <div className="text-xs text-white/60">
        {lastNumber === null ? (
          "No spins yet."
        ) : (
          <>
            Last result:&nbsp;
            <span className="font-semibold text-white">
              {lastNumber}{" "}
              {lastColor === "green"
                ? "🟢"
                : lastColor === "red"
                ? "🔴"
                : "⚫"}
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
          </>
        )}
      </div>
    </div>
  );
}
