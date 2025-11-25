// src/pages/casino/components/PlayerHand.tsx
import React from "react";
import CardDisplay, { PlayingCard } from "./CardDisplay";

type Props = {
  cards: PlayingCard[];
  total: number;
};

export default function PlayerHand({ cards, total }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">You</span>
        <span className="text-xs text-emerald-300 font-semibold">
          Total: {total}
        </span>
      </div>
      <div className="flex gap-1">
        {cards.map((card, i) => (
          <CardDisplay key={i} card={card} />
        ))}
      </div>
    </div>
  );
}
