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
  if (n >= 1_000_000_000)
    return (
      (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
    );
  if (n >= 1_000_000)
    return (
      (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    );
  if (n >= 1_000)
    return (
      (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
    );
  return String(Math.floor(n));
}

export default function TopBar({ taps, tapValue, autoPerSec }: Props) {
  const [displayName, setDisplayName] = useState("Player");
  const [avatar, setAvatar] = useState<string | undefined>();
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    let dead = false;

    async function load() {
      const p = getProfile();
      if (dead) return;

      setDisplayName(p.name || "Player");
      setAvatar(p.avatarUrl);

      if (!p.uid) return;

      try {
        // 🔥 Load many rows to guarantee you are included
        const rows: LeaderRow[] = await topGlobal(5000);
        if (dead) return;

        // 🔥 Sort manually to guarantee proper ranking
        rows.sort((a, b) => b.score - a.score);

        const pos = rows.findIndex(
          (r) => String(r.uid) === String(p.uid)
        );

        // 🔥 Always show a rank, even if you're the ONLY one
        if (pos >= 0) setRank(pos + 1);
        else setRank(1);
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
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "profile" } })
    );
  }

  function openLeaderboard() {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "leaderboard" } })
    );
  }

  return (
    <header className="w-full bg-black/40 border-b border-white/5 px-3 py-2 flex items-center justify-between gap-2">
      {/* LEFT : APS / Tap / Taps */}
      <div className="flex-none w-[92px] flex flex-col text-[11px] leading-tight text-white/70">
        <div className="flex gap-1">
          <span className="text-white/40">APS</span>
          <span className="text-emerald-400 font-semibold">
            {short(autoPerSec)}
          </span>
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

      {/* CENTER : CREATURES / TAP TO RISE */}
      <div className="flex-1 min-w-0 flex flex-col items-center transform -translate-x-1">
        {/* CREATURES — Royal gold, sharp 3D */}
        <div
          className="
            text-[15px] font-extrabold uppercase
            tracking-[0.26em]
            max-w-[220px] text-center
            bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-700
            bg-clip-text text-transparent
          "
          style={{
            textShadow:
              // top highlight
              "0 1px 0 rgba(255,255,255,0.85)," +
              // main bevel edge
              "0 2px 0 rgba(210,150,40,1)," +
              // deep inner edge
              "0 3px 0 rgba(120,70,10,1)," +
              // subtle drop shadow
              "0 3px 4px rgba(0,0,0,0.95)",
          }}
        >
          CREATURES
        </div>

        {/* TAP TO RISE — emerald accent */}
        <div
          className="
            text-[10px] uppercase tracking-[0.24em]
            mt-0.5 whitespace-nowrap font-semibold
            text-emerald-300
          "
          style={{
            textShadow: "0 0 6px rgba(16,185,129,0.9)",
          }}
        >
          TAP TO RISE
        </div>
      </div>

      {/* RIGHT : PROFILE + RANK */}
      <div className="flex-none">
        <div className="flex items-stretch rounded-2xl bg-white/5 border border-white/10 overflow-hidden max-w-[190px]">
          {/* PROFILE */}
          <button
            onClick={openProfile}
            className="flex items-center gap-2 px-2 py-1 pr-3 min-w-0"
          >
            {avatar ? (
              <img
                src={avatar}
                className="h-7 w-7 rounded-full border border-emerald-500/70 object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col items-start leading-tight min-w-0">
              <span className="text-[11px] text-white font-semibold max-w-[80px] truncate">
                {displayName}
              </span>
              <span className="text-[9px] text-emerald-400">PROFILE</span>
            </div>
          </button>

          {/* divider */}
          <div className="w-px bg-white/10 my-1" />

          {/* RANK */}
          <button
            onClick={openLeaderboard}
            className="flex flex-col items-center justify-center px-3 py-1 min-w-[54px]"
          >
            <span className="text-[9px] uppercase tracking-wide text-white/45">
              RANK
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {rank ? `#${rank}` : "#1"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
