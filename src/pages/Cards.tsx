// src/pages/Cards.tsx
import React, { useState } from "react";
import type { CardInstance } from "../App";
import CardChest from "../components/cards/CardChest";
import CardCollection from "../components/cards/CardCollection";

type Props = {
  taps: number;
  cards: CardInstance[];
  setCards: (v: CardInstance[] | ((prev: CardInstance[]) => CardInstance[])) => void;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;
  tapsPerCoupon: number;
};

function TabButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
) {
  const { active, className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition
        ${
          active
            ? "bg-emerald-500 text-emerald-950"
            : "bg-white/10 text-slate-200 hover:bg-white/15"
        }
        ${className}`}
    />
  );
}

export default function CardsPage(props: Props) {
  const [tab, setTab] = useState<"chest" | "collection">("chest");

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-semibold text-emerald-400">
        Cards
      </h2>

      {/* Tabs */}
      <div className="mt-3 flex gap-2">
        <TabButton active={tab === "chest"} onClick={() => setTab("chest")}>
          Chest
        </TabButton>
        <TabButton
          active={tab === "collection"}
          onClick={() => setTab("collection")}
        >
          Collection
        </TabButton>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-4">
        {tab === "chest" ? (
          <CardChest {...props} />
        ) : (
          <CardCollection cards={props.cards} />
        )}
      </div>
    </div>
  );
}
