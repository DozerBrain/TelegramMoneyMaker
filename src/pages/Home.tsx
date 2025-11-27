// src/pages/Home.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import BanknoteButton from "../components/BanknoteButton";
import { comboTap } from "../lib/combo";
import { submitScore } from "../lib/leaderboard";
import { PETS } from "../data/pets";
import { formatMoneyShort } from "../lib/format";

import { getProfile } from "../lib/profile";
import { loadWorldSave, regionOfCountry } from "../lib/worldMapLogic";
import { getTitleState } from "../lib/storage";
import {
  getTitleDef,
  type TitleDef,
  type Rarity,
} from "../data/titles";
import { COUNTRIES } from "../data/countries";

const WORLD_TOTAL = COUNTRIES.length;

type Props = {
  balance: number;
  setBalance: (v: number | ((p: number) => number)) => void;

  totalEarnings: number;
  setTotalEarnings: (v: number | ((p: number) => number)) => void;

  taps: number;
  setTaps: (v: number | ((p: number) => number)) => void;

  tapValue: number;
  multi: number;

  currentSuitName: string;
  setCurrentSuitName: (v: string) => void;

  suitMult: number;
  petTapMult: number;
  cardMultAll: number;
  globalMult: number;

  equippedPetId: string | null;

  critChance: number;
  critMult: number;
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
  setCurrentSuitName,
  suitMult,
  petTapMult,
  cardMultAll,
  globalMult,
  equippedPetId,
  critChance,
  critMult,
}: Props) {
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [lastCrit, setLastCrit] = useState(false);

  // 🔥 NEW: title + world progress
  const [equippedTitle, setEquippedTitle] = useState<TitleDef | null>(null);
  const [worldOwnedCount, setWorldOwnedCount] = useState<number>(0);

  useEffect(() => {
    const onCombo = (e: any) => {
      setCombo(e.detail.combo);
      setBest(e.detail.best);
    };
    window.addEventListener("combo:update", onCombo as any);
    return () => window.removeEventListener("combo:update", onCombo as any);
  }, []);

  // 🔥 Load equipped title + world progress once on mount
  useEffect(() => {
    try {
      const ts = getTitleState();
      const id = ts.equippedTitleId ?? null;
      if (id) {
        setEquippedTitle(getTitleDef(id) ?? null);
      } else {
        setEquippedTitle(null);
      }
    } catch {
      // ignore
    }

    try {
      const p = getProfile();
      const cc = (p.country || "US").toUpperCase();
      const region = regionOfCountry(cc);
      const worldSave = loadWorldSave(cc, region);
      setWorldOwnedCount(worldSave.owned?.length ?? 0);
    } catch {
      // ignore
    }
  }, []);

  const lastPushRef = useRef(0);

  async function pushLeaderboard(score: number) {
    const now = Date.now();
    if (now - lastPushRef.current < 1500) return;
    lastPushRef.current = now;
    await submitScore(score);
  }

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
    if (didCrit) setTimeout(() => setLastCrit(false), 250);

    setTaps((t) => t + 1);
    setTotalEarnings((t) => t + gain);

    setBalance((b) => {
      const updated = b + gain;
      pushLeaderboard(totalEarnings + gain);
      return updated;
    });

    comboTap();
  }

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

      {/* 🔥 WORLD RANK / TITLE BANNER ABOVE MASCOT */}
      <div className="w-full flex justify-center px-4">
        <TitleBanner
          title={equippedTitle}
          worldOwnedCount={worldOwnedCount}
        />
      </div>

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

      <div className="mt-5">
        <BanknoteButton onTap={onMainTap} size={140} />
      </div>

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

      <div className="mt-3 text-white/90 text-sm">
        Balance:{" "}
        <span className="text-emerald-400 font-semibold">
          ${formatMoneyShort(balance)}
        </span>
      </div>
    </div>
  );
}

// 🔥 Title banner component (horizontal, rarity-colored)
type TitleBannerProps = {
  title: TitleDef | null;
  worldOwnedCount: number;
};

function rarityStyle(rarity?: Rarity) {
  switch (rarity) {
    case "uncommon":
      return {
        borderClass: "border-emerald-400",
        bgClass: "bg-emerald-900/60",
        glowClass: "shadow-[0_0_18px_rgba(16,185,129,0.7)]",
        leftArrowClass: "border-r-emerald-400",
        rightArrowClass: "border-l-emerald-400",
      };
    case "rare":
      return {
        borderClass: "border-sky-400",
        bgClass: "bg-sky-900/60",
        glowClass: "shadow-[0_0_18px_rgba(56,189,248,0.7)]",
        leftArrowClass: "border-r-sky-400",
        rightArrowClass: "border-l-sky-400",
      };
    case "epic":
      return {
        borderClass: "border-purple-400",
        bgClass: "bg-purple-900/60",
        glowClass: "shadow-[0_0_18px_rgba(192,132,252,0.8)]",
        leftArrowClass: "border-r-purple-400",
        rightArrowClass: "border-l-purple-400",
      };
    case "legendary":
      return {
        borderClass: "border-amber-400",
        bgClass: "bg-amber-900/60",
        glowClass: "shadow-[0_0_20px_rgba(251,191,36,0.9)]",
        leftArrowClass: "border-r-amber-400",
        rightArrowClass: "border-l-amber-400",
      };
    case "mythic":
      return {
        borderClass: "border-fuchsia-400",
        bgClass: "bg-fuchsia-900/60",
        glowClass: "shadow-[0_0_22px_rgba(232,121,249,0.95)]",
        leftArrowClass: "border-r-fuchsia-400",
        rightArrowClass: "border-l-fuchsia-400",
      };
    case "ultimate":
      return {
        borderClass: "border-cyan-300",
        bgClass: "bg-cyan-900/60",
        glowClass: "shadow-[0_0_24px_rgba(34,211,238,1)]",
        leftArrowClass: "border-r-cyan-300",
        rightArrowClass: "border-l-cyan-300",
      };
    case "common":
    default:
      return {
        borderClass: "border-zinc-400",
        bgClass: "bg-zinc-900/80",
        glowClass: "shadow-[0_0_14px_rgba(148,163,184,0.7)]",
        leftArrowClass: "border-r-zinc-400",
        rightArrowClass: "border-l-zinc-400",
      };
  }
}

function TitleBanner({ title, worldOwnedCount }: TitleBannerProps) {
  if (!title) return null;

  const {
    borderClass,
    bgClass,
    glowClass,
    leftArrowClass,
    rightArrowClass,
  } = rarityStyle(title.rarity);

  const isWorldTitle = title.source === "world";

  return (
    <div className="mt-1 mb-1 flex justify-center">
      <div className="relative inline-flex items-center">
        {/* left arrow tip */}
        <div
          className={`absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[10px] ${leftArrowClass}`}
        />
        {/* right arrow tip */}
        <div
          className={`absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[10px] ${rightArrowClass}`}
        />

        {/* main pill */}
        <div
          className={`px-4 py-1 rounded-full border ${borderClass} ${bgClass} ${glowClass} flex items-center gap-2 text-xs font-semibold`}
        >
          <span className="text-[10px] uppercase tracking-wide text-white/70">
            Title
          </span>
          <span className="text-white whitespace-nowrap">
            {title.label}
          </span>

          {isWorldTitle && (
            <span className="ml-2 text-[11px] text-white/80 whitespace-nowrap">
              {worldOwnedCount}/{WORLD_TOTAL}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
