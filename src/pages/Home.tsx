// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import CardsModal from "../cards/CardsModal";
import BanknoteButton from "../components/BanknoteButton";
import { handleMainTapForPacks } from "../lib/game";
import { comboTap } from "../lib/combo";
import { getEquippedSuit, getScore, setScore } from "../lib/storage";

export default function Home() {
  const [score, setScoreState] = useState<number>(getScore());
  const [showCards, setShowCards] = useState<boolean>(false);
  const [equippedSuit, setEquippedSuitState] = useState<string>(getEquippedSuit() || "starter");

  // combo UI states
  const [combo, setCombo] = useState<number>(0);
  const [best, setBest] = useState<number>(0);

  // Listen for pack opened -> open modal
  useEffect(() => {
    const onOpen = () => setShowCards(true);
    window.addEventListener("pack:opened", onOpen as any);
    return () => window.removeEventListener("pack:opened", onOpen as any);
  }, []);

  // Listen for storage changes (e.g., suit equipped elsewhere)
  useEffect(() => {
    const onStorage = () => setEquippedSuitState(getEquippedSuit() || "starter");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Listen for combo updates
  useEffect(() => {
    const onCombo = (e: any) => {
      setCombo(e.detail.combo);
      setBest(e.detail.best);
    };
    window.addEventListener("combo:update", onCombo as any);
    return () => window.removeEventListener("combo:update", onCombo as any);
  }, []);

  function onMainTap() {
    // 1) update score (persist + UI)
    const newScore = score + 1;
    setScore(newScore);       // persist
    setScoreState(newScore);  // UI

    // 2) combo
    comboTap();

    // 3) packs (auto opens on 5)
    handleMainTapForPacks();
  }

  // Resolve suit image path
  const suitImg = `/suits/${equippedSuit}.png`;

  return (
    <div className="min-h-screen w-full bg-[#0b0f13] text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-lg font-bold">MoneyMaker</div>
        <div className="text-sm opacity-80">Balance: ${score}</div>
      </div>

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Equipped suit / mascot */}
        <img
          src={suitImg}
          alt="Suit"
          className="w-56 h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,255,170,0.15)]"
          draggable={false}
        />

        {/* Main Tap Button */}
        <div className="mt-4">
          <BanknoteButton onTap={onMainTap} size={140} />
        </div>

        {/* Combo badge */}
        {combo > 0 && (
          <div className="mt-2 text-emerald-300 text-sm font-semibold">
            Combo x{combo} <span className="text-zinc-400">• Best {best}</span>
          </div>
        )}
      </div>

      {/* Bottom nav mock */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center justify-center gap-3">
        <button
          onClick={() => setShowCards(true)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
        >
          Cards
        </button>
        <a
          href="#"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 pointer-events-none opacity-60"
          onClick={(e) => e.preventDefault()}
        >
          Shop
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 pointer-events-none opacity-60"
          onClick={(e) => e.preventDefault()}
        >
          More
        </a>
      </div>

      {showCards && <CardsModal onClose={() => setShowCards(false)} />}
    </div>
  );
}
