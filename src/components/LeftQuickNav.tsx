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

// ---------- Small helpers ----------

function rarityLabel(r: CardRarity) {
  switch (r) {
    case "common":
      return "Common";
    case "uncommon":
      return "Uncommon";
    case "rare":
      return "Rare";
    case "epic":
      return "Epic";
    case "legendary":
      return "Legendary";
    case "mythic":
      return "Mythic";
    case "ultimate":
      return "Ultimate";
  }
}

function rarityBg(r: CardRarity) {
  switch (r) {
    case "common":
      return "from-zinc-700 to-zinc-500";
    case "uncommon":
      return "from-emerald-700 to-emerald-400";
    case "rare":
      return "from-sky-700 to-sky-400";
    case "epic":
      return "from-purple-700 to-purple-400";
    case "legendary":
      return "from-amber-700 to-amber-400";
    case "mythic":
      return "from-fuchsia-700 to-fuchsia-400";
    case "ultimate":
      return "from-emerald-500 to-yellow-300";
  }
}

type QuickButtonProps = {
  label: string;
  sublabel: string;
  onClick: () => void;
  preview: React.ReactNode;
};

function QuickButton({ label, sublabel, onClick, preview }: QuickButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-36 sm:w-40 rounded-3xl px-3 py-2 flex items-center justify-between bg-zinc-900/85 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
    >
      <div className="flex flex-col items-start">
        <span className="text-[13px] font-semibold text-white">
          {label}
        </span>
        <span className="text-[10px] text-emerald-300/90">
          {sublabel}
        </span>
      </div>
      <div className="h-10 w-10 rounded-2xl overflow-hidden bg-black/60 border border-emerald-500/40 flex items-center justify-center">
        {preview}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------

export default function LeftQuickNav() {
  const [cardIndex, setCardIndex] = useState(0);
  const [suitIndex, setSuitIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0);

  // cards animation (just gradient + text, no broken image)
  useEffect(() => {
    const id = setInterval(
      () => setCardIndex((i) => (i + 1) % CARD_RARITIES.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  // suits animation
  useEffect(() => {
    if (!suits.length) return;
    const id = setInterval(
      () => setSuitIndex((i) => (i + 1) % suits.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  // pets animation
  useEffect(() => {
    if (!PETS.length) return;
    const id = setInterval(
      () => setPetIndex((i) => (i + 1) % PETS.length),
      900
    );
    return () => clearInterval(id);
  }, []);

  const currentCard: CardRarity = CARD_RARITIES[cardIndex];
  const suitImg = suits[suitIndex]?.img ?? "/suits/starter.png";
  const petImg = PETS[petIndex]?.img ?? "/pets/mouse.png";

  // ---- PREVIEWS -----------------------------------------------------

  const cardPreview = (
    <div
      className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${rarityBg(
        currentCard
      )}`}
    >
      <span className="text-[8px] font-semibold uppercase text-white drop-shadow">
        {rarityLabel(currentCard)}
      </span>
    </div>
  );

  const suitPreview = (
    <img
      src={suitImg}
      alt="Suit"
      className="h-full w-full object-contain"
      draggable={false}
    />
  );

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
      {/* Cards – higher, near top blue box */}
      <div className="pointer-events-auto absolute left-3 top-28 z-10">
        <QuickButton
          label="Cards"
          sublabel="All rarities"
          onClick={() => goto("cards")}
          preview={cardPreview}
        />
      </div>

      {/* Suits – middle */}
      <div className="pointer-events-auto absolute left-3 top-52 z-10">
        <QuickButton
          label="Suits"
          sublabel="Style & boosts"
          onClick={() => goto("suits")}
          preview={suitPreview}
        />
      </div>

      {/* Pets – lower, closer to dragon */}
      <div className="pointer-events-auto absolute left-3 top-[18.5rem] z-10">
        <QuickButton
          label="Pets"
          sublabel="Cute helpers"
          onClick={() => goto("pets")}
          preview={petPreview}
        />
      </div>
    </>
  );
}
