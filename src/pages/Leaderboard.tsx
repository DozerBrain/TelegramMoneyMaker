// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import {
  topGlobal,
  topByCountry,
  topByRegion,
  type LeaderRow,
  regionFromCountry,
  regionLabel,
  type RegionCode,
} from "../lib/leaderboard";
import { getProfile } from "../lib/profile";
import { formatMoneyShort } from "../lib/format";

type Scope = "global" | "country" | "region";

// Small helper: convert "US" -> 🇺🇸
function flagEmoji(cc: string): string {
  const code = (cc || "").toUpperCase();
  if (code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const a = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + (code.charCodeAt(0) - a),
    A + (code.charCodeAt(1) - a)
  );
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [myId, setMyId] = useState<string>("");
  const [myCountry, setMyCountry] = useState<string>("US");
  const [myRegion, setMyRegion] = useState<RegionCode>("NA");

  // Load my profile (id + country + region) once
  useEffect(() => {
    const p = getProfile();
    const uid = String(p.uid || p.userId || "local");
    const cc = (p.country || "US").toUpperCase();
    const region = regionFromCountry(cc);

    setMyId(uid);
    setMyCountry(cc);
    setMyRegion(region);
  }, []);

  async function loadLeaderboard(scopeToLoad: Scope) {
    setLoading(true);
    try {
      let data: LeaderRow[] = [];

      if (scopeToLoad === "global") {
        data = await topGlobal(50);
      } else if (scopeToLoad === "country") {
        const c = (myCountry || "US").toUpperCase();
        data = await topByCountry(c, 50);
      } else {
        const r: RegionCode = myRegion || regionFromCountry(myCountry);
        data = await topByRegion(r, 50);
      }

      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  // Load whenever scope / myCountry / myRegion / myId changes
  useEffect(() => {
    if (!myId) return; // wait until profile loaded
    loadLeaderboard(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, myCountry, myRegion, myId]);

  const myRankIndex = rows.findIndex((r) => String(r.uid) === String(myId));
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : undefined;

  // Scope label at the bottom
  const scopeLabel =
    scope === "global"
      ? "Global leaderboard"
      : scope === "country"
      ? `Country leaderboard (${myCountry})`
      : `Region leaderboard (${regionLabel(myRegion)})`;

  return (
    <div className="p-4 text-white">
      {/* Scope buttons + refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {/* GLOBAL */}
          <button
            onClick={() => setScope("global")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              scope === "global"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            🌍 Global
          </button>

          {/* COUNTRY */}
          <button
            onClick={() => setScope("country")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              scope === "country"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            {flagEmoji(myCountry)} {myCountry}
          </button>

          {/* REGION */}
          <button
            onClick={() => setScope("region")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              scope === "region"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            🌎 {regionLabel(myRegion)}
          </button>
        </div>

        <button
          onClick={() => loadLeaderboard(scope)}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-xs"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[40px_1.5fr_1fr_1fr] px-4 py-2 text-xs text-white/50 border-b border-white/5">
          <div>#</div>
          <div>Player</div>
          <div>Country</div>
          <div className="text-right">Score</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-white/60">
            {loading
              ? "Loading leaderboard..."
              : "No players yet. Be the first to tap!"}
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={row.uid}
              className={`grid grid-cols-[40px_1.5fr_1fr_1fr] px-4 py-2 text-sm ${
                String(row.uid) === String(myId)
                  ? "bg-emerald-500/10"
                  : "bg-transparent"
              }`}
            >
              <div className="text-white/60">{idx + 1}</div>
              <div className="truncate">{row.name}</div>
              <div className="text-white/70">{row.country}</div>
              <div className="text-right font-semibold">
                {formatMoneyShort(row.score)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-white/50">
        Scope: {scopeLabel}
        {myRank && rows.length > 0 && (
          <span className="ml-2">• You are currently ranked #{myRank} in this view.</span>
        )}
      </div>
    </div>
  );
}
