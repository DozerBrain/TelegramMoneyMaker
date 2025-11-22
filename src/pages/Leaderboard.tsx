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
type RegionFilter = RegionId | "ALL";

// ---------- Helpers from countries.ts ----------

function buildRegionLabelMap() {
  const map: Record<RegionId, string> = {} as Record<RegionId, string>;
  for (const r of REGIONS) map[r.id] = r.label;
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
  return (c?.region ?? "NA") as RegionId;
}

// -----------------------------------------------

export default function LeaderboardPage() {
  const [mode, setMode] = useState<Mode>("global");

  const [allRows, setAllRows] = useState<LeaderRow[]>([]);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [myId, setMyId] = useState<string>("");
  const [myCountry, setMyCountry] = useState<CountryCode>("US");
  const [myRegion, setMyRegion] = useState<RegionId>("NA");

  // ⭐ NEW: region filter can be "ALL"
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>("ALL");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "ALL">("ALL");

  // popup states
  const [showModePicker, setShowModePicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // --- Load my profile once -----------------------------------------------
  useEffect(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = regionOfCountry(cc);

    setMyId(String(p.uid || p.userId || "local"));
    setMyCountry(cc);
    setMyRegion(region);

    // ⭐ DEFAULT = SEE EVERYONE IN GLOBAL
    setSelectedRegion("ALL");
    setSelectedCountry("ALL");
  }, []);

  // --- Load big global list -----------------------------------------------
  async function refreshGlobal() {
    if (!myId) return;
    setLoading(true);
    try {
      const data = await topGlobal(5000);
      data.sort((a, b) => b.score - a.score);
      setAllRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!myId) return;
    refreshGlobal();
  }, [myId]);

  // --- Compute filtered rows ----------------------------------------------
  useEffect(() => {
    if (!myId) return;

    let list = [...allRows];

    // Mode: friends = same country
    if (mode === "friends") {
      const cc = myCountry.toUpperCase();
      list = list.filter((r) => (r.country || "").toUpperCase() === cc);
    }

    // ⭐ Apply region filter ONLY if not ALL
    if (selectedRegion !== "ALL") {
      list = list.filter((r) => {
        const rowRegion =
          (r.region as RegionId | undefined) ?? regionOfCountry(r.country);
        return rowRegion === selectedRegion;
      });
    }

    // Country filter
    if (selectedCountry !== "ALL") {
      const cc = selectedCountry.toUpperCase();
      list = list.filter((r) => (r.country || "").toUpperCase() === cc);
    }

    // sort by score
    list.sort((a, b) => b.score - a.score);

    // ⭐ Always keep YOU in the list
    const meGlobal = allRows.find((r) => String(r.uid) === String(myId));
    if (meGlobal && !list.some((r) => String(r.uid) === String(myId))) {
      list.unshift(meGlobal);
    }

    setRows(list);
  }, [allRows, mode, selectedRegion, selectedCountry, myCountry, myId]);

  // --- ranking ----------------------------------------------
  const myRankIndex = rows.findIndex((r) => String(r.uid) === String(myId));
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : undefined;

  const modeLabel = mode === "global" ? "Global" : "Friends";

  const regionLabel =
    selectedRegion === "ALL"
      ? "All regions"
      : REGION_LABELS[selectedRegion];

  const countryLabel =
    selectedCountry === "ALL"
      ? "All countries"
      : countryNameFromCode(selectedCountry);

  const scopeLabel = `${modeLabel} · ${regionLabel}${
    selectedCountry === "ALL" ? "" : ` · ${countryLabel}`
  } leaderboard`;

  // For country picker
  const countriesInSelectedRegion = useMemo(() => {
    return selectedRegion === "ALL"
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

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
            {loading ? "Loading leaderboard..." : "No players yet."}
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={row.uid}
              className={`grid grid-cols-[40px_1.5fr_1.1fr_1fr] px-4 py-2 text-sm ${
                String(row.uid) === String(myId)
                  ? "bg-emerald-500/10"
                  : ""
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
            • You are currently ranked #{myRank}
          </span>
        )}
      </div>

      {/* Popups */}
      {showModePicker && (
        <ModePickerPopup
          mode={mode}
          onClose={() => setShowModePicker(false)}
          setMode={setMode}
        />
      )}

      {showRegionPicker && (
        <RegionPickerPopup
          selectedRegion={selectedRegion}
          onClose={() => setShowRegionPicker(false)}
          setSelectedRegion={setSelectedRegion}
          setSelectedCountry={setSelectedCountry}
        />
      )}

      {showCountryPicker && (
        <CountryPickerPopup
          selectedCountry={selectedCountry}
          countries={countriesInSelectedRegion}
          regionLabel={regionLabel}
          onClose={() => setShowCountryPicker(false)}
          setSelectedCountry={setSelectedCountry}
        />
      )}
    </div>
  );
}

// Individual popup components

function ModePickerPopup({ mode, onClose, setMode }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
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
            onClose();
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
            onClose();
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

function RegionPickerPopup({
  selectedRegion,
  onClose,
  setSelectedRegion,
  setSelectedCountry,
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="mb-20 w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-3 space-y-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-white/50 px-1 pb-1">
          Choose a region
        </div>

        {/* ALL REGIONS */}
        <button
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
            selectedRegion === "ALL"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-800 text-white/80"
          }`}
          onClick={() => {
            setSelectedRegion("ALL");
            setSelectedCountry("ALL");
            onClose();
          }}
        >
          <span>All regions</span>
        </button>

        {/* List real regions */}
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
                setSelectedCountry("ALL");
                onClose();
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

function CountryPickerPopup({
  selectedCountry,
  countries,
  regionLabel,
  onClose,
  setSelectedCountry,
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="mb-20 w-full max-w-md max-h-[60vh] rounded-2xl bg-zinc-900 border border-white/10 p-3 space-y-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-white/50 px-1 pb-1">
          Countries in {regionLabel}
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
          {/* ALL countries */}
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
              selectedCountry === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-white/80"
            }`}
            onClick={() => {
              setSelectedCountry("ALL");
              onClose();
            }}
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              <span>All countries</span>
            </span>
          </button>

          {countries.map((c) => {
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
                  onClose();
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </span>
                <span className="text-[10px] text-white/60">{c.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
