// src/pages/Games.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import WorldMapPage from "./WorldMap";
import { formatMoneyShort } from "../lib/format";

type GamesPageProps = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
};

type MainTab = "world" | "casino";
type CasinoTab = "blackjack" | "coin";

function BlackjackPlaceholder() {
  return (
    <div className="space-y-3 text-sm text-white/80">
      <p className="text-xs text-white/60">
        Blackjack (21) – beat the dealer without going over 21.
      </p>
      <ul className="list-disc list-inside text-xs text-white/60 space-y-1">
        <li>You vs dealer, closest to 21 wins.</li>
        <li>Face cards = 10, Aces = 1 or 11.</li>
        <li>We&apos;ll use <span className="text-emerald-300">chips</span> as the betting currency.</li>
      </ul>
      <div className="mt-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[11px]">
        This is a <span className="font-semibold text-emerald-300">visual placeholder</span>.
        Next step we&apos;ll add:
        <br />
        • real dealing logic<br />
        • hit / stand buttons<br />
        • win / lose payouts with chips
      </div>
    </div>
  );
}

function CoinFlipPlaceholder() {
  return (
    <div className="space-y-3 text-sm text-white/80">
      <p className="text-xs text-white/60">
        Simple Coin Flip – pick heads or tails and win or lose chips.
      </p>
      <ul className="list-disc list-inside text-xs text-white/60 space-y-1">
        <li>50 / 50 chance each flip.</li>
        <li>Win: get your bet back + same amount.</li>
        <li>Lose: bet is lost.</li>
      </ul>
      <div className="mt-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[11px]">
        Also a <span className="font-semibold text-emerald-300">placeholder</span> for now.
        We&apos;ll wire chips, bets and random flips in the next step.
      </div>
    </div>
  );
}

export default function GamesPage({ balance }: GamesPageProps) {
  const [mainTab, setMainTab] = useState<MainTab>("world");
  const [casinoTab, setCasinoTab] = useState<CasinoTab>("blackjack");

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 text-white">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-emerald-400">
            Games
          </div>
          <div className="text-[11px] text-white/60">
            Conquer the world or visit the casino.
          </div>
        </div>
        <div className="text-right text-[11px] text-white/60">
          Balance
          <div className="text-emerald-300 font-semibold">
            ${formatMoneyShort(balance)}
          </div>
        </div>
      </div>

      {/* Top pills: Conquer the World | Casino */}
      <div className="mb-4">
        <div className="inline-flex rounded-full bg-white/5 p-1">
          <button
            onClick={() => setMainTab("world")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
              mainTab === "world"
                ? "bg-emerald-500 text-emerald-950 shadow shadow-emerald-500/40"
                : "text-white/70"
            }`}
          >
            Conquer the World
          </button>
          <button
            onClick={() => setMainTab("casino")}
            className={`ml-1 px-3 py-1.5 text-xs font-semibold rounded-full transition ${
              mainTab === "casino"
                ? "bg-emerald-500 text-emerald-950 shadow shadow-emerald-500/40"
                : "text-white/70"
            }`}
          >
            Casino
          </button>
        </div>
      </div>

      {/* Content */}
      {mainTab === "world" && (
        <Card title="Conquer the World">
          {/* Reuse existing WorldMap mini-game */}
          <WorldMapPage balance={balance} />
        </Card>
      )}

      {mainTab === "casino" && (
        <Card
          title="Casino"
          right={
            <span className="text-[11px] text-emerald-300">
              Chips system coming soon
            </span>
          }
        >
          {/* Casino inner tabs: Blackjack | Coin Flip */}
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setCasinoTab("blackjack")}
              className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                casinoTab === "blackjack"
                  ? "bg-emerald-500 text-emerald-950 border-emerald-400"
                  : "bg-black/40 text-white/70 border-white/15"
              }`}
            >
              Blackjack
            </button>
            <button
              onClick={() => setCasinoTab("coin")}
              className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold border ${
                casinoTab === "coin"
                  ? "bg-emerald-500 text-emerald-950 border-emerald-400"
                  : "bg-black/40 text-white/70 border-white/15"
              }`}
            >
              Coin Flip
            </button>
          </div>

          {/* Casino game body */}
          <div className="mt-1">
            {casinoTab === "blackjack" && <BlackjackPlaceholder />}
            {casinoTab === "coin" && <CoinFlipPlaceholder />}
          </div>

          <div className="mt-4 text-[10px] text-white/40">
            Design note: chips will be a separate currency with expensive
            exchange from balance and a daily exchange limit (like 50,000 worth
            of chips). We&apos;ll wire that logic into the save system next.
          </div>
        </Card>
      )}
    </div>
  );
}
