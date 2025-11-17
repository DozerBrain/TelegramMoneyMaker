// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { topGlobal, topByCountry, type LeaderRow } from "../lib/leaderboard";
import { getProfile } from "../lib/profile";
import { formatMoneyShort } from "../lib/format";

type Scope = "global" | "country";

// 🔹 Use the same AA / AB / AC formatter as the rest of the game
function shortScore(raw: number | string): string {
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (!Number.isFinite(n)) return "0";
  return formatMoneyShort(n);
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string>("");
  const [myCountry, setMyCountry] = useState<string>("US");

  // Load my profile (id + country) once
  useEffect(() => {
    const p = getProfile();
    setMyId(String(p.uid || p.userId || "local"));
    setMyCountry((p.country || "US").toUpperCase());
  }, []);

  async function loadLeaderboard(scopeToLoad: Scope, country?: string) {
    setLoading(true);
    try {
      let data: LeaderRow[] = [];
      if (scopeToLoad === "global") {
        data = await topGlobal(50);
      } else {
        const c = (country || myCountry || "US").toUpperCase();
        data = await topByCountry(c, 50);
      }
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  // Load whenever scope / myCountry changes
  useEffect(() => {
    if (!myId) return; // wait until profile loaded
    loadLeaderboard(scope, myCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, myCountry, myId]);

  const myRankIndex = rows.findIndex(
    (r) => String(r.uid) === String(myId)
  );
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : undefined;

  return (
    <div className="p-4 text-white">
      {/* Scope buttons + refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
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
          <button
            onClick={() => setScope("country")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              scope === "country"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            🇺🇸 {myCountry}
          </button>
        </div>

        <button
          onClick={() => loadLeaderboard(scope, myCountry)}
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
                {shortScore(row.score)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-white/50">
        Scope: {scope === "global" ? "Global leaderboard" : `${myCountry} leaderboard`}
        {myRank && rows.length > 0 && (
          <span className="block mt-1">
            You are currently ranked #{myRank} in this view.
          </span>
        )}
      </div>
    </div>
  );
}
