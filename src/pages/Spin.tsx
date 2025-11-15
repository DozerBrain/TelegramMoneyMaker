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
};

const REWARDS: RewardSlot[] = [
  {
    id: "cash_small",
    label: "Cash",
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
  },
  {
    id: "jp_mythic",
    label: "Mythic",
    desc: "Mythic Jackpot",
    kind: "jackpot_mythic",
    weight: 1,
  },
  {
    id: "jp_ultimate",
    label: "Ultimate",
    desc: "Ultimate Jackpot",
    kind: "jackpot_ultimate",
    weight: 1,
  },
];

// map jackpot kind → pet image
const petIconByKind: Partial<Record<RewardKind, string>> = (() => {
  const get = (id: string) => PETS.find((p) => p.id === id)?.img || "";
  return {
    jackpot_legendary: get("unicorn"), // Unicorn Pegasus
    jackpot_mythic: get("goblin"), // Fourarms Goblin
    jackpot_ultimate: get("dragon"), // Crypto Dragon
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

    const segments = REWARDS.length;
    const anglePer = 360 / segments;

    // angle of chosen segment's center
    const targetSegmentAngle = idx * anglePer + anglePer / 2;

    const baseRot = wheelRotation % 360;
    const extraSpins = 4;
    const targetRotation =
      baseRot + extraSpins * 360 + (360 - targetSegmentAngle);

    setIsSpinning(true);
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      applyReward(idx);
    }, 2100);
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
            {/* Outer green glow */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_0%,rgba(16,185,129,0.45),transparent_55%)]" />

            {/* Spinning wheel */}
            <div
              className="absolute inset-[11%] rounded-full bg-gradient-to-b from-slate-950 via-slate-950 to-black border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.45)] overflow-hidden transition-transform duration-[2000ms] ease-out"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {/* inner ring */}
              <div className="absolute inset-[20%] rounded-full border border-emerald-400/30" />

              {/* radial slice lines */}
              {Array.from({ length: REWARDS.length }).map((_, i) => {
                const angle = (360 / REWARDS.length) * i;
                return (
                  <div
                    key={`line-${i}`}
                    className="absolute left-1/2 top-1/2 w-px h-[48%] bg-emerald-500/14"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                      transformOrigin: "50% 100%",
                    }}
                  />
                );
              })}

              {/* center disc */}
              <div className="absolute inset-[32%] rounded-full bg-black/80 border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.7)]" />

              {/* segments content */}
              {REWARDS.map((r, index) => {
                const segments = REWARDS.length;
                const anglePer = 360 / segments;
                const angle = index * anglePer;

                const isJackpot =
                  r.kind === "jackpot_legendary" ||
                  r.kind === "jackpot_mythic" ||
                  r.kind === "jackpot_ultimate";

                const petIcon = isJackpot ? petIconByKind[r.kind] : undefined;

                return (
                  <React.Fragment key={r.id}>
                    {/* glowing slice for jackpots */}
                    {isJackpot && (
                      <div
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                        }}
                      >
                        <div
                          className="w-0 h-0 
                          border-l-[38px] border-r-[38px] sm:border-l-[44px] sm:border-r-[44px]
                          border-b-[130px] sm:border-b-[150px]
                          border-l-transparent border-r-transparent
                          border-b-amber-400/80
                          shadow-[0_0_45px_rgba(250,204,21,0.95)]
                          opacity-95"
                        />
                      </div>
                    )}

                    {/* label / pet icon near rim */}
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -78%)`,
                        transformOrigin: "50% 50%",
                      }}
                    >
                      {isJackpot ? (
                        <div
                          className="flex flex-col items-center gap-1"
                          style={{ transform: `rotate(${-angle}deg)` }}
                        >
                          {petIcon && (
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-amber-300/95 overflow-hidden bg-black/70 shadow-[0_0_25px_rgba(250,204,21,0.9)]">
                              <img
                                src={petIcon}
                                alt={r.label}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <span className="text-[10px] font-semibold tracking-wide text-amber-200">
                            {r.label.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="px-2 py-1 rounded-full border border-white/10 bg-black/65 text-[10px] text-slate-100 whitespace-nowrap"
                          style={{ transform: `rotate(${-angle}deg)` }}
                        >
                          {r.label.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
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
