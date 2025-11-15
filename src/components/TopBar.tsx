// src/components/TopBar.tsx
import React from "react";
import { formatMoneyShort } from "../lib/format";

type Props = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
};

const RANK_TARGET = 1_000_000; // next milestone shown on the right

export default function TopBar({ taps, tapValue, autoPerSec }: Props) {
  const rankPct = Math.max(
    0,
    Math.min(100, Math.floor((taps / RANK_TARGET) * 100))
  );

  return (
    <header className="px-4 pt-2 pb-3 bg-[#05070a] border-b border-white/5">
      <div className="flex items-center gap-3">
        {/* Left: APS / Tap / Taps */}
        <div className="flex flex-col text-[11px] text-zinc-300 leading-tight min-w-[80px]">
          <div>
            APS{" "}
            <span className="text-emerald-400 font-semibold">
              {formatMoneyShort(autoPerSec)}
            </span>
          </div>
          <div>
            Tap{" "}
            <span className="text-emerald-400 font-semibold">
              {formatMoneyShort(tapValue)}
            </span>
          </div>
          <div className="truncate">
            Taps{" "}
            <span className="text-emerald-400 font-semibold">
              {formatMoneyShort(taps)}
            </span>
          </div>
        </div>

        {/* Center: Game title + player */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-emerald-400 text-lg font-bold">
            MoneyMaker 💸
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-100">
            <div className="h-7 w-7 rounded-full border border-emerald-500 flex items-center justify-center text-xs font-semibold">
              P
            </div>
            <span>Player</span>
          </div>
        </div>

        {/* Right: Rank bar */}
        <div className="flex flex-col items-end text-[11px] text-zinc-300 min-w-[90px]">
          <div className="flex items-center gap-1">
            <span>Rank</span>
            <span className="text-emerald-400 font-semibold">
              • {rankPct}%
            </span>
          </div>
          <div className="mt-1 w-20 h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${rankPct}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            Next: {formatMoneyShort(RANK_TARGET)}
          </div>
        </div>
      </div>
    </header>
  );
}
