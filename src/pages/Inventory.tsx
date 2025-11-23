// src/pages/Inventory.tsx
import React, { useState } from "react";
import LeftQuickNav from "../components/LeftQuickNav";

type Props = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

  // still passed from App but not used here now (keep for future Achievements if needed)
  achievementsState: Record<string, { done: boolean; claimed: boolean }>;
  onClaim: (id: string, reward: number) => void;

  onReset: () => void;
  onExport: () => void;
  onImport: (raw: string) => void;
};

export default function InventoryPage({
  balance,
  totalEarnings,
  taps,
  tapValue,
  autoPerSec,
  multi,
  onReset,
  onExport,
  onImport,
}: Props) {
  const [importText, setImportText] = useState("");

  return (
    <div className="w-full h-full flex flex-col items-center pt-3 pb-24 px-4 text-white">
      {/* 🔹 Inventory header row: Cards / Suits / Pets */}
      <LeftQuickNav />

      {/* 🔹 Summary cards */}
      <div className="mt-4 w-full max-w-md space-y-2 text-sm text-white/80">
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Balance</span>
          <span>${balance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Total earned</span>
          <span>${totalEarnings.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Total taps</span>
          <span>{taps.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Tap value</span>
          <span>${tapValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Auto per second</span>
          <span>${autoPerSec.toLocaleString()}</span>
        </div>
        <div className="flex justify-between bg-zinc-900/70 rounded-xl px-3 py-2">
          <span className="text-white/60">Multiplier</span>
          <span>x{multi.toFixed(2)}</span>
        </div>
      </div>

      {/* 🔹 Save tools */}
      <div className="mt-5 w-full max-w-md">
        <div className="flex gap-3 mb-3">
          <button
            onClick={onExport}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold py-2.5"
          >
            Export save
          </button>
          <button
            onClick={onReset}
            className="flex-1 rounded-xl bg-red-600/80 hover:bg-red-500 text-sm font-semibold py-2.5"
          >
            Reset progress
          </button>
        </div>

        <div className="text-xs text-white/60 mb-1">
          Import save (paste JSON and tap Import):
        </div>
        <textarea
          className="w-full h-24 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-xs outline-none focus:border-emerald-500"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="{ ... }"
        />
        <button
          onClick={() => {
            if (!importText.trim()) return;
            onImport(importText);
          }}
          className="mt-2 w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold py-2.5"
        >
          Import save
        </button>
      </div>
    </div>
  );
}
