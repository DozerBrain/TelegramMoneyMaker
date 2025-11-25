// src/pages/casino/SlotsGame.tsx
import React, { useState } from "react";

type Props = {
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;
};

const SYMBOLS = ["💸", "💎", "⭐", "7️⃣", "🍀"] as const;
const MIN_BET = 10;

export default function SlotsGame({ chips, setChips }: Props) {
  const [bet, setBet] = useState<number>(MIN_BET);
  const [reels, setReels] = useState<string[]>(["💸", "💎", "⭐"]);
  const [lastWin, setLastWin] = useState<number | null>(null);

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

    const roll = () =>
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const r1 = roll();
    const r2 = roll();
    const r3 = roll();

    setReels([r1, r2, r3]);

    let win = 0;
    if (r1 === r2 && r2 === r3) {
      // triple = x10
      win = bet * 10;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      // any pair = x2
      win = bet * 2;
    } else {
      win = -bet;
    }

    if (win >= 0) {
      setChips((c) => c + win);
    } else {
      setChips((c) => c + win); // win is negative
    }
    setLastWin(win);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2 text-3xl">
        {reels.map((s, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            {s}
          </div>
        ))}
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
        {lastWin === null ? (
          "No spins yet."
        ) : lastWin > 0 ? (
          <span className="text-emerald-400 font-semibold">
            You won +{lastWin} chips
          </span>
        ) : lastWin === 0 ? (
          "Break even."
        ) : (
          <span className="text-red-400 font-semibold">
            You lost {Math.abs(lastWin)} chips
          </span>
        )}
      </div>
    </div>
  );
}
