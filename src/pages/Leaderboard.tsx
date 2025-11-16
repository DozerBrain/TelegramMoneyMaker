// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { topGlobal, topByCountry, type LeaderRow } from "../lib/leaderboard";
import { getProfile } from "../lib/profile";

type Scope = "global" | "country";

export default function LeaderboardPage() {
  const me = getProfile();
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data =
        scope === "global"
          ? await topGlobal(100)
          : await topByCountry(me.country || me.region || "US", 100);

      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  // Load leaderboard on scope change
  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [scope]);

  return (
    <div className="p-4 text-white space-y-4">

      {/* Header: Scope switcher */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setScope("global")}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              scope === "global"
                ? "bg-emerald-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            🌍 Global
          </button>

          <button
            onClick={() => setScope("country")}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              scope === "country"
                ? "bg-emerald-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            🇺🇸 {me.country || me.region || "US"}
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={load}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Leaderboard table */}
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Country</th>
              <th className="px-3 py-2 text-right">Score</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                  No players yet. Be the first!
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const isMe =
                  r.uid === me.uid ||
                  r.uid === me.userId ||
                  r.uid === me.username;

                return (
                  <tr
                    key={r.uid}
                    className={
                      isMe
                        ? "bg-emerald-900/30 font-semibold"
                        : "odd:bg-white/5"
                    }
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.name || "Player"}</td>
                    <td className="px-3 py-2">{r.country || "??"}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(r.score || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="text-xs text-white/60">
        Your ID: <span className="font-mono">{me.uid}</span>
      </div>
    </div>
  );
}
