// src/pages/Leaderboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { topGlobal, type LeaderRow } from "../lib/leaderboard";
import { getProfile } from "../lib/profile";
import {
  COUNTRIES,
  REGIONS,
  type Country,
  type RegionId,
} from "../data/countries";
import { formatMoneyShort } from "../lib/format";

type Mode = "global" | "friends";

type CountryCode = string;

// ---- Helpers based on countries.ts -----------------------------------------

function buildRegionLabelMap() {
  const map: Record<RegionId, string> = {} as Record<RegionId, string>;
  for (const r of REGIONS) {
    map[r.id] = r.label;
  }
  return map;
}

const REGION_LABELS: Record<RegionId, string> = buildRegionLabelMap();

function findCountry(code: string): Country | undefined {
  const cc = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === cc);
}

function codeToFlag(code: string): string {
  return findCountry(code)?.flag ?? "🏳️";
}

function countryNameFromCode(code: string): string {
  const c = findCountry(code);
  return c ? c.name : code.toUpperCase();
}

function regionOfCountry(code: string): RegionId {
  const c = findCountry(code);
  // fallback: if unknown, put them in "NA" just so it works
  return (c?.region ?? "NA") as RegionId;
}

// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  const [mode, setMode] = useState<Mode>("global");

  const [allRows, setAllRows] = useState<LeaderRow[]>([]);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [myId, setMyId] = useState<string>("");
  const [myCountry, setMyCountry] = useState<CountryCode>("US");
  const [myRegion, setMyRegion] = useState<RegionId>("NA");

  const [selectedRegion, setSelectedRegion] = useState<RegionId>("NA");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "ALL">(
    "ALL"
  );

  // popup states
  const [showModePicker, setShowModePicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // --- Load profile once ----------------------------------------------------
  useEffect(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = regionOfCountry(cc);

    setMyId(String(p.uid || p.userId || "local"));
    setMyCountry(cc);
    setMyRegion(region);

    setSelectedRegion(region);
    setSelectedCountry("ALL");
  }, []);

  // --- Load global leaderboard (big list), then filter in memory ------------
  async function refreshGlobal() {
    if (!myId) return; // wait for profile
    setLoading(true);
    try {
      const data = await topGlobal(500); // big enough so you + gf always inside
      setAllRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!myId) return;
    refreshGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // --- Compute filtered rows whenever filters or data change ----------------
  useEffect(() => {
    let list = [...allRows];

    // Friends = same country as you (for now)
    if (mode === "friends") {
      const cc = myCountry.toUpperCase();
      list = list.filter(
        (r) => (r.country || "").toUpperCase() === cc
      );
    }

    // Region filter (always active)
    if (selectedRegion) {
      list = list.filter((r) => {
        const rowRegion =
          (r.region as RegionId | undefined) ?? regionOfCountry(r.country);
        return rowRegion === selectedRegion;
      });
    }

    // Country filter (optional)
    if (selectedCountry !== "ALL") {
      const cc = selectedCountry.toUpperCase();
      list = list.filter(
        (r) => (r.country || "").toUpperCase() === cc
      );
    }

    list.sort((a, b) => b.score - a.score);
    setRows(list);
  }, [allRows, mode, selectedRegion, selectedCountry, myCountry]);

  const myRankIndex = rows.findIndex(
    (r) => String(r.uid) === String(myId)
  );
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : undefined;

  const modeLabel = mode === "global" ? "Global" : "Friends";
  const regionLabel = REGION_LABELS[selectedRegion] || "Region";

  const countryLabel =
    selectedCountry === "ALL"
      ? "All countries"
      : countryNameFromCode(selectedCountry);

  const scopeLabel = `${modeLabel} · ${regionLabel}${
    selectedCountry === "ALL" ? "" : ` · ${countryLabel}`
  } leaderboard`;

  const countriesInSelectedRegion = useMemo(
    () => COUNTRIES.filter((c) => c.region === selectedRegion),
    [selectedRegion]
  );

  // --- UI helpers for popup sheets -----------------------------------------
  function ModePicker() {
    if (!showModePicker) return null;
    return (
      <div
        className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
        onClick={() => setShowModePicker(false)}
      >
        <div
          className="mb-20 w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-3 space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-white/50 px-1 pb-1">
            Choose what you want to see
          </div>
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
              mode === "global"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-white/80"
            }`}
            onClick={() => {
              setMode("global");
              setShowModePicker(false);
            }}
          >
            <span className="flex items-center gap-2">
              <span>🌍</span>
              <span>Global</span>
            </span>
            <span className="text-[10px] text-white/60">
              Everyone worldwide
            </span>
          </button>

          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
              mode === "friends"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-white/80"
            }`}
            onClick={() => {
              setMode("friends");
              setShowModePicker(false);
            }}
          >
            <span className="flex items-center gap-2">
              <span>👥</span>
              <span>Friends</span>
            </span>
            <span className="text-[10px] text-white/60">
              Players from your country
            </span>
          </button>
        </div>
      </div>
    );
  }

  function RegionPicker() {
    if (!showRegionPicker) return null;
    return (
      <div
        className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
        onClick={() => setShowRegionPicker(false)}
      >
        <div
          className="mb-20 w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-3 space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-white/50 px-1 pb-1">
            Choose a region
          </div>
          {REGIONS.map((r) => {
            const active = r.id === selectedRegion;
            return (
              <button
                key={r.id}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-white/80"
                }`}
                onClick={() => {
                  setSelectedRegion(r.id);
                  // when region changes, reset country filter
                  setSelectedCountry("ALL");
                  setShowRegionPicker(false);
                }}
              >
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function CountryPicker() {
    if (!showCountryPicker) return null;
    return (
      <div
        className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
        onClick={() => setShowCountryPicker(false)}
      >
        <div
          className="mb-20 w-full max-w-md max-h-[60vh] rounded-2xl bg-zinc-900 border border-white/10 p-3 space-y-1 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs text-white/50 px-1 pb-1">
            Countries in {regionLabel}
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                selectedCountry === "ALL"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-white/80"
              }`}
              onClick={() => {
                setSelectedCountry("ALL");
                setShowCountryPicker(false);
              }}
            >
              <span className="flex items-center gap-2">
                <span>🌐</span>
                <span>All countries</span>
              </span>
            </button>

            {countriesInSelectedRegion.map((c) => {
              const active = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-white/80"
                  }`}
                  onClick={() => {
                    setSelectedCountry(c.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] text-white/60">
                    {c.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------

  return (
    <div className="p-4 pb-6 text-white">
      {/* top selectors */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-2 overflow-x-auto">
          {/* Mode: Global / Friends */}
          <button
            onClick={() => setShowModePicker(true)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 bg-zinc-900/80 border border-white/10"
          >
            <span>{mode === "global" ? "🌍" : "👥"}</span>
            <span>{modeLabel}</span>
          </button>

          {/* Region */}
          <button
            onClick={() => setShowRegionPicker(true)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 bg-zinc-900/80 border border-white/10"
          >
            <span>🌎</span>
            <span className="truncate max-w-[110px] sm:max-w-[140px]">
              {regionLabel}
            </span>
          </button>

          {/* Country */}
          <button
            onClick={() => setShowCountryPicker(true)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 bg-zinc-900/80 border border-white/10"
          >
            <span>
              {selectedCountry === "ALL"
                ? "🌐"
                : codeToFlag(selectedCountry)}
            </span>
            <span className="truncate max-w-[90px] sm:max-w-[120px]">
              {selectedCountry === "ALL"
                ? "All"
                : selectedCountry.toUpperCase()}
            </span>
          </button>
        </div>

        <button
          onClick={refreshGlobal}
          className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-white/10 text-xs"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

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
                <span>{row.country.toUpperCase()}</span>
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

      {/* Popups */}
      <ModePicker />
      <RegionPicker />
      <CountryPicker />
    </div>
  );
}
