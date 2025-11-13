import React, { useEffect, useState } from "react";
import { topGlobal, topByCountry } from "../lib/leaderboard";
import { getProfile } from "../lib/profile";

type Tab = "global" | "country";

export default function LeaderboardPage() {
  const me = getProfile();
  const [tab, setTab] = useState<Tab>("global");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = tab === "global" ? await topGlobal(100) : await topByCountry(me.country, 100);
    setRows(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-2 rounded-xl ${tab==='global'?'bg-emerald-600 text-white':'bg-slate-800'}`}
          onClick={()=>setTab("global")}
        >Global</button>
        <button
          className={`px-3 py-2 rounded-xl ${tab==='country'?'bg-emerald-600 text-white':'bg-slate-800'}`}
          onClick={()=>setTab("country")}
        >{me.country}</button>
      </div>

      {loading ? (
        <div className="opacity-70 text-sm">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="opacity-70 text-sm">No scores yet.</div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => {
            const isMe = r.uid === me.uid;
            return (
              <li
                key={r.uid}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${isMe ? "bg-emerald-900/40" : "bg-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right">{i+1}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-700 grid place-items-center text-xs">
                    {r.country || "??"}
                  </div>
                  <div className="font-semibold">{r.name}</div>
                </div>
                <div className="font-mono">{r.score.toLocaleString()}</div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 text-xs opacity-60">
        Your ID: <span className="font-mono">{me.uid}</span>
      </div>
    </div>
  );
}
