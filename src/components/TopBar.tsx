// src/components/TopBar.tsx
import React, { useEffect, useState } from "react";
import { getProfile } from "../lib/profile";
import { topGlobal, type LeaderRow } from "../lib/leaderboard";

type TopBarProps = {
  taps: number;
  tapValue: number;
  autoPerSec: number;
};

function formatNumberShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.floor(n));
}

export default function TopBar({ taps, tapValue, autoPerSec }: TopBarProps) {
  const [displayName, setDisplayName] = useState<string>("Player");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [rank, setRank] = useState<number | null>(null);

  // Load profile + rank
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const profile = getProfile();
        if (!profile) return;

        if (!cancelled) {
          setDisplayName(profile.name || "Player");
          setAvatarUrl(profile.avatarUrl);
        }

        if (!profile.uid) return;

        // Look at top 100 global and find this user
        try {
          const rows: LeaderRow[] = await topGlobal(100);
          if (cancelled) return;

          const idx = rows.findIndex((r) => String(r.uid) === String(profile.uid));
          if (idx >= 0) {
            // rank is 1-based, highest score first
            setRank(idx + 1);
          } else {
            setRank(null);
          }
        } catch {
          // ignore leaderboard errors
        }
      } catch {
        // ignore profile errors
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const apsLabel = formatNumberShort(autoPerSec);
  const tapLabel = formatNumberShort(tapValue);
  const tapsLabel = formatNumberShort(taps);

  function gotoProfile() {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "profile" } })
    );
  }

  function gotoLeaderboard() {
    window.dispatchEvent(
      new CustomEvent("MM_GOTO", { detail: { goto: "leaderboard" } })
    );
  }

  return (
    <header className="w-full bg-black/40 border-b border-white/5 px-3 py-2 flex items-center justify-between gap-2">
      {/* LEFT: APS / Tap / Taps */}
      <div className="flex flex-col text-[11px] leading-tight text-white/70 min-w-[80px]">
        <div className="flex items-baseline gap-1">
          <span className="text-white/40">APS</span>
          <span className="font-semibold text-emerald-400 text-[12px]">
            {apsLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white/40">Tap</span>
          <span className="font-semibold text-[12px]">{tapLabel}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-white/40">Taps</span>
          <span className="font-semibold text-[12px]">{tapsLabel}</span>
        </div>
      </div>

      {/* CENTER: Title + tagline */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-[15px] font-semibold text-emerald-400 leading-none">
          MoneyMaker 💸
        </div>
        <div className="mt-0.5 text-[10px] tracking-[0.18em] uppercase text-white/35">
          TAP • EARN • FLEX
        </div>
      </div>

      {/* RIGHT: Profile + Rank */}
      <div className="flex items-center gap-2 min-w-[110px] justify-end">
        {/* Rank pill (click → leaderboard) */}
        <button
          onClick={gotoLeaderboard}
          className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/75 flex flex-col items-end leading-tight"
        >
          <span className="uppercase text-[9px] tracking-wide text-white/45">
            Rank
          </span>
          <span className="font-semibold text-[11px] text-emerald-400">
            {rank ? `#${rank}` : "-"}
          </span>
        </button>

        {/* Profile (click → profile page) */}
        <button
          onClick={gotoProfile}
          className="flex items-center gap-2"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-emerald-500/70 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-[11px] font-semibold">
              {displayName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "P"}
            </div>
          )}

          <div className="flex flex-col items-start leading-tight text-left">
            <span className="text-[11px] font-semibold text-white truncate max-w-[80px]">
              {displayName}
            </span>
            <span className="text-[9px] text-emerald-400/80 uppercase tracking-wide">
              Profile
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
