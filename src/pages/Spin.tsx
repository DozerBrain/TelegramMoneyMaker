// src/pages/Spin.tsx
import React, { useMemo, useState } from "react";
import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance: number;
  setBalance: (n: number) => void;
  tapValue: number;
  setTapValue: (n: number) => void;
  autoPerSec: number;
  setAutoPerSec: (n: number) => void;
  multi: number;
  setMulti: (n: number) => void;
  spinCooldownEndsAt: number | null;
  setSpinCooldownEndsAt: (t: number | null) => void;
};

const COOLDOWN_MS = 1000 * 60 * 60 * 8; // 8 hours

// Small helper to set jackpot flags for pets
function setJackpotFlag(key: "mm_jp_legendary" | "mm_jp_mythic" | "mm_jp_ultimate") {
  try {
    localStorage.setItem(key, "1");
    window.dispatchEvent(new Event("mm:save"));
  } catch {
    // ignore (e.g. private mode)
  }
}

function fmtTime(ms: number) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}

export default function Spin(p: Props) {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastJackpot, setLastJackpot] = useState<"none" | "legendary" | "mythic" | "ultimate">("none");

  const now = Date.now();
  const remaining = p.spinCooldownEndsAt ? Math.max(0, p.spinCooldownEndsAt - now) : 0;
  const canSpin = remaining === 0;

  const cooldownLabel = useMemo(
    () => (canSpin ? "Ready" : fmtTime(remaining)),
    [canSpin, remaining]
  );

  function spinOnce() {
    if (!canSpin) return;

    let msg = "";
    let jackpot: "none" | "legendary" | "mythic" | "ultimate" = "none";

    const r = Math.random();

    // 🎰 JACKPOT TIERS (very low chance)
    // ~0.05% ultimate, ~0.2% mythic, ~1% legendary total ~1.25%
    if (r < 0.0005) {
      // ULTIMATE JACKPOT
      jackpot = "ultimate";
      setJackpotFlag("mm_jp_ultimate");

      // Massive reward: big cash + big global multi boost
      const cash = Math.max(5_000_000, Math.floor(p.balance * 0.25));
      p.setBalance(p.balance + cash);
      p.setMulti(parseFloat((p.multi * 2).toFixed(2)));

      msg = `🐉 ULTIMATE JACKPOT! +${formatMoneyShort(cash)} & x2 global multi`;
    } else if (r < 0.002) {
      // MYTHIC JACKPOT
      jackpot = "mythic";
      setJackpotFlag("mm_jp_mythic");

      const cash = Math.max(1_000_000, Math.floor(p.balance * 0.12));
      p.setBalance(p.balance + cash);
      p.setAutoPerSec(p.autoPerSec + 10);

      msg = `🔥 MYTHIC JACKPOT! +${formatMoneyShort(cash)} & +10 auto/sec`;
    } else if (r < 0.01) {
      // LEGENDARY JACKPOT
      jackpot = "legendary";
      setJackpotFlag("mm_jp_legendary");

      const cash = Math.max(200_000, Math.floor(p.balance * 0.06));
      p.setBalance(p.balance + cash);
      p.setTapValue(p.tapValue + 5);

      msg = `💎 LEGENDARY JACKPOT! +${formatMoneyShort(cash)} & +5 tap value`;
    } else {
      // 💰 NORMAL REWARDS
      // Re-balance probabilities inside the remaining 99%
      const x = Math.random();

      if (x < 0.45) {
        // Cash: 2% of balance (min 5k)
        const cash = Math.max(5_000, Math.floor(p.balance * 0.02));
        p.setBalance(p.balance + cash);
        msg = `💵 Bonus cash +${formatMoneyShort(cash)}`;
      } else if (x < 0.75) {
        // Tap upgrade
        p.setTapValue(p.tapValue + 1);
        msg = "👆 Tap value +1";
      } else if (x < 0.95) {
        // Auto income
        p.setAutoPerSec(p.autoPerSec + 2);
        msg = "⚙️ Auto income +2 / sec";
      } else {
        // Global multiplier
        const newMulti = parseFloat((p.multi * 1.2).toFixed(2));
        p.setMulti(newMulti);
        msg = `✨ Global multiplier x${newMulti.toFixed(2)}`;
      }
    }

    p.setSpinCooldownEndsAt(Date.now() + COOLDOWN_MS);
    setLastResult(msg);
    setLastJackpot(jackpot);
  }

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card
        title="Daily Spin"
        right={
          <div className="badge">
            Balance: {formatMoneyShort(p.balance)}
          </div>
        }
      >
        <p className="opacity-80 mb-2 text-sm">
          Spin every <b>8 hours</b> for powerful boosts and rare jackpots.
        </p>

        <div className="flex items-center justify-between text-xs mb-3 text-gray-400">
          <span>Status: {canSpin ? "Ready to spin" : "On cooldown"}</span>
          <span>Cooldown: {cooldownLabel}</span>
        </div>

        <button
          onClick={spinOnce}
          className="btn-primary w-full text-lg"
          disabled={!canSpin}
        >
          {canSpin ? "Spin the Wheel 🎡" : `Cooldown: ${cooldownLabel}`}
        </button>

        {/* Last result */}
        <div className="mt-4 rounded-xl bg-black/40 border border-white/10 p-3 text-sm">
          <div className="text-xs text-gray-400 mb-1">Last result</div>
          <div className="text-[13px] text-white min-h-[1.2em]">
            {lastResult ?? "Spin to see your reward."}
          </div>
          {lastJackpot !== "none" && (
            <div className="mt-1 text-[11px] text-emerald-300">
              Jackpot tier:{" "}
              {lastJackpot === "legendary"
                ? "Legendary – helps unlock Unicorn Pegasus 🦄"
                : lastJackpot === "mythic"
                ? "Mythic – unlocks Fourarms Goblin 👹"
                : "Ultimate – unlocks Crypto Dragon 🐉"}
            </div>
          )}
        </div>

        {/* Info list */}
        <ul className="list-disc pl-6 mt-4 text-sm opacity-80 space-y-1">
          <li>💵 Scaled cash rewards based on your balance</li>
          <li>👆 Permanent tap upgrades</li>
          <li>⚙️ Auto income boosts</li>
          <li>✨ Global multiplier boosts</li>
          <li>💎 Legendary / 🔥 Mythic / 🐉 Ultimate jackpots for rare pets</li>
        </ul>
      </Card>
    </div>
  );
    }
