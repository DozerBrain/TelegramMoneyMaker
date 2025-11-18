// src/components/LeftQuickNav.tsx
import React, { useEffect, useState } from "react";
import { suits } from "../data/suits";
import { PETS } from "../data/pets";

const CARD_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "ultimate",
] as const;

type CardRarity = (typeof CARD_RARITIES)[number];

function goto(tab: "cards" | "suits" | "pets") {
  window.dispatchEvent(
    new CustomEvent("MM_GOTO", { detail: { goto: tab } })
  );
}

type QuickButtonProps = {
  label: string;
  sublabel: string;
  onClick: () => void;
  previewImg: string;
};

function QuickButton({ label, sublabel, onClick, previewImg }: QuickButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-32 sm:w-40 rounded-2xl px-3 py-2 flex items-center justify-between bg-zinc-900/80 border border-emerald-500/25 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
    >
      <div className="flex flex-col items-start">
        <span className="text-[13px] font-semibold text-white">{label}</span>
        <span className="text-[10px] text-emerald-300/90">{sublabel}</span>
      </div>
      <div className="h-8 w-8 rounded-xl overflow-hidden bg-black/50 border border-emerald-500/40 flex items-center justify-center">
        <img
          src={previewImg}
          alt={label}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
    </button>
  );
}

export default function LeftQuickNav() {
  const [cardIndex, setCardIndex] = useState(0);
  const [suitIndex, setSuitIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0);

  // cards animation
  useEffect(() => {
    const id = setInterval(() => {
      setCardIndex((i) => (i + 1) % CARD_RARITIES.length);
    }, 800);
    return () => clearInterval(id);
  }, []);

  // suits animation
  useEffect(() => {
    if (!suits.length) return;
    const id = setInterval(() => {
      setSuitIndex((i) => (i + 1) % suits.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  // pets animation
  useEffect(() => {
    if (!PETS.length) return;
    const id = setInterval(() => {
      setPetIndex((i) => (i + 1) % PETS.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const currentCard: CardRarity = CARD_RARITIES[cardIndex];
  const cardImg = `/cards/${currentCard}.jpg`;
  const suitImg = suits[suitIndex]?.img ?? "/suits/starter.png";
  const petImg = PETS[petIndex]?.img ?? "/pets/mouse.png";

  return (
    <>
      {/* Cards – top (near top blue box) */}
      <div className="pointer-events-auto absolute left-3 top-32 z-10">
        <QuickButton
          label="Cards"
          sublabel="All rarities"
          onClick={() => goto("cards")}
          previewImg={cardImg}
        />
      </div>

      {/* Suits – middle */}
      <div className="pointer-events-auto absolute left-3 top-60 z-10">
        <QuickButton
          label="Suits"
          sublabel="Style & boosts"
          onClick={() => goto("suits")}
          previewImg={suitImg}
        />
      </div>

      {/* Pets – lower (near dragon / balance) */}
      <div className="pointer-events-auto absolute left-3 top-[19rem] z-10">
        <QuickButton
          label="Pets"
          sublabel="Cute helpers"
          onClick={() => goto("pets")}
          previewImg={petImg}
        />
      </div>
    </>
  );
}
