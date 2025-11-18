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
      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-black/85 border border-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.3)] flex flex-col"
    >
      {/* image / animation area */}
      <div className="flex-1 flex items-center justify-center bg-zinc-900/80">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl overflow-hidden border border-white/10 bg-black/70 flex items-center justify-center">
          {preview}
        </div>
      </div>

      {/* title strip at bottom */}
      <div className="px-2 py-1 bg-black/80 border-t border-white/10 flex items-center justify-center">
        <div className="text-[11px] sm:text-[12px] font-semibold text-white text-center leading-tight">
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

  // cycle card rarities
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

  // Card preview – supports .png and .jpg from /public/cards
  const cardPreview = (
    <picture>
      {/* try png first, then jpg */}
      <source srcSet={`/cards/${currentCard}.png`} />
      <img
        src={`/cards/${currentCard}.jpg`}
        alt={currentCard}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </picture>
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
      {/* Cards – near the head */}
      <div className="pointer-events-auto absolute left-6 top-28 sm:left-8 sm:top-28 z-10">
        <SquareButton
          title="Cards"
          onClick={() => goto("cards")}
          preview={cardPreview}
        />
      </div>

      {/* Suits – middle / torso */}
      <div className="pointer-events-auto absolute left-6 top-[12.5rem] sm:left-8 sm:top-[12.5rem] z-10">
        <SquareButton
          title="Suits"
          onClick={() => goto("suits")}
          preview={suitPreview}
        />
      </div>

      {/* Pets – lower, above tap area */}
      <div className="pointer-events-auto absolute left-6 top-[18rem] sm:left-8 sm:top-[18rem] z-10">
        <SquareButton
          title="Pets"
          onClick={() => goto("pets")}
          preview={petPreview}
        />
      </div>
    </>
  );
}
