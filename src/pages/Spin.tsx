// src/pages/Spin.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";
import { getOwnedPets, setOwnedPets, setEquippedPet } from "../lib/storage";
import { PETS } from "../data/pets";

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

function fmtTime(ms: number) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}

// Give a jackpot pet based on rarity roll
function grantJackpotPet(): string {
  // weights inside jackpot:
  // 60% Unicorn (Legendary), 30% Goblin (Mythic), 10% Dragon (Ultimate)
  const r = Math.random();
  let petId: string;
  if (r < 0.6) petId = "unicorn";
  else if (r < 0.9) petId = "goblin";
  else petId = "dragon";

  const owned = new Set(getOwnedPets());
  const alreadyOwned = owned.has(petId);
  owned.add(petId);
  setOwnedPets(Array.from(owned));

  // Auto-equip new jackpot pet
  if (!alreadyOwned) {
    setEquippedPet(petId);
  }

  // Make other parts of the app react to pet changes
  window.dispatchEvent(new Event("mm:save"));

  const pet = PETS.find((p) => p.id === petId);
  if (!pet) return "JACKPOT! New pet unlocked!";

  if (alreadyOwned) {
    return `Jackpot hit: ${pet.name} (already owned)`;
  }
  return `JACKPOT! New pet unlocked: ${pet.name}`;
}

export default function Spin(p: Props) {
  const [lastReward, setLastReward] = useState<string | null>(null);

  const now = Date.now();
  const remaining = p.spinCooldownEndsAt
    ? Math.max(0, p.spinCooldownEndsAt - now)
    : 0;
  const canSpin = remaining === 0;

  function spinOnce() {
    if (!canSpin) return;

    const r = Math.random();
    let rewardText = "";

    // 🎁 Reward table:
    // 0.00–0.40  -> Cash (~5% balance, min 1K)
    // 0.40–0.70  -> Tap value boost
    // 0.70–0.90  -> Auto income boost
    // 0.90–0.98  -> Global multiplier
    // 0.98–1.00  -> PET JACKPOT (Unicorn / Goblin / Dragon)

    if (r < 0.4) {
      // 💵 Cash
      const base = Math.max(1000, Math.floor(p.balance * 0.05));
      p.setBalance(p.balance + base);
      rewardText = `+${formatMoneyShort(base)} cash`;
    } else if (r < 0.7) {
      // 👆 Tap value
      const delta = Math.max(1, Math.floor(Math.max(1, p.tapValue * 0.15)));
      p.setTapValue(p.tapValue + delta);
      rewardText = `+${delta.toLocaleString()} tap value`;
    } else if (r < 0.9) {
      // ⚙️ Auto income
      const delta = Math.max(1, Math.floor(Math.max(1, p.autoPerSec * 0.15)));
      p.setAutoPerSec(p.autoPerSec + delta);
      rewardText = `+${delta.toLocaleString()} APS`;
    } else if (r < 0.98) {
      // ✨ Multiplier
      const newMulti = parseFloat((p.multi * 1.25).toFixed(2));
      p.setMulti(newMulti);
      rewardText = `Multiplier boosted to x${newMulti.toFixed(2)}`;
    } else {
      // 🐉 JACKPOT PET
      rewardText = grantJackpotPet();
    }

    setLastReward(rewardText);
    p.setSpinCooldownEndsAt(Date.now() + COOLDOWN_MS);
  }

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card
        title="Daily Spin"
        right={
          <div className="badge">
            Balance: ${formatMoneyShort(p.balance)}
          </div>
        }
      >
        <p className="opacity-80 mb-2 text-sm">
          Spin for big rewards. Cooldown every <b>8 hours</b>.
        </p>

        {!canSpin && (
          <p className="text-xs text-emerald-300 mb-2">
            Next free spin in: {fmtTime(remaining)}
          </p>
        )}

        <button
          onClick={spinOnce}
          className="btn-primary w-full text-lg"
          disabled={!canSpin}
        >
          {canSpin ? "Spin the Wheel 🎡" : "On Cooldown"}
        </button>

        {lastReward && (
          <div className="mt-3 text-sm text-emerald-300">
            Last reward: <span className="font-semibold">{lastReward}</span>
          </div>
        )}

        <div className="mt-4 text-xs text-zinc-400">
          <div className="font-semibold mb-1">Possible rewards</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>💵 ~5% of your balance in cash</li>
            <li>👆 +15% tap value (min +1)</li>
            <li>⚙️ +15% auto income APS (min +1)</li>
            <li>✨ +25% global multiplier</li>
            <li>🐉 <b>Jackpot:</b> Legendary / Mythic / Ultimate pet</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
