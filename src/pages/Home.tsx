// src/pages/Home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import BanknoteButton from "../components/BanknoteButton";
import { comboTap } from "../lib/combo";
import { submitScore } from "../lib/leaderboard";
import LeftQuickNav from "../components/LeftQuickNav";
import { PETS } from "../data/pets";
import { formatMoneyShort } from "../lib/format";

type Props = {
  // balances & totals
  balance: number;
  setBalance: (v: number | ((p: number) => number)) => void;

  totalEarnings: number;
  setTotalEarnings: (v: number | ((p: number) => number)) => void;

  // tapping
  taps: number;
  setTaps: (v: number | ((p: number) => number)) => void;

  tapValue: number;
  multi: number;

  // suit display
  currentSuitName: string;
  setCurrentSuitName: (v: string) => void;

  // multipliers
  suitMult: number;
  petTapMult: number;
  cardMultAll: number;
  globalMult: number;

  // equipped pet
  equippedPetId: string | null;

  // crit system
  critChance: number; // 0.05 = 5%
  critMult: number;   // e.g. 5 = x5
};

export default function Home({
  balance,
  setBalance,
  totalEarnings,
  setTotalEarnings,
  taps,
  setTaps,
  tapValue,
  multi,
  currentSuitName,
  setCurrentSuitName, // reserved
  suitMult,
  petTapMult,
  cardMultAll,
  globalMult,
  equippedPetId,
  critChance,
  critMult,
}: Props) {
  // ---------- Combo UI ----------
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [lastCrit, setLastCrit] = useState(false);

  useEffect(() => {
    const onCombo = (e: any) => {
      setCombo(e.detail.combo);
      setBest(e.detail.best);
    };
    window.addEventListener("combo:update", onCombo as any);
    return () => window.removeEventListener("combo:update", onCombo as any);
  }, []);

  // ---------- Leaderboard submit (throttled) ----------
  const lastPushRef = useRef(0);

  async function pushLeaderboard(newScore: number) {
    const now = Date.now();
    if (now - lastPushRef.current < 1500) return; // max ~1.5s
    lastPushRef.current = now;
    await submitScore(newScore); // ✅ submitScore takes only ONE argument
  }

  // ---------- Tap handler with crit ----------
  function onMainTap() {
    const totalTapMult =
      multi * suitMult * petTapMult * cardMultAll * globalMult;

    const baseGain = Math.max(1, Math.floor(tapValue * totalTapMult));

    let gain = baseGain;
    let didCrit = false;

    if (critChance > 0 && Math.random() < critChance) {
      didCrit = true;
      gain = Math.max(1, Math.floor(baseGain * critMult));
    }

    setLastCrit(didCrit);
    if (didCrit) {
      setTimeout(() => setLastCrit(false), 250);
    }

    setTaps((t) => t + 1);
    setTotalEarnings((t) => t + gain);

    setBalance((b) => {
      const newBalance = b + gain;
      pushLeaderboard(newBalance);
      return newBalance;
    });

    comboTap();
  }

  // ---------- View helpers ----------
  const suitImg = useMemo(() => {
    const name = (currentSuitName || "starter").toLowerCase();
    return `/suits/${name}.png`;
  }, [currentSuitName]);

  const pet = useMemo(
    () => PETS.find((p) => p.id === equippedPetId) ?? null,
    [equippedPetId]
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start pt-4 pb-24">
      {/* Left quick buttons (Cards / Suits / Pets) */}
      <LeftQuickNav />

      {/* Mascot centered; pet anchored bottom-right of mascot */}
      <div className="mt-2 flex items-center justify-center">
        <div className="relative">
          <img
            src={suitImg}
            alt="Equipped suit"
            className="w-56 h-auto object-contain select-none drop-shadow-[0_10px_30px_rgba(0,255,170,0.15)]"
            draggable={false}
          />

          {pet && (
            <img
              src={pet.img}
              alt={pet.name}
              className="absolute -bottom-4 -right-6 w-24 h-24 object-contain select-none drop-shadow-[0_8px_20px_rgba(0,255,170,0.25)]"
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Tap button */}
      <div className="mt-5">
        <BanknoteButton onTap={onMainTap} size={140} />
      </div>

      {/* Combo + crit badge */}
      <div className="mt-2 text-sm font-semibold flex flex-col items-center gap-1">
        {combo > 0 && (
          <div className="text-emerald-300">
            Combo x{combo} <span className="text-zinc-400">• Best {best}</span>
          </div>
        )}
        {lastCrit && (
          <div className="px-2 py-0.5 rounded-full bg-amber-400/90 text-black text-xs uppercase tracking-wide">
            CRIT! x{critMult.toFixed(1)}
          </div>
        )}
      </div>

      {/* Balance readout */}
      <div className="mt-3 text-white/90 text-sm">
        Balance:{" "}
        <span className="text-emerald-400 font-semibold">
          ${formatMoneyShort(balance)}
        </span>
      </div>
    </div>
  );
}
