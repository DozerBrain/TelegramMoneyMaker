// src/components/TopBar.tsx
import React, { useEffect, useState } from "react";
import { getProfile } from "../lib/profile";

type Props = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
};

function formatNumber(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return Math.floor(n).toString();
}

function goTo(tab: "profile" | "leaderboard") {
  try {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: tab } })
    );
  } catch {
    // ignore
  }
}

export default function TopBar({ taps, tapValue, autoPerSec }: Props) {
  const [name, setName] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [rankPercent] = useState<number>(0); // TODO: hook real rank later

  useEffect(() => {
    try {
      const p = getProfile();
      if (p.name) setName(p.name);
      if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
    } catch {
      // ignore
    }
  }, []);

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  return (
    <header className="px-4 pt-3 pb-2 flex items-center justify-between bg-[#05070a]/90 border-b border-white/5">
      {/* Left: stats */}
      <div className="flex flex-col text-xs text-white/60 leading-tight">
        <div className="flex gap-3">
          <span>
            <span className="text-white/40 mr-1">APS</span>
            <span className="text-emerald-400 font-semibold">
              {formatNumber(autoPerSec)}
            </span>
          </span>
          <span>
            <span className="text-white/40 mr-1">Tap</span>
            <span className="text-emerald-400 font-semibold">
              {formatNumber(tapValue)}
            </span>
          </span>
        </div>
        <div className="mt-0.5">
          <span className="text-white/40 mr-1">Taps</span>
          <span className="text-white/80 font-medium">
            {formatNumber(taps)}
          </span>
        </div>
      </div>

      {/* Center: title */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="text-sm font-semibold text-emerald-400 tracking-wide">
          MoneyMaker 💸
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-[0.16em]">
          Tap • Earn • Flex
        </div>
      </div>

      {/* Right: avatar + rank */}
      <div className="flex flex-col items-end gap-1">
        {/* Avatar (click → Profile) */}
        <button
          onClick={() => goTo("profile")}
          className="flex items-center gap-2 active:scale-[0.97] transition-transform"
        >
          <div className="h-8 w-8 rounded-full border border-emerald-500/80 overflow-hidden bg-emerald-900/60 flex items-center justify-center text-xs font-bold text-emerald-100">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[11px] text-white/80 font-medium">
              {name}
            </span>
            <span className="text-[9px] text-emerald-400/80">Profile</span>
          </div>
        </button>

        {/* Rank bar (click → Leaderboard) */}
        <button
          onClick={() => goTo("leaderboard")}
          className="mt-0.5 flex flex-col items-end gap-0.5 w-28 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between w-full text-[10px] text-white/55">
            <span>Rank</span>
            <span className="text-emerald-400 font-semibold">
              {rankPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${Math.min(100, Math.max(0, rankPercent))}%` }}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
