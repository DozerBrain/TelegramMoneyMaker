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
  petId?: string; // for jackpot slices
};

// Spread jackpots around the wheel (style C)
const REWARDS: RewardSlot[] = [
  { id: "cash_small_1", label: "Cash", desc: "Small cash boost", kind: "cash_small", weight: 15 },
  { id: "tap_up", label: "+Tap", desc: "Increase tap value", kind: "tap", weight: 15 },
  {
    id: "jp_legendary",
    label: "Legendary",
    desc: "Legendary Jackpot",
    kind: "jackpot_legendary",
    weight: 3,
    petId: "unicorn", // Unicorn Pegasus
  },
  { id: "auto_up", label: "Auto/sec", desc: "Increase auto income", kind: "auto", weight: 15 },
  { id: "cash_big", label: "Big Cash", desc: "Big cash boost", kind: "cash_big", weight: 15 },
  {
    id: "jp_mythic",
    label: "Mythic",
    desc: "Mythic Jackpot",
    kind: "jackpot_mythic",
    weight: 1,
    petId: "goblin", // Fourarms Goblin
  },
  { id: "multi_up", label: "Multi", desc: "Global multiplier", kind: "multi", weight: 15 },
  {
    id: "jp_ultimate",
    label: "Ultimate",
    desc: "Ultimate Jackpot",
    kind: "jackpot_ultimate",
    weight: 1,
    petId: "dragon", // Crypto Dragon
  },
];

// map jackpot kind → pet image
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

// ---- SVG helpers for real slices ----
function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const angleRad = degToRad(angleDeg - 90); // 0° at top
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

// Donut slice path (outer + inner radius)
function buildSlicePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
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

    // angle of the chosen slice center (0° at top)
    const targetSegmentAngle = idx * anglePer + anglePer / 2;

    const baseRot = wheelRotation % 360;
    const extraSpins = 4; // full spins before landing
    const targetRotation =
      baseRot + extraSpins * 360 + (360 - targetSegmentAngle);

    setIsSpinning(true);
    setWheelRotation(targetRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      const finalIdx = pendingIndex ?? idx;
      applyReward(finalIdx);
      setPendingIndex(null);
    }, 2100);
  }

  const segments = REWARDS.length;
  const anglePer = 360 / segments;

  const cx = 100;
  const cy = 100;
  const rOuter = 90;
  const rInner = 40;

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

        {/* Pointer */}
        <div className="flex justify-center mb-1">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-emerald-400 drop-shadow" />
        </div>

        {/* SVG wheel with real slices */}
        <div className="flex justify-center mt-1 mb-4">
          <svg
            viewBox="0 0 200 200"
            className="w-64 h-64 sm:w-72 sm:h-72"
          >
            <defs>
              <radialGradient id="mm-spin-glow" cx="50%" cy="20%" r="70%">
                <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
                <stop offset="60%" stopColor="rgba(16,185,129,0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="mm-jackpot-fill" cx="50%" cy="40%" r="80%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#92400e" />
              </radialGradient>
            </defs>

            {/* Outer glow */}
            <circle
              cx={cx}
              cy={cy}
              r={rOuter}
              fill="url(#mm-spin-glow)"
            />

            {/* Dark base */}
            <circle
              cx={cx}
              cy={cy}
              r={rOuter - 6}
              fill="#020617"
              stroke="#10b981"
              strokeWidth={1}
            />

            {/* Rotating group */}
            <g
              transform={`rotate(${wheelRotation} ${cx} ${cy})`}
              style={{ transition: "transform 2000ms ease-out" }}
            >
              {/* Slices */}
              {REWARDS.map((slot, index) => {
                const startAngle = index * anglePer;
                const endAngle = startAngle + anglePer;
                const d = buildSlicePath(
                  cx,
                  cy,
                  rInner,
                  rOuter - 8,
                  startAngle,
                  endAngle
                );
                const isJackpot =
                  slot.kind === "jackpot_legendary" ||
                  slot.kind === "jackpot_mythic" ||
                  slot.kind === "jackpot_ultimate";

                const fill = isJackpot ? "url(#mm-jackpot-fill)" : "#020617";
                const stroke = isJackpot ? "#facc15" : "#111827";
                const strokeWidth = isJackpot ? 2 : 1;

                // center point for label / icon
                const midAngle = startAngle + anglePer / 2;
                const labelRadius = (rInner + (rOuter - 8)) / 2;
                const center = polarToCartesian(
                  cx,
                  cy,
                  labelRadius,
                  midAngle
                );

                const icon =
                  isJackpot && petIconByKind[slot.kind]
                    ? petIconByKind[slot.kind]
                    : null;

                return (
                  <g key={slot.id}>
                    <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />

                    {icon ? (
                      // Pet icon inside jackpot slice
                      <g>
                        <circle
                          cx={center.x}
                          cy={center.y}
                          r={11}
                          fill="rgba(0,0,0,0.6)"
                          stroke="#facc15"
                          strokeWidth={1.5}
                        />
                        <image
                          href={icon}
                          x={center.x - 10}
                          y={center.y - 10}
                          width={20}
                          height={20}
                          preserveAspectRatio="xMidYMid slice"
                          style={{ borderRadius: "9999px" }}
                        />
                      </g>
                    ) : (
                      // Text label for normal rewards
                      <text
                        x={center.x}
                        y={center.y}
                        fill="#e5e7eb"
                        fontSize={7.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {slot.label.toUpperCase()}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* inner hub */}
              <circle
                cx={cx}
                cy={cy}
                r={rInner - 6}
                fill="#020617"
                stroke="#0f172a"
                strokeWidth={2}
              />
            </g>
          </svg>
        </div>

        {/* Spin button */}
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
