// src/pages/casino/BlackjackPlaceholder.tsx
import React from "react";

export default function BlackjackPlaceholder() {
  return (
    <div className="text-sm text-white/80">
      <div className="font-semibold mb-2">
        Blackjack (21) – beat the dealer without going over 21.
      </div>

      <ul className="list-disc pl-4 text-white/60 text-[13px] space-y-1">
        <li>You vs dealer, closest to 21 wins.</li>
        <li>Face cards = 10, Aces = 1 or 11.</li>
        <li>We'll use chips as betting currency.</li>
      </ul>

      <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        This is a <strong>placeholder</strong>.
        Next step we will add:
        <ul className="list-disc pl-4 mt-1 text-[12px] text-white/60 space-y-1">
          <li>real dealing logic</li>
          <li>hit / stand buttons</li>
          <li>chip payouts</li>
        </ul>
      </div>
    </div>
  );
}
