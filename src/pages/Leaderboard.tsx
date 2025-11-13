// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { fetchTopGlobal, fetchTopCountry, fetchTopRegion, LBUser } from "../lib/leaderboard";
import { getScore } from "../lib/storage";

type Scope = "global" | "country" | "region";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [country, setCountry] = useState("US");
  const [region, setRegion] = useState("");
  const [rows, setRows] = useState<LBUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      if (scope === "global") setRows(await fetchTopGlobal(100));
      else if (scope === "country") setRows(await fetchTopCountry(country, 100));
      else setRows(await fetchTopRegion(country, region || "CA", 100));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [scope]);
  useEffect(() => { if (scope !== "global") load(); /* eslint-disable-next-line */ }, [country, region]);

  return (
    <div className="p-4 pb-24 text-white">
      <h1 className="text-xl font-bold mb-4 text-emerald-400">🏆 Leaderboard</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as Scope)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2"
        >
          <option value="global">🌍 Global</option>
          <option value="country">🇺🇸 Country</option>
          <option value="region">🏳️ Region</option>
        </select>

        {scope !== "global" && (
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            placeholder="US"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 w-20 uppercase"
          />
        )}

        {scope === "region" && (
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value.toUpperCase())}
            placeholder="CA"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 w-20 uppercase"
          />
        )}

        <button
          onClick={load}
          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
        >
          Refresh
        </button>
      </div>

      {/* Your score */}
      <div className="text-sm text-zinc-300 mb-3">
        Your current score: <span className="text-emerald-400 font-semibold">{getScore()}</span>
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
              <tr><td colSpan={4} className="px-3 py-6 text-center text-zinc-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-zinc-400">No data yet.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.userId} className="odd:bg-white/[0.02]">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.username || "Anonymous"}</td>
                  <td className="px-3 py-2">{r.country}{r.region ? `-${r.region}` : ""}</td>
                  <td className="px-3 py-2 text-right">{r.score.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
