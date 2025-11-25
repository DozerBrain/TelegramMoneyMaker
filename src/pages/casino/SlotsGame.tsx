// src/pages/casino/SlotsGame.tsx
import React, { useMemo, useState } from "react";
import { formatMoneyShort } from "../../lib/format";

type Props = {
  chips: number;
  onChipsChange: (next: number) => void;
};

type ResultKind = "none" | "lose" | "small" | "medium" | "big" | "jackpot";

export default function SlotsGame({ chips, onChipsChange }: Props) {
  const MIN_BET = 10;

  const [bet, setBet] = useState<number>(MIN_BET);
  const [spinning, setSpinning] = useState(false);
  const [kind, setKind] = useState<ResultKind>("none");
  const [delta, setDelta] = useState<number>(0);
  const [totalWin, setTotalWin] = useState<number>(0);
  const [reels, setReels] = useState<string[]>(["💎", "💎", "💎"]);

  // ---- dynamic max bet (10% of chips, capped) -----------------------------
  const maxBet = useMemo(() => {
    if (chips <= MIN_BET) return MIN_BET;
    const tenPercent = Math.floor(chips * 0.1);
    return Math.max(MIN_BET, Math.min(100_000, tenPercent));
  }, [chips]);

  // keep bet always valid if chips change
  React.useEffect(() => {
    setBet((prev) => {
      const clamped = Math.max(
        MIN_BET,
        Math.min(prev || MIN_BET, maxBet, chips)
      );
      return clamped;
    });
  }, [chips, maxBet]);

  function handleBetChange(raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(MIN_BET, Math.min(n, maxBet, chips));
    setBet(clamped);
  }

  function quickBet(amount: number) {
    const clamped = Math.max(MIN_BET, Math.min(amount, maxBet, chips));
    setBet(clamped);
  }

  function spin() {
    if (spinning) return;
    if (chips < MIN_BET) {
      alert("Not enough chips. Exchange money into chips first.");
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

    setSpinning(true);

    // 🎲 Outcome probabilities (total-return RTP ≈ 84%)
    // 72%  -> lose (0x)
    // 18%  -> small win (~1.05–1.3x)
    // 7%   -> medium win (~2–4x)
    // 2.8% -> big win (~8–15x)
    // 0.2% -> JACKPOT (50x)
    let r = Math.random();
    let outcome: ResultKind;
    let multiplier: number;

    if (r < 0.72) {
      outcome = "lose";
      multiplier = 0;
    } else if (r < 0.72 + 0.18) {
      outcome = "small";
      multiplier = 1.05 + Math.random() * 0.25; // 1.05–1.30
    } else if (r < 0.72 + 0.18 + 0.07) {
      outcome = "medium";
      multiplier = 2 + Math.random() * 2; // 2–4
    } else if (r < 0.72 + 0.18 + 0.07 + 0.028) {
      outcome = "big";
      multiplier = 8 + Math.random() * 7; // 8–15
    } else {
      outcome = "jackpot";
      multiplier = 50; // insane hit
    }

    // fake reel visuals by outcome
    let newReels: string[];
    switch (outcome) {
      case "lose":
        newReels = ["🍒", "💎", "7️⃣"];
        break;
      case "small":
        newReels = ["💎", "💎", "🍀"];
        break;
      case "medium":
        newReels = ["7️⃣", "7️⃣", "💎"];
        break;
      case "big":
        newReels = ["💰", "💰", "7️⃣"];
        break;
      case "jackpot":
        newReels = ["💸", "💸", "💸"];
        break;
      default:
        newReels = ["💎", "💎", "💎"];
    }

    // chips math
    const winTotal = Math.floor(bet * multiplier); // total returned
    const netDelta = winTotal - bet; // profit (can be negative)
    let nextChips = chips - bet + winTotal;
    if (!Number.isFinite(nextChips) || nextChips < 0) nextChips = 0;

    // apply
    setTimeout(() => {
      onChipsChange(nextChips);
      setReels(newReels);
      setKind(outcome);
      setDelta(netDelta);
      setTotalWin(winTotal);
      setSpinning(false);
    }, 450); // tiny delay feels more like a spin
  }

  // ---- helper labels / colors ---------------------------------------------
  function resultLabel() {
    if (kind === "none") return "No spins yet.";
    if (delta === 0 && kind === "lose") return "You lost your bet.";
    if (delta < 0) return `You lost ${formatMoneyShort(-delta)} chips.`;

    switch (kind) {
      case "small":
        return `Small win: +${formatMoneyShort(delta)} chips.`;
      case "medium":
        return `Nice hit: +${formatMoneyShort(delta)} chips!`;
      case "big":
        return `BIG WIN: +${formatMoneyShort(delta)} chips!!`;
      case "jackpot":
        return `JACKPOT 💸 +${formatMoneyShort(delta)} chips!!!`;
      default:
        return `You won +${formatMoneyShort(delta)} chips.`;
    }
  }

  const resultColor =
    kind === "none"
      ? "text-white/50"
      : delta > 0
      ? kind === "jackpot"
        ? "text-emerald-300"
        : "text-emerald-400"
      : "text-red-400";

  return (
    <div className="space-y-4 text-sm text-white">
      {/* Reels */}
      <div className="flex justify-center gap-3 text-5xl mb-1">
        {reels.map((r, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center"
          >
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* Bet controls */}
      <div className="space-y-2">
        <div className="text-xs text-white/60">
          Bet (min {MIN_BET}, max {formatMoneyShort(maxBet)} chips)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
          />
          <div className="flex flex-wrap gap-1">
            {[10, 100, 1000, maxBet].map((v) => (
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
        <div className="text-[11px] text-white/40">
          Your chips: {formatMoneyShort(chips)}
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning || chips < MIN_BET}
        className={`w-full py-3 rounded-full font-semibold text-sm active:scale-[0.97] ${
          spinning || chips < MIN_BET
            ? "bg-zinc-700 text-white/40"
            : "bg-emerald-500 text-emerald-950"
        }`}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Result text */}
      <div className={`text-xs ${resultColor}`}>{resultLabel()}</div>

      <div className="mt-1 text-[10px] text-white/35">
        Design note: this slot is high-volatility. Most spins lose, but sometimes
        you hit huge multipliers. Over time the casino still wins.
      </div>
    </div>
  );
}
