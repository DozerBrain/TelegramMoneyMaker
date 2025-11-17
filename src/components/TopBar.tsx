// src/components/TopBar.tsx
import React, { useEffect, useState } from "react";
import { getProfile } from "../lib/profile";
import { topGlobal, type LeaderRow } from "../lib/leaderboard";

type Props = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
};

function short(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.floor(n));
}

export default function TopBar({ taps, tapValue, autoPerSec }: Props) {
  const [displayName, setDisplayName] = useState("Player");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [rank, setRank] = useState<number | null>(null);

  // load profile + rank
  useEffect(() => {
    let dead = false;

    async function load() {
      const p = getProfile();
      if (dead) return;

      setDisplayName(p.name || "Player");
      setAvatar(p.avatarUrl);

      if (!p.uid) return;

      try {
        const rows: LeaderRow[] = await topGlobal(100);
        if (dead) return;

        const pos = rows.findIndex((r) => String(r.uid) === String(p.uid));
        setRank(pos >= 0 ? pos + 1 : null);
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      dead = true;
    };
  }, []);

  function openProfile() {
    window.dispatchEvent(new CustomEvent("MM_GOTO", { detail: { goto: "profile" } }));
  }

  function openLeaderboard() {
    window.dispatchEvent(new CustomEvent("MM_GOTO", { detail: { goto: "leaderboard" } }));
  }

  return (
    <header className="w-full bg-black/40 border-b border-white/5 px-3 py-2 flex items-center justify-between">
      {/* LEFT : APS / Tap / Taps */}
      <div className="flex flex-col text-[11px] leading-tight text-white/70 min-w-[80px]">
        <div className="flex gap-1">
          <span className="text-white/40">APS</span>
          <span className="text-emerald-400 font-semibold">{short(autoPerSec)}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-white/40">Tap</span>
          <span className="font-semibold">{short(tapValue)}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-white/40">Taps</span>
          <span className="font-semibold">{short(taps)}</span>
        </div>
      </div>

      {/* CENTER : title */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-[15px] font-semibold text-emerald-400">
          MoneyMaker 💸
        </div>
        <div className="text-[10px] tracking-[0.18em] text-white/40 mt-0.5">
          TAP • EARN • FLEX
        </div>
      </div>

      {/* RIGHT : big pill with Profile + Rank */}
      <div className="flex items-center">
        <div className="flex items-stretch rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {/* PROFILE PART */}
          <button
            onClick={openProfile}
            className="flex items-center gap-2 px-2 py-1 pr-3"
          >
            {avatar ? (
              <img
                src={avatar}
                className="h-7 w-7 rounded-full border border-emerald-500/70 object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-[10px] font-semibold">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] text-white font-semibold max-w-[80px] truncate">
                {displayName}
              </span>
              <span className="text-[9px] text-emerald-400">PROFILE</span>
            </div>
          </button>

          {/* small divider */}
          <div className="w-px bg-white/10 my-1" />

          {/* RANK PART */}
          <button
            onClick={openLeaderboard}
            className="flex flex-col items-center justify-center px-3 py-1 min-w-[54px]"
          >
            <span className="text-[9px] uppercase tracking-wide text-white/45">
              RANK
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {rank ? `#${rank}` : "-"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
