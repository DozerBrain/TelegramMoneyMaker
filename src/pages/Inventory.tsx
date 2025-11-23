// src/pages/Inventory.tsx
import React, { useState } from "react";
import CardsPage from "./Cards";
import SuitsPage from "./Suits";
import PetsPage from "./Pets";
import type { Rarity as CardRarity } from "../components/CardFrame";
import { TAPS_PER_COUPON } from "../incomeMath";

export type CardInstance = {
  id: string;
  rarity: CardRarity;
  serial: string;
  obtainedAt: number;
};

type Props = {
  // Core stats (only needed for subpages like Suits if required later)
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

  // Card / coupon state (from App)
  cards: CardInstance[];
  setCards: React.Dispatch<React.SetStateAction<CardInstance[]>>;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: React.Dispatch<React.SetStateAction<number>>;
  bulkDiscountLevel: number;

  // Optional save handlers (so App.tsx can pass them without TS errors)
  onExport?: () => void;
  onImport?: (raw: string) => void;
  onReset?: () => void;
};

export default function InventoryPage({
  balance,            // currently only used by SuitsPage (if needed)
  totalEarnings,      // not used yet, but kept for future inventory stats
  taps,
  tapValue,
  autoPerSec,
  multi,
  cards,
  setCards,
  couponsAvailable,
  couponsSpent,
  setCouponsSpent,
  bulkDiscountLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onExport,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onImport,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReset,
}: Props) {
  const [tab, setTab] = useState<"cards" | "suits" | "pets">("cards");

  return (
    <div className="w-full h-full flex flex-col items-center pt-3 pb-24 px-4 text-white">
      {/* Top selector: Cards / Suits / Pets (local only, no page switch) */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setTab("cards")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "cards"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/40"
              : "bg-zinc-900/80 text-white/75 border border-white/10 hover:bg-zinc-800"
          }`}
        >
          Cards
        </button>

        <button
          onClick={() => setTab("suits")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "suits"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/40"
              : "bg-zinc-900/80 text-white/75 border border-white/10 hover:bg-zinc-800"
          }`}
        >
          Suits
        </button>

        <button
          onClick={() => setTab("pets")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === "pets"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/40"
              : "bg-zinc-900/80 text-white/75 border border-white/10 hover:bg-zinc-800"
          }`}
        >
          Pets
        </button>
      </div>

      {/* Content area */}
      <div className="w-full max-w-md mt-2">
        {tab === "cards" && (
          <CardsPage
            taps={taps}
            cards={cards}
            setCards={setCards}
            couponsAvailable={couponsAvailable}
            couponsSpent={couponsSpent}
            setCouponsSpent={setCouponsSpent}
            tapsPerCoupon={TAPS_PER_COUPON}
            bulkDiscountLevel={bulkDiscountLevel}
          />
        )}

        {tab === "suits" && <SuitsPage balance={balance} />}

        {tab === "pets" && <PetsPage />}
      </div>
    </div>
  );
}
