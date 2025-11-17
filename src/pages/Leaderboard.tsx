// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import {
  topGlobal,
  topByCountry,
  topByRegion,
  type LeaderRow,
} from "../lib/leaderboard";
import { getProfile } from "../lib/profile";
import {
  getRegionForCountry,
  REGION_LABELS,
  type RegionId,
} from "../data/regions";
import {
  POPULAR_COUNTRIES,
  codeToFlag,
  countryNameFromCode,
} from "../data/countries";
import { formatMoneyShort } from "../lib/format";

type Scope = "global" | "country" | "region";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [myId, setMyId] = useState<string>("");
  const [myCountry, setMyCountry] = useState<string>("US");
  const [myRegion, setMyRegion] = useState<RegionId>("Unknown");

  // The country currently being viewed in "country" scope
  const [selectedCountry, setSelectedCountry] = useState<string>("US");

  // Load my profile (id + country + region) once
  useEffect(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = getRegionForCountry(cc);

    setMyId(String(p.uid || p.userId || "local"));
    setMyCountry(cc);
    setSelectedCountry(cc);
    setMyRegion(region);
  }, []);

  async function loadLeaderboard(scopeToLoad: Scope) {
    if (!myId) return; // wait until profile loaded

    setLoading(true);
    try {
      let data: LeaderRow[] = [];

      if (scopeToLoad === "global") {
        data = await topGlobal(50);
      } else if (scopeToLoad === "country") {
        data = await topByCountry(selectedCountry, 50);
      } else {
        data = await topByRegion(myRegion, 50);
      }

      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  // Load whenever scope / selectedCountry / myRegion changes
  useEffect(() => {
    if (!myId) return;
    loadLeaderboard(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, myId, selectedCountry, myRegion]);

  const myRankIndex = rows.findIndex(
    (r) => String(r.uid) === String(myId)
  );
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : undefined;

  const scopeLabel =
    scope === "global"
      ? "Global leaderboard"
      : scope === "country"
      ? `${countryNameFromCode(selectedCountry)} leaderboard`
      : `${REGION_LABELS[myRegion]} leaderboard`;

  return (
    <div className="p-4 text-white">
      {/* Scope buttons + refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {/* Global */}
          <button
            onClick={() => setScope("global")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${
              scope === "global"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            🌍 <span>Global</span>
          </button>

          {/* Country (view any country) */}
          <button
            onClick={() => setScope("country")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${
              scope === "country"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            <span>{codeToFlag(selectedCountry)}</span>
            <span>{selectedCountry}</span>
          </button>

          {/* Region (your region) */}
          <button
            onClick={() => setScope("region")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 ${
              scope === "region"
                ? "bg-emerald-600"
                : "bg-zinc-900/80 border border-white/10"
            }`}
          >
            🌎
            <span className="truncate max-w-[120px]">
              {REGION_LABELS[myRegion]}
            </span>
          </button>
        </div>

        <button
          onClick={() => loadLeaderboard(scope)}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-xs"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Country picker chips – only visible in "country" scope */}
      {scope === "country" && (
        <div className="mt-2 mb-3 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
          {POPULAR_COUNTRIES.map((c) => {
            const isActive = c.code === selectedCountry;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`px-3 py-1 rounded-2xl text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600"
                    : "bg-zinc-900/80 border border-white/10"
                }`}
              >
                <span>{codeToFlag(c.code)}</span>
                <span>{c.code}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[40px_1.5fr_1.1fr_1fr] px-4 py-2 text-xs text-white/50 border-b border-white/5">
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
              className={`grid grid-cols-[40px_1.5fr_1.1fr_1fr] px-4 py-2 text-sm ${
                String(row.uid) === String(myId)
                  ? "bg-emerald-500/10"
                  : "bg-transparent"
              }`}
            >
              <div className="text-white/60">{idx + 1}</div>

              <div className="truncate">{row.name}</div>

              <div className="text-white/70 flex items-center gap-1">
                <span>{codeToFlag(row.country)}</span>
                <span>{row.country}</span>
              </div>

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
          <span className="ml-2">
            • You are currently ranked #{myRank} in this view.
          </span>
        )}
      </div>
    </div>
  );
}
