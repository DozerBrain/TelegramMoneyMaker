// src/pages/More.tsx
import React, { useState } from "react";
import { formatMoneyShort } from "../lib/format";

type AchState = Record<string, { done: boolean; claimed: boolean }>;

type Props = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;
  achievementsState: AchState;
  onClaim: (id: string, reward: number) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (raw: string) => void;
};

export default function More({
  balance,
  totalEarnings,
  taps,
  tapValue,
  autoPerSec,
  multi,
  achievementsState,
  onClaim,
  onReset,
  onExport,
  onImport,
}: Props) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  function niceId(id: string) {
    return id
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function claim(id: string) {
    const reward = 100;
    onClaim(id, reward);
  }

  function handleImport() {
    setImportError("");
    if (!importText.trim()) return;
    try {
      JSON.parse(importText);
      onImport(importText.trim());
      setImportText("");
    } catch {
      setImportError("Invalid JSON. Paste your exact save string.");
    }
  }

  return (
    <div className="p-4 space-y-6 text-white">
      {/* Stats */}
      <section className="space-y-1">
        <h2 className="text-lg font-bold">Your Stats</h2>
        <div className="text-sm opacity-80">
          Balance:{" "}
          <b className="text-emerald-300">
            ${formatMoneyShort(balance)}
          </b>
        </div>
        <div className="text-sm opacity-80">
          Total Earned:{" "}
          <b className="text-emerald-300">
            ${formatMoneyShort(totalEarnings)}
          </b>
        </div>
        <div className="text-sm opacity-80">
          Taps: <b>{formatMoneyShort(taps)}</b>
        </div>
        <div className="text-sm opacity-80">
          Tap Value: <b>{formatMoneyShort(tapValue)}</b> • Multiplier:{" "}
          <b>{multi}x</b>
        </div>
        <div className="text-sm opacity-80">
          Auto/sec: <b>{formatMoneyShort(autoPerSec)}</b>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold">Achievements</h2>
        {Object.keys(achievementsState).length === 0 ? (
          <div className="text-sm opacity-70">
            No achievements yet — keep tapping! 💪
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(achievementsState).map(([id, st]) => (
              <div
                key={id}
                className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
              >
                <div className="text-sm">
                  <div className="font-semibold">{niceId(id)}</div>
                  <div className="opacity-70">
                    {st.done ? "Completed" : "In progress"}
                  </div>
                </div>
                <button
                  disabled={!st.done || st.claimed}
                  onClick={() => claim(id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition
                    ${
                      st.done && !st.claimed
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-white/10 opacity-60"
                    }`}
                >
                  {st.claimed ? "Claimed" : "Claim +100"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save & Import/Export */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Save Management</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExport}
            className="rounded-xl py-3 bg-white/10 hover:bg-white/20 font-semibold"
          >
            📤 Export Save
          </button>
          <button
            onClick={onReset}
            className="rounded-xl py-3 bg-white/10 hover:bg-white/20 font-semibold"
          >
            ♻️ Reset Progress
          </button>
        </div>

        <div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your save JSON here"
            className="w-full h-28 rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleImport}
              className="rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold"
            >
              Import
            </button>
            {importError && (
              <div className="text-sm text-red-400">{importError}</div>
            )}
          </div>
          <div className="text-xs opacity-60 mt-1">
            Tip: Export on one device and paste here to continue on another.
          </div>
        </div>
      </section>
    </div>
  );
}
