// src/pages/casino/components/DealerHand.tsx
import React from "react";
import CardDisplay, { PlayingCard } from "./CardDisplay";

type Props = {
  cards: PlayingCard[];
  hideHole?: boolean;
  total: number | null;
};

export default function DealerHand({ cards, hideHole, total }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">Dealer</span>
        <span className="text-xs text-white/70">
          {total !== null ? `Total: ${total}` : "Total: ?"}
        </span>
      </div>
      <div className="flex gap-1">
        {cards.map((card, i) => (
          <CardDisplay
            key={i}
            card={card}
            hidden={hideHole && i === 0}
          />
        ))}
      </div>
    </div>
  );
}
