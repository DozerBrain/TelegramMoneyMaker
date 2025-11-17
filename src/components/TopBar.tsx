// src/components/TopBar.tsx
import React, { useEffect, useState } from "react";
import { getProfile } from "../lib/profile";

type Props = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
  /** Global rank from App (1 = #1 in world) */
  myRank?: number | null;
};

export default function TopBar({ taps, tapValue, autoPerSec, myRank }: Props) {
  const [name, setName] = useState("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    const p = getProfile();
    setName(p.name || "Player");
    setAvatarUrl(p.avatarUrl);
    setUid(String(p.uid || p.userId || ""));
  }, []);

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  const handleGoProfile = () => {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "profile" } })
    );
  };

  const handleGoLeaderboard = () => {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "leaderboard" } })
    );
  };

  const rankLabel =
    typeof myRank === "number" && myRank > 0 ? `#${myRank}` : "--";

  return (
    <header className="px-4 pt-3 pb-2 flex items-center justify-between bg-[#05070a]/80 backdrop-blur-sm border-b border-white/5">
      {/* Left: stats */}
      <div className="flex flex-col text-[11px] text-white/70">
        <div className="flex gap-3">
          <div>
            <span className="text-white/40 mr-1">APS</span>
            <span className="font-semibold text-emerald-400">
              {autoPerSec.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-white/40 mr-1">Tap</span>
            <span className="font-semibold">
              {tapValue.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="mt-0.5 text-white/50">
          Taps{" "}
          <span className="font-semibold text-white/80">
            {taps.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Middle: title */}
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-emerald-400/80">
          MoneyMaker
        </div>
        <div className="text-[10px] text-white/40">Tap • Grow • Flex</div>
      </div>

      {/* Right: rank + profile avatar */}
      <div className="flex items-center gap-2">
        {/* Rank pill – tap = go leaderboard */}
        <button
          onClick={handleGoLeaderboard}
          className="flex flex-col items-end px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-emerald-500/40 text-[10px] leading-tight"
        >
          <span className="text-white/40">Global rank</span>
          <span className="text-emerald-400 font-semibold text-xs">
            {rankLabel}
          </span>
        </button>

        {/* Avatar – tap = go profile */}
        <button
          onClick={handleGoProfile}
          className="flex items-center justify-center"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 shadow-md"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-xs font-bold border border-emerald-500/60 shadow-md">
              {initials}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
