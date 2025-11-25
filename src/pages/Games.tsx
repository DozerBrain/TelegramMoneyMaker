// src/pages/Games.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import WorldMapPage from "./WorldMap";
import BlackjackGame from "./casino/BlackjackGame";
import CoinFlipGame from "./casino/CoinFlipGame";
import RouletteGame from "./casino/RouletteGame";
import SlotsGame from "./casino/SlotsGame";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance: number;
  setBalance: (n: number) => void;
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;
};

type GamesTab = "world" | "casino";
type CasinoTab = "blackjack" | "coinflip" | "roulette" | "slots";

export default function GamesPage({
  balance,
  setBalance,
  chips,
  setChips,
}: Props) {
  const [tab, setTab] = useState<GamesTab>("world");
  const [casinoTab, setCasinoTab] = useState<CasinoTab>("blackjack");

  function handleExchangeToChips() {
    const cost = 1_000_000;
    const chipsGain = 100;

    if (chips >= 50_000) {
      alert(
        "You already have a lot of chips. Exchange locked above 50,000 chips."
      );
      return;
    }
    if (balance < cost) {
      alert("Not enough money to buy more chips.");
      return;
    }

    setBalance(balance - cost);
    setChips((c) => c + chipsGain);
  }

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-4">
      {/* Main Games tabs */}
      <Card
        title="Games"
        right={
          <span className="text-xs text-white/60">
            Balance:{" "}
            <span className="text-emerald-300">
              ${formatMoneyShort(balance)}
            </span>
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => setTab("world")}
            className={`py-2 rounded-full text-sm font-semibold ${
              tab === "world"
                ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/40"
                : "bg-zinc-800 text-white/70"
            }`}
          >
            Conquer the World
          </button>
          <button
            onClick={() => setTab("casino")}
            className={`py-2 rounded-full text-sm font-semibold ${
              tab === "casino"
                ? "bg-purple-500 text-purple-950 shadow-lg shadow-purple-500/40"
                : "bg-zinc-800 text-white/70"
            }`}
          >
            Casino
          </button>
        </div>
      </Card>

      {/* Conquer the World */}
      {tab === "world" && <WorldMapPage balance={balance} />}

      {/* Casino */}
      {tab === "casino" && (
        <>
          {/* Chips + exchange */}
          <Card title="Casino Chips">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/60">Your chips</div>
                <div className="text-2xl font-bold text-emerald-300">
                  {chips.toLocaleString()} 🟡
                </div>
              </div>
              <button
                onClick={handleExchangeToChips}
                className="px-4 py-2 rounded-full bg-emerald-500 text-emerald-950 text-sm font-semibold active:scale-[0.97]"
              >
                Exchange $1,000,000 → 100 chips
              </button>
            </div>
            <div className="mt-2 text-[10px] text-white/40">
              Exchange is disabled once you reach 50,000 chips to prevent
              infinite farming.
            </div>
          </Card>

          {/* Casino games selector + panels */}
          <Card title="Casino Games">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setCasinoTab("blackjack")}
                className={`p-3 rounded-2xl text-left border ${
                  casinoTab === "blackjack"
                    ? "bg-zinc-900 border-white/40"
                    : "bg-zinc-950 border-white/10"
                }`}
              >
                <div className="text-xs font-semibold text-white">
                  Blackjack
                </div>
                <div className="text-[10px] text-white/50 mt-1">
                  Classic 21 card game.
                </div>
              </button>

              <button
                onClick={() => setCasinoTab("coinflip")}
                className={`p-3 rounded-2xl text-left border ${
                  casinoTab === "coinflip"
                    ? "bg-zinc-900 border-emerald-400/60"
                    : "bg-zinc-950 border-white/10"
                }`}
              >
                <div className="text-xs font-semibold text-white">
                  Coin Flip
                </div>
                <div className="text-[10px] text-white/50 mt-1">
                  50/50 gamble.
                </div>
              </button>

              <button
                onClick={() => setCasinoTab("roulette")}
                className={`p-3 rounded-2xl text-left border ${
                  casinoTab === "roulette"
                    ? "bg-zinc-900 border-white/40"
                    : "bg-zinc-950 border-white/10"
                }`}
              >
                <div className="text-xs font-semibold text-white">
                  Roulette
                </div>
                <div className="text-[10px] text-white/50 mt-1">
                  Bet on red / black.
                </div>
              </button>

              <button
                onClick={() => setCasinoTab("slots")}
                className={`p-3 rounded-2xl text-left border ${
                  casinoTab === "slots"
                    ? "bg-zinc-900 border-white/40"
                    : "bg-zinc-950 border-white/10"
                }`}
              >
                <div className="text-xs font-semibold text-white">
                  Slots
                </div>
                <div className="text-[10px] text-white/50 mt-1">
                  Spin for big wins.
                </div>
              </button>
            </div>

            {/* Game panels */}
            {casinoTab === "blackjack" && (
              <BlackjackGame chips={chips} setChips={setChips} />
            )}

            {casinoTab === "coinflip" && (
              <CoinFlipGame chips={chips} setChips={setChips} />
            )}

            {casinoTab === "roulette" && (
              <RouletteGame chips={chips} setChips={setChips} />
            )}

            {casinoTab === "slots" && (
              <SlotsGame chips={chips} setChips={setChips} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
