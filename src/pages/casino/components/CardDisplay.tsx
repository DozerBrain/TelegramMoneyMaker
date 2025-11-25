// src/pages/casino/components/CardDisplay.tsx
import React from "react";

export type Suit = "♠" | "♥" | "♦" | "♣";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type PlayingCard = {
  suit: Suit;
  rank: Rank;
};

type Props = {
  card: PlayingCard;
  hidden?: boolean;
};

export default function CardDisplay({ card, hidden }: Props) {
  if (hidden) {
    return (
      <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-xl bg-zinc-900 border border-white/15 flex items-center justify-center shadow-lg shadow-black/60">
        <div className="w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center text-xs">
          💸
        </div>
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const color = isRed ? "text-red-400" : "text-white";

  return (
    <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/15 flex flex-col justify-between p-1 shadow-lg shadow-black/60">
      <div className={`text-[9px] font-semibold ${color}`}>
        {card.rank}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className={`text-lg ${color}`}>{card.suit}</span>
      </div>
      <div className={`text-[9px] self-end rotate-180 ${color}`}>
        {card.rank}
      </div>
    </div>
  );
}
