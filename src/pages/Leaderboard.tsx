// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { getTopPlayers, PlayerData } from "../lib/leaderboard";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const top = await getTopPlayers(30);
      setPlayers(top);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">🏆 Global Leaderboard</h1>
      {loading && <p className="text-center text-gray-400">Loading...</p>}
      {!loading && players.length === 0 && (
        <p className="text-center text-gray-400">No players yet. Be the first to tap!</p>
      )}
      <ul className="space-y-2">
        {players.map((p, i) => (
          <li
            key={i}
            className="flex justify-between bg-emerald-900/40 px-4 py-2 rounded-xl border border-emerald-600/30"
          >
            <span>
              #{i + 1} <b>{p.username || "Unknown"}</b> 🌍 {p.country || "?"}
            </span>
            <span className="font-bold text-emerald-300">{p.score.toLocaleString()} 💵</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
