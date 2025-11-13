// src/components/TopBar.tsx
import React, { useMemo } from "react";
import { loadSave } from "../lib/storage";
import { getTelegramUser, tgDisplayName } from "../lib/telegram";

type Props = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
};

export default function TopBar({ taps, tapValue, autoPerSec }: Props) {
  const s = loadSave();
  const totalEarnings = s.totalEarnings ?? 0;

  // Prefer Telegram identity (inside TG), fallback to initials
  const tgUser = getTelegramUser();
  const name = tgDisplayName(tgUser);
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || "").join("") || "P";
  }, [name]);

  // Simple progress: % toward next order of magnitude (1, 10, 100, 1k, 10k…)
  const nextTarget = Math.max(1, Math.pow(10, Math.ceil(Math.log10(Math.max(1, totalEarnings))))); 
  const pct = Math.max(0, Math.min(100, Math.floor((totalEarnings / nextTarget) * 100)));

  const openProfile = () => { location.hash = "#/profile"; };
  const openLeaderboard = () => { location.hash = "#/leaderboard"; };

  return (
    <header className="w-full border-b border-white/10 bg-[#0b0f13] text-white">
      {/* Row 1: App title centered */}
      <div className="px-3 py-2">
        <h1 className="text-center text-lg font-extrabold tracking-wide">
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
            MoneyMaker
          </span>{" "}
          <span aria-hidden>💸</span>
        </h1>
      </div>

      {/* Row 2: Stats • Avatar • Rank */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 items-center gap-2">
          {/* Left: compact stats */}
          <div className="text-[11px] leading-4 text-white/80">
            <div>APS <span className="text-emerald-300 font-semibold">{autoPerSec}</span></div>
            <div>Tap <span className="text-emerald-300 font-semibold">{tapValue}</span></div>
            <div>Taps <span className="text-white/70">{taps.toLocaleString()}</span></div>
          </div>

          {/* Center: avatar + name */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={openProfile}
              className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-emerald-500/50 shadow active:scale-95 transition"
              title="Open Profile"
            >
              {tgUser?.photo_url ? (
                <img
                  src={tgUser.photo_url}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center bg-white/5 text-emerald-300 font-bold">
                  {initials}
                </div>
              )}
            </button>
            <div className="max-w-[7.5rem] truncate text-sm opacity-90">{name}</div>
          </div>

          {/* Right: rank/progress */}
          <div className="flex flex-col items-end">
            <button
              onClick={openLeaderboard}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
              title="Open Leaderboard"
            >
              Rank • {pct}%
            </button>
            <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${pct}%`, transition: "width .25s ease" }}
              />
            </div>
            <div className="text-[10px] text-white/60 mt-1">Next: {nextTarget.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
