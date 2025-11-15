// src/pages/Spin.tsx
import React, { useMemo, useState } from "react";
import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";
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

// ---- Jackpot flags (for pets) ----
function setJackpotFlag(
  key: "mm_jp_legendary" | "mm_jp_mythic" | "mm_jp_ultimate"
) {
  try {
    localStorage.setItem(key, "1");
    window.dispatchEvent(new Event("mm:save"));
  } catch {
    // ignore
  }
}

function fmtTime(ms: number) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}

// ---- Reward types ----
type RewardKind =
  | "cash_small"
  | "cash_big"
  | "tap"
  | "auto"
  | "multi"
  | "jackpot_legendary"
  | "jackpot_mythic"
  | "jackpot_ultimate";

type RewardSlot = {
  id: string;
  label: string;
  desc: string;
  kind: RewardKind;
  weight: number;
  petId?: string; // for jackpot slices, to show a tiny pet icon
};

const REWARDS: RewardSlot[] = [
  {
    id: "cash_small",
    label: "Cash Boost",
    desc: "Small cash boost",
    kind: "cash_small",
    weight: 30,
  },
  {
    id: "tap_up",
    label: "+Tap",
    desc: "Increase tap value",
    kind: "tap",
    weight: 20,
  },
  {
    id: "auto_up",
    label: "Auto/sec",
    desc: "Increase auto income",
    kind: "auto",
    weight: 15,
  },
  {
    id: "multi_up",
    label: "Multi",
    desc: "Increase global multiplier",
    kind: "multi",
    weight: 15,
  },
  {
    id: "cash_big",
    label: "Big Cash",
    desc: "Big cash boost",
    kind: "cash_big",
    weight: 15,
  },
  {
    id: "jp_legendary",
    label: "Legendary",
    desc: "Legendary Jackpot",
    kind: "jackpot_legendary",
    weight: 3,
    petId: "unicorn", // Unicorn Pegasus
  },
  {
    id: "jp_mythic",
    label: "Mythic",
    desc: "Mythic Jackpot",
    kind: "jackpot_mythic",
    weight: 1,
    petId: "goblin", // Fourarms Goblin
  },
  {
    id: "jp_ultimate",
    label: "Ultimate",
    desc: "Ultimate Jackpot",
    kind: "jackpot_ultimate",
    weight: 1,
    petId: "dragon", // Crypto Dragon
  },
];

// map jackpot kind → pet image (if found)
const petIconByKind: Partial<Record<RewardKind, string>> = (() => {
  const byId = (id: string) => PETS.find((p) => p.id === id)?.img;
  return {
    jackpot_legendary: byId("unicorn") || "",
    jackpot_mythic: byId("goblin") || "",
    jackpot_ultimate: byId("dragon") || "",
  };
})();

function pickRewardIndex(): number {
  const total = REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let x = Math.random() * total;
  for (let i = 0; i < REWARDS.length; i++) {
    x -= REWARDS[i].weight;
    if (x <= 0) return i;
  }
  return REWARDS.length - 1;
}

export default function Spin(p: Props) {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastJackpot, setLastJackpot] =
    useState<"none" | "legendary" | "mythic" | "ultimate">("none");

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const now = Date.now();
  const remaining = p.spinCooldownEndsAt
    ? Math.max(0, p.spinCooldownEndsAt - now)
    : 0;
  const canSpin = remaining === 0;

  const cooldownLabel = useMemo(
    () => (canSpin ? "Ready" : fmtTime(remaining)),
    [canSpin, remaining]
  );

  function applyReward(idx: number) {
    const r = REWARDS[idx];
    let msg = "";
    let jackpot: "none" | "legendary" | "mythic" | "ultimate" = "none";

    switch (r.kind) {
      case "cash_small": {
        const cash = Math.max(5_000, Math.floor(p.balance * 0.02));
        p.setBalance(p.balance + cash);
        msg = `💵 Cash boost +${formatMoneyShort(cash)}`;
        break;
      }
      case "cash_big": {
        const cash = Math.max(50_000, Math.floor(p.balance * 0.06));
        p.setBalance(p.balance + cash);
        msg = `💰 Big cash +${formatMoneyShort(cash)}`;
        break;
      }
      case "tap": {
        const newTap = p.tapValue + 1;
        p.setTapValue(newTap);
        msg = `👆 Tap value +1 (now ${newTap})`;
        break;
      }
      case "auto": {
        const newAuto = p.autoPerSec + 2;
        p.setAutoPerSec(newAuto);
        msg = `⚙️ Auto income +2/sec (now ${newAuto})`;
        break;
      }
      case "multi": {
        const newMulti = parseFloat((p.multi * 1.2).toFixed(2));
        p.setMulti(newMulti);
        msg = `✨ Global multi x${newMulti.toFixed(2)}`;
        break;
      }
      case "jackpot_legendary": {
        jackpot = "legendary";
        setJackpotFlag("mm_jp_legendary");
        const cash = Math.max(200_000, Math.floor(p.balance * 0.06));
        p.setBalance(p.balance + cash);
        const newTap = p.tapValue + 5;
        p.setTapValue(newTap);
        msg = `💎 LEGENDARY JACKPOT! +${formatMoneyShort(
          cash
        )} & Tap +5 (now ${newTap})`;
        break;
      }
      case "jackpot_mythic": {
        jackpot = "mythic";
        setJackpotFlag("mm_jp_mythic");
        const cash = Math.max(1_000_000, Math.floor(p.balance * 0.12));
        p.setBalance(p.balance + cash);
        const newAuto = p.autoPerSec + 10;
        p.setAutoPerSec(newAuto);
        msg = `🔥 MYTHIC JACKPOT! +${formatMoneyShort(
          cash
        )} & Auto +10/sec (now ${newAuto})`;
        break;
      }
      case "jackpot_ultimate": {
        jackpot = "ultimate";
        setJackpotFlag("mm_jp_ultimate");
        const cash = Math.max(5_000_000, Math.floor(p.balance * 0.25));
        p.setBalance(p.balance + cash);
        const newMulti = parseFloat((p.multi * 2).toFixed(2));
        p.setMulti(newMulti);
        msg = `🐉 ULTIMATE JACKPOT! +${formatMoneyShort(
          cash
        )} & Global multi x${newMulti.toFixed(2)}`;
        break;
      }
    }

    p.setSpinCooldownEndsAt(Date.now() + COOLDOWN_MS);
    setLastResult(msg);
    setLastJackpot(jackpot);
  }

  function spinOnce() {
    if (!canSpin || isSpinning) return;

    const idx = pickRewardIndex();
    setPendingIndex(idx);

    const segments = REWARDS.length;
    const anglePer = 360 / segments;

    // angle of the chosen segment center
    const targetSegmentAngle = idx * anglePer + anglePer / 2;

    const baseRot = wheelRotation % 360;
    const extraSpins = 4;
    const targetRotation =
      baseRot + extraSpins * 360 + (360 - targetSegmentAngle);

    setIsSpinning(true);
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const finalIdx = pendingIndex ?? idx;
      applyReward(finalIdx);
      setPendingIndex(null);
    }, 2100);
  }

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card
        title="Daily Spin"
        right={<div className="badge">Balance: {formatMoneyShort(p.balance)}</div>}
      >
        <p className="opacity-80 mb-2 text-sm">
          Spin every <b>8 hours</b> for boosts and rare jackpots. Legendary,
          Mythic and Ultimate jackpots help unlock special pets.
        </p>

        <div className="flex items-center justify-between text-xs mb-3 text-gray-400">
          <span>Status: {canSpin ? "Ready to spin" : "On cooldown"}</span>
          <span>Cooldown: {cooldownLabel}</span>
        </div>

        {/* POINTER */}
        <div className="flex justify-center mb-1">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-emerald-400 drop-shadow" />
        </div>

        {/* WHEEL */}
        <div className="flex flex-col items-center gap-4 mt-1">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_0%,rgba(16,185,129,0.35),transparent_55%)]" />
            {/* Main wheel that spins */}
            <div
              className="absolute inset-[10%] rounded-full bg-slate-950/90 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.35)] overflow-hidden transition-transform duration-[2000ms] ease-out"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {/* center circle */}
              <div className="absolute inset-[35%] rounded-full bg-black/70 border border-white/10" />

              {/* Segments labels around rim */}
              {REWARDS.map((r, index) => {
                const segments = REWARDS.length;
                const anglePer = 360 / segments;
                const angle = index * anglePer;
                const isJackpot =
                  r.kind === "jackpot_legendary" ||
                  r.kind === "jackpot_mythic" ||
                  r.kind === "jackpot_ultimate";

                const icon =
                  isJackpot && petIconByKind[r.kind]
                    ? petIconByKind[r.kind]
                    : null;

                return (
                  <div
                    key={r.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      // 1) center this element, 2) rotate, 3) push outward
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -80%)`,
                      transformOrigin: "50% 50%",
                    }}
                  >
                    <div
                      className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border whitespace-nowrap ${
                        isJackpot
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 font-semibold"
                          : "border-white/10 bg-black/50 text-slate-100"
                      }`}
                      style={{
                        // keep pill upright
                        transform: `rotate(${-angle}deg)`,
                      }}
                    >
                      {icon && (
                        <img
                          src={icon}
                          alt={r.label}
                          className="w-4 h-4 rounded-full object-contain"
                        />
                      )}
                      <span>{r.label.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={spinOnce}
            className={`btn-primary w-full text-lg ${
              (!canSpin || isSpinning) && "opacity-60 cursor-not-allowed"
            }`}
            disabled={!canSpin || isSpinning}
          >
            {canSpin
              ? isSpinning
                ? "Spinning..."
                : "Spin the Wheel 🎡"
              : `Cooldown: ${cooldownLabel}`}
          </button>
        </div>

        {/* Last result box */}
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
          <li>💵 Cash rewards scale with your balance.</li>
          <li>👆 Tap upgrades are permanent.</li>
          <li>⚙️ Auto/sec boosts passive income.</li>
          <li>✨ Multiplier boosts ALL income.</li>
          <li>💎 Legendary / 🔥 Mythic / 🐉 Ultimate jackpots unlock rare pets.</li>
        </ul>
      </Card>
    </div>
  );
}
