// src/pages/casino/SlotsGame.tsx
import React, { useState } from "react";
import { formatMoneyShort } from "../../lib/format";

type Props = {
  chips: number;
  onChipsChange: (next: number) => void;
};

type SpinTier = "lose" | "small" | "medium" | "big" | "jackpot";

type SpinResult = {
  tier: SpinTier;
  multiplier: number; // 0 means total loss, >0 is total returned (bet * multiplier)
  label: string;
};

const MIN_BET = 10;

// simple symbol sets per tier just for visuals
const SYMBOLS = {
  lose: ["🍒", "🍋", "7️⃣"],
  small: ["💎", "🍒", "🍋"],
  medium: ["💎", "💎", "🍀"],
  big: ["💰", "💎", "💰"],
  jackpot: ["💰", "💰", "💰"],
} as const;

function rollSpin(): SpinResult {
  const r = Math.random();

  // 75% lose everything
  if (r < 0.75) {
    return {
      tier: "lose",
      multiplier: 0,
      label: "No win this time.",
    };
  }

  // 15% small win: 1.1x–1.5x back
  if (r < 0.90) {
    const options = [1.1, 1.25, 1.5];
    const mult = options[Math.floor(Math.random() * options.length)];
    return {
      tier: "small",
      multiplier: mult,
      label: "Small win!",
    };
  }

  // 8% medium win: 2x–5x
  if (r < 0.98) {
    const options = [2, 3, 5];
    const mult = options[Math.floor(Math.random() * options.length)];
    return {
      tier: "medium",
      multiplier: mult,
      label: "Nice hit!",
    };
  }

  // 1.9% big win: 10x–20x
  if (r < 0.999) {
    const options = [10, 15, 20];
    const mult = options[Math.floor(Math.random() * options.length)];
    return {
      tier: "big",
      multiplier: mult,
      label: "BIG WIN!",
    };
  }

  // 0.1% jackpot: 50x–100x
  const jackpotOptions = [50, 75, 100];
  const jackpotMult =
    jackpotOptions[Math.floor(Math.random() * jackpotOptions.length)];
  return {
    tier: "jackpot",
    multiplier: jackpotMult,
    label: "JACKPOT!!!",
  };
}

export default function SlotsGame({ chips, onChipsChange }: Props) {
  const [bet, setBet] = useState<number>(MIN_BET);
  const [spinning, setSpinning] = useState(false);
  const [lastTier, setLastTier] = useState<SpinTier | null>(null);
  const [lastNet, setLastNet] = useState<number | null>(null);
  const [lastLabel, setLastLabel] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<string[]>(["💎", "💎", "💎"]);

  function handleBetChange(v: string) {
    const n = Number(v.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(MIN_BET, Math.min(n, chips));
    setBet(clamped);
  }

  function quickBet(amount: number) {
    const clamped = Math.max(MIN_BET, Math.min(amount, chips));
    setBet(clamped);
  }

  function spin() {
    if (spinning) return;
    if (chips < MIN_BET) {
      alert("You don't have enough chips. Exchange some money into chips first.");
      return;
    }
    if (bet < MIN_BET) {
      alert(`Minimum bet is ${MIN_BET} chips.`);
      return;
    }
    if (bet > chips) {
      alert("Not enough chips for that bet.");
      return;
    }

    setSpinning(true);

    // remove bet from chips first
    let nextChips = chips - bet;

    const result = rollSpin();

    // total returned to player (bet * multiplier)
    const totalReturn = Math.floor(bet * result.multiplier);

    if (totalReturn > 0) {
      nextChips += totalReturn;
    }

    const netChange = nextChips - chips; // can be negative or positive

    // update UI state
    setLastTier(result.tier);
    setLastNet(netChange);
    setLastLabel(result.label);

    // update symbols row
    const tierSymbols = SYMBOLS[result.tier];
    setSymbols([
      tierSymbols[0],
      tierSymbols[1],
      tierSymbols[2],
    ]);

    // push new chip count up
    onChipsChange(nextChips);

    // fake small delay so it feels like "spin"
    setTimeout(() => {
      setSpinning(false);
    }, 350);
  }

  const canSpin = !spinning && chips >= MIN_BET;

  return (
    <div className="space-y-4 text-sm text-white">
      {/* Symbols row */}
      <div className="flex justify-center gap-3 text-4xl mb-1">
        {symbols.map((s, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10"
          >
            {s}
          </div>
        ))}
      </div>

      {/* Bet input */}
      <div className="space-y-2">
        <div className="text-xs text-white/60">
          Bet (min {MIN_BET} chips)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
          />
          <div className="flex gap-1">
            {[10, 100, 1000, 10_000].map((v) => (
              <button
                key={v}
                onClick={() => quickBet(v)}
                className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70"
              >
                {formatMoneyShort(v)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={!canSpin}
        className={`w-full py-3 rounded-full font-semibold text-sm active:scale-[0.97] ${
          canSpin
            ? "bg-emerald-500 text-emerald-950"
            : "bg-zinc-700 text-white/40"
        }`}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Result text */}
      <div className="text-xs text-white/60 min-h-[1.25rem]">
        {lastTier === null || lastNet === null ? (
          <span>No spins yet.</span>
        ) : lastNet > 0 ? (
          <span>
            {lastLabel}{" "}
            <span className="text-emerald-400 font-semibold">
              You won +{formatMoneyShort(lastNet)} chips.
            </span>
          </span>
        ) : lastNet < 0 ? (
          <span>
            {lastLabel}{" "}
            <span className="text-red-400 font-semibold">
              You lost {formatMoneyShort(Math.abs(lastNet))} chips.
            </span>
          </span>
        ) : (
          <span>{lastLabel} No net change.</span>
        )}
      </div>

      <div className="mt-1 text-[10px] text-white/35">
        Slots are high risk. Most spins lose. Rare jackpots can pay big, but
        over time the house still wins.
      </div>
    </div>
  );
}
