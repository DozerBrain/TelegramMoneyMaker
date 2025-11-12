// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import CardsModal from "../cards/CardsModal";
import { handleMainTapForPacks } from "../lib/game";

// If you already track score elsewhere, you can remove the local score state here
export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [showCards, setShowCards] = useState<boolean>(false);

  // Auto-open Cards modal whenever a pack is opened by the MAIN tap
  useEffect(() => {
    const onOpen = () => setShowCards(true);
    window.addEventListener("pack:opened", onOpen as any);
    return () => window.removeEventListener("pack:opened", onOpen as any);
  }, []);

  // Main tap -> increases score AND drives the 5-tap pack counter
  function onMainTap() {
    // Your normal tap logic (increase balance, animations, etc.)
    setScore((s) => s + 1);

    // Drives the pack counter; opens pack automatically on 5th tap
    const res = handleMainTapForPacks();
    // You don't need to do anything here: the modal will auto-open via event listener
    // if (res.opened) { setShowCards(true); } // <- optional; event already does this
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0f13] text-white flex flex-col">
      {/* Top bar (replace with your TopBar component if you have one) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-lg font-bold">MoneyMaker</div>
        <div className="text-sm opacity-80">Balance: ${score}</div>
      </div>

      {/* Mascot / suit stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Show your mascot (use whatever suit you prefer) */}
        <img
          src="/suits/starter.png"       // change to the selected suit path if you have wardrobe state
          alt="Mr.T"
          className="w-56 h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,255,170,0.15)]"
          draggable={false}
        />

        {/* Main TAP button — this is the only tap now */}
        <button
          onClick={onMainTap}
          className="mt-8 px-8 py-4 rounded-2xl font-extrabold text-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          Tap 💸
        </button>
      </div>

      {/* Bottom nav mock (replace with your Tabs component if you have it) */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center justify-center gap-3">
        <button
          onClick={() => setShowCards(true)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
        >
          Cards
        </button>
        <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
          Shop
        </button>
        <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
          More
        </button>
      </div>

      {showCards && <CardsModal onClose={() => setShowCards(false)} />}
    </div>
  );
}
