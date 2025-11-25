// src/pages/casino/BlackjackGame.tsx
import React from "react";
import DealerHand from "./components/DealerHand";
import PlayerHand from "./components/PlayerHand";
import { useBlackjack } from "./hooks/useBlackjack";

type Props = {
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;
};

export default function BlackjackGame({ chips, setChips }: Props) {
  const {
    phase,
    bet,
    message,
    playerCards,
    dealerCards,
    playerTotal,
    dealerTotal,
    minBet,
    setBet,
    handleBetChange,
    startRound,
    hit,
    stand,
    resetRound,
  } = useBlackjack(chips, setChips);

  return (
    <div className="space-y-4">
      {/* Bet + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-white/60 mb-1">Bet amount</div>
          <input
            type="tel"
            value={bet}
            onChange={(e) => handleBetChange(e.target.value)}
            disabled={phase !== "betting"}
            className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
          />
          <div className="mt-1 flex gap-1">
            {[10, 50, 100, 500].map((v) => (
              <button
                key={v}
                disabled={phase !== "betting" || v > chips}
                onClick={() => setBet(v)}
                className="px-2 py-1 rounded-full bg-zinc-800 text-[11px] text-white/70 disabled:opacity-40"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-white/60">Your chips</div>
          <div className="text-lg font-bold text-emerald-300">
            {chips.toLocaleString()} 🟡
          </div>
        </div>
      </div>

      {/* Hands */}
      <div className="space-y-4 rounded-2xl bg-zinc-950/80 border border-white/10 p-3">
        <DealerHand
          cards={dealerCards}
          hideHole={phase === "playerTurn"}
          total={dealerTotal}
        />
        <div className="h-px bg-white/10 my-1" />
        <PlayerHand cards={playerCards} total={playerTotal} />
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {phase === "betting" && (
          <button
            onClick={startRound}
            disabled={chips <= 0}
            className="w-full py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97] disabled:opacity-40"
          >
            Deal cards
          </button>
        )}

        {phase === "playerTurn" && (
          <div className="flex gap-2">
            <button
              onClick={hit}
              className="flex-1 py-3 rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm active:scale-[0.97]"
            >
              Hit
            </button>
            <button
              onClick={stand}
              className="flex-1 py-3 rounded-full bg-zinc-800 text-white font-semibold text-sm active:scale-[0.97]"
            >
              Stand
            </button>
          </div>
        )}

        {phase === "result" && (
          <button
            onClick={resetRound}
            className="w-full py-3 rounded-full bg-zinc-800 text-white font-semibold text-sm active:scale-[0.97]"
          >
            New hand
          </button>
        )}

        <div className="text-[11px] text-white/60 mt-1">{message}</div>
        <div className="text-[10px] text-white/30">
          Min bet: {minBet} chips.
        </div>
      </div>
    </div>
  );
}
