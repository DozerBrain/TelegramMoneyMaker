// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { topGlobal, topByCountry, type LeaderRow } from "../lib/leaderboard";
import { getProfile } from "../lib/profile";

type Scope = "global" | "country";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(() => getProfile()); // keep profile in state

  async function load() {
    setLoading(true);
    try {
      // always refetch latest profile (Telegram may have just updated it)
      const currentProfile = getProfile();
      setMe(currentProfile);

      const data =
        scope === "global"
          ? await topGlobal(100)
          : await topByCountry(currentProfile.country || "US", 100);

      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]); // reload when switching Global / Country

  return (
    <div className="p-4 text-white">
      {/* Scope buttons + Refresh */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${
              scope === "global"
                ? "bg-emerald-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setScope("global")}
          >
            🌍 Global
          </button>
          <button
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${
              scope === "country"
                ? "bg-emerald-600"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setScope("country")}
          >
            🇺🇸 {me.country || "US"}
          </button>
        </div>

        <button
          onClick={load}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-3 py-2">#</th>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-left px-3 py-2">Country</th>
              <th className="text-right px-3 py-2">Score</th>
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
                  No players yet. Be the first to tap!
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const isMe = r.uid === me.uid;
                return (
                  <tr
                    key={r.uid}
                    className={isMe ? "bg-emerald-900/30" : "odd:bg-white/5"}
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

      {/* Your ID */}
      <div className="mt-3 text-xs text-white/60">
        Your ID: <span className="font-mono">{me.uid}</span>
      </div>
    </div>
  );
}
