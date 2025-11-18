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

// ---------- generic square button ----------

type SquareButtonProps = {
  title: string;
  onClick: () => void;
  preview: React.ReactNode;
};

function SquareButton({ title, onClick, preview }: SquareButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.35)] flex flex-col"
    >
      {/* image / animation area */}
      <div className="flex-1 flex items-center justify-center bg-black/40">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden border border-white/15 bg-black/60 flex items-center justify-center">
          {preview}
        </div>
      </div>

      {/* title strip at the bottom */}
      <div className="px-2 py-1.5 bg-black/60 border-t border-white/5 text-left">
        <div className="text-[11px] sm:text-[12px] font-semibold text-white leading-tight">
          {title}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------

export default function LeftQuickNav() {
  const [cardIndex, setCardIndex] = useState(0);
  const [suitIndex, setSuitIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0);

  // cycle card rarities (uses /public/cards/*.jpg)
  useEffect(() => {
    const id = setInterval(
      () => setCardIndex((i) => (i + 1) % CARD_RARITIES.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  // cycle suits
  useEffect(() => {
    if (!suits.length) return;
    const id = setInterval(
      () => setSuitIndex((i) => (i + 1) % suits.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  // cycle pets
  useEffect(() => {
    if (!PETS.length) return;
    const id = setInterval(
      () => setPetIndex((i) => (i + 1) % PETS.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  const currentCard: CardRarity = CARD_RARITIES[cardIndex];

  // card image from /public/cards
  const cardPreview = (
    <img
      src={`/cards/${currentCard}.jpg`}
      alt={currentCard}
      className="h-full w-full object-cover"
      draggable={false}
    />
  );

  const suitImg = suits[suitIndex]?.img ?? "/suits/starter.png";
  const suitPreview = (
    <img
      src={suitImg}
      alt="Suit"
      className="h-full w-full object-contain"
      draggable={false}
    />
  );

  const petImg = PETS[petIndex]?.img ?? "/pets/mouse.png";
  const petPreview = (
    <img
      src={petImg}
      alt="Pet"
      className="h-full w-full object-contain"
      draggable={false}
    />
  );

  return (
    <>
      {/* Cards – top left */}
      <div className="pointer-events-auto absolute left-3 top-28 z-10">
        <SquareButton
          title="Cards"
          onClick={() => goto("cards")}
          preview={cardPreview}
        />
      </div>

      {/* Suits – middle left */}
      <div className="pointer-events-auto absolute left-3 top-[13.5rem] z-10">
        <SquareButton
          title="Suits"
          onClick={() => goto("suits")}
          preview={suitPreview}
        />
      </div>

      {/* Pets – lower left */}
      <div className="pointer-events-auto absolute left-3 top-[19.5rem] z-10">
        <SquareButton
          title="Pets"
          onClick={() => goto("pets")}
          preview={petPreview}
        />
      </div>
    </>
  );
}
