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
      className="
        w-20 h-20 sm:w-24 sm:h-24
        rounded-3xl overflow-hidden
        bg-[#050709]/80
        border border-emerald-400/40
        shadow-[0_0_18px_rgba(16,185,129,0.35)]
        flex flex-col items-center justify-center
        active:scale-[0.96] transition-transform
      "
    >
      {/* preview area */}
      <div className="flex-1 flex items-center justify-center pt-2">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl overflow-hidden">
          {preview}
        </div>
      </div>

      {/* title */}
      <div className="w-full pb-1 pt-0.5 flex items-center justify-center">
        <span className="text-[11px] sm:text-[12px] font-semibold text-white/95 text-center">
          {title}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------

type LeftQuickNavProps = {
  variant?: "home" | "inventory";
};

export default function LeftQuickNav({ variant = "home" }: LeftQuickNavProps) {
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

  // Card preview – from /public/cards
  const cardPreview = (
    <picture>
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

  if (variant === "inventory") {
    // 🔹 Top row in Inventory tab
    return (
      <div className="w-full pt-4 pb-2 flex flex-col items-center">
        <div className="flex gap-3 sm:gap-4">
          <SquareButton
            title="Cards"
            onClick={() => goto("cards")}
            preview={cardPreview}
          />
          <SquareButton
            title="Suits"
            onClick={() => goto("suits")}
            preview={suitPreview}
          />
          <SquareButton
            title="Pets"
            onClick={() => goto("pets")}
            preview={petPreview}
          />
        </div>
      </div>
    );
  }

  // 🔹 Original left-side stacked layout (Home)
  return (
    <>
      {/* Cards – upper */}
      <div className="pointer-events-auto absolute left-6 top-28 sm:left-8 sm:top-28 z-10">
        <SquareButton
          title="Cards"
          onClick={() => goto("cards")}
          preview={cardPreview}
        />
      </div>

      {/* Suits – middle */}
      <div className="pointer-events-auto absolute left-6 top-[12.5rem] sm:left-8 sm:top-[12.5rem] z-10">
        <SquareButton
          title="Suits"
          onClick={() => goto("suits")}
          preview={suitPreview}
        />
      </div>

      {/* Pets – lower */}
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
