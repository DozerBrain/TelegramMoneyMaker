// src/pages/Games.tsx
import React, { useState } from "react";
import Card from "../components/Card";
import WorldMapPage from "./WorldMap";
import { formatMoneyShort } from "../lib/format"; // ✅ big-number formatter

type Props = {
  balance: number;
  setBalance: (n: number) => void;
  chips: number;
  setChips: (n: number) => void;
};

type GamesTab = "world" | "casino";
type CasinoTab = "blackjack" | "coinflip";

export default function GamesPage({
  balance,
  setBalance,
  chips,
  setChips,
}: Props) {
  const [tab, setTab] = useState<GamesTab>("world");
  const [casinoTab, setCasinoTab] = useState<CasinoTab>("coinflip");

  // Coin flip state
  const [bet, setBet] = useState<number>(10);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [lastFlip, setLastFlip] = useState<"heads" | "tails" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);

  const minBet = 10;

  function handleExchangeToChips() {
    // Example: 1,000,000 money -> +100 chips
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
    setChips(chips + chipsGain);
  }

  function handleBetChange(value: string) {
    const n = Number(value.replace(/\D/g, ""));
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(minBet, Math.min(n, chips));
    setBet(clamped);
  }

  function setQuickBet(amount: number) {
    const clamped = Math.max(minBet, Math.min(amount, chips));
    setBet(clamped);
  }

  function handleFlip() {
    if (chips <= 0) {
      alert("You have no chips. Exchange money into chips first.");
      return;
    }
    if (bet < minBet) {
      alert(`Minimum bet is ${minBet} chips.`);
      return;
    }
    if (bet > chips) {
      alert("You don't have enough chips for that bet.");
      return;
    }

    const flip: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const win = flip === choice;

    if (win) {
      setChips(chips + bet);
    } else {
      setChips(Math.max(0, chips - bet));
    }

    setLastFlip(flip);
    setLastWin(win);
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
                  {formatMoneyShort(chips)}
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

          {/* Casino games selector */}
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
                  Coming soon – classic 21 card game.
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
                  50/50 gamble: double or lose your chips.
                </div>
              </button>
            </div>

            {casinoTab === "blackjack" && (
              <div className="text-xs text-white/60">
                Blackjack is not implemented yet, but the Casino structure is
                ready. We can add full logic later.
              </div>
            )}

            {casinoTab === "coinflip" && (
              <div className="mt-2 space-y-3">
                {/* Choose side */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChoice("heads")}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                      choice === "heads"
                        ? "bg-emerald-500 text-emerald-950"
                        : "bg-zinc-800 text-white/70"
                    }`}
                  >
                    Heads
                  </button>
                  <button
                    onClick={() => setChoice("tails")}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                      choice === "tails"
                        ? "bg-emerald-500 text-emerald-950"
                        : "bg-zinc-800 text-white/70"
                    }`}
                  >
                    Tails
                  </button>
                </div>

                {/* Bet input + quick bets */}
                <div className="space-y-2">
                  <div className="text-xs text-white/60">
                    Bet (min {minBet} chips)
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={bet}
                      onChange={(e) => handleBetChange(e.target.value)}
                      className="flex-1 rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none"
                    />
                    <div className="flex gap-1">
                      {[10, 50, 100, 500].map((v) => (
                        <button
                          key={v}
                          onClick={() => setQuickBet(v)}
                          className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flip button */}
                <button
                  onClick={handleFlip}
                  className="w-full py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
                >
                  Flip the Coin
                </button>

                {/* Last result */}
                <div className="text-xs text-white/60">
                  {lastFlip === null ? (
                    <span>No flips yet.</span>
                  ) : (
                    <span>
                      Last flip:&nbsp;
                      <span className="font-semibold text-white">
                        {lastFlip.toUpperCase()}
                      </span>{" "}
                      –{" "}
                      {lastWin ? (
                        <span className="text-emerald-400 font-semibold">
                          YOU WON +{bet} chips
                        </span>
                      ) : (
                        <span className="text-red-400 font-semibold">
                          YOU LOST -{bet} chips
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
