// src/pages/Home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import BanknoteButton from "../components/BanknoteButton";
import { comboTap } from "../lib/combo";
import { getProfile } from "../lib/profile";
import { submitScore } from "../lib/leaderboard";
import LeftQuickNav from "../components/LeftQuickNav";
import { PETS } from "../data/pets";

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
  setCurrentSuitName, // kept for future use
  suitMult,
  petTapMult,
  cardMultAll,
  globalMult,
  equippedPetId,
}: Props) {
  // ---------- Combo UI ----------
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const onCombo = (e: any) => {
      setCombo(e.detail.combo);
      setBest(e.detail.best);
    };
    window.addEventListener("combo:update", onCombo as any);
    return () => window.removeEventListener("combo:update", onCombo as any);
  }, []);

  // ---------- Leaderboard submit (throttled) ----------
  const profile = useMemo(() => getProfile(), []);
  const lastPushRef = useRef(0);

  async function pushLeaderboard(newScore: number) {
    const now = Date.now();
    if (now - lastPushRef.current < 1500) return;
    lastPushRef.current = now;
    await submitScore(newScore, profile);
  }

  // ---------- Tap handler with full math ----------
  function onMainTap() {
    const totalTapMult = suitMult * petTapMult * cardMultAll * globalMult;
    const rawGain = tapValue * multi * totalTapMult;
    const gain = Math.max(1, Math.floor(rawGain));

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

      {/* Mascot centered, pet below (smaller) */}
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        {/* Mascot / suit */}
        <img
          src={suitImg}
          alt="Equipped suit"
          className="w-56 h-auto object-contain select-none drop-shadow-[0_10px_30px_rgba(0,255,170,0.15)]"
          draggable={false}
        />

        {/* Pet under mascot, half-ish size, no text here */}
        {pet && (
          <img
            src={pet.img}
            alt={pet.name}
            className="w-24 h-24 object-contain select-none drop-shadow-[0_8px_20px_rgba(0,255,170,0.25)]"
            draggable={false}
          />
        )}
      </div>

      {/* Tap button */}
      <div className="mt-3">
        <BanknoteButton onTap={onMainTap} size={140} />
      </div>

      {/* Combo badge */}
      {combo > 0 && (
        <div className="mt-2 text-emerald-300 text-sm font-semibold">
          Combo x{combo} <span className="text-zinc-400">• Best {best}</span>
        </div>
      )}

      {/* Balance readout */}
      <div className="mt-3 text-white/90 text-sm">
        Balance:{" "}
        <span className="text-emerald-400 font-semibold">
          ${balance.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
