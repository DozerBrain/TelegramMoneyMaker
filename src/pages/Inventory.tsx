// src/pages/Inventory.tsx
import React, { useState } from "react";

type Props = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

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
  const [tab, setTab] = useState<"cards" | "suits" | "pets" | null>(null);

  return (
    <div className="w-full h-full flex flex-col items-center pt-3 pb-24 px-4 text-white">
      {/* 🔹 Selector row: Cards / Suits / Pets */}
      <div className="flex gap-3">
        <button
          className={`px-5 py-2 rounded-xl text-sm font-semibold ${
            tab === "cards"
              ? "bg-emerald-600"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          onClick={() => setTab("cards")}
        >
          Cards
        </button>

        <button
          className={`px-5 py-2 rounded-xl text-sm font-semibold ${
            tab === "suits"
              ? "bg-emerald-600"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          onClick={() => setTab("suits")}
        >
          Suits
        </button>

        <button
          className={`px-5 py-2 rounded-xl text-sm font-semibold ${
            tab === "pets"
              ? "bg-emerald-600"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
          onClick={() => setTab("pets")}
        >
          Pets
        </button>
      </div>

      {/* 🔹 Tab content (placeholder for now) */}
      {tab === "cards" && (
        <div className="mt-4 w-full max-w-md text-sm text-white/80">
          <p className="text-center text-white/70">
            Card collection & chests will appear here.
          </p>
        </div>
      )}

      {tab === "suits" && (
        <div className="mt-4 w-full max-w-md text-sm text-white/80">
          <p className="text-center text-white/70">
            Suit bonuses & previews will appear here.
          </p>
        </div>
      )}

      {tab === "pets" && (
        <div className="mt-4 w-full max-w-md text-sm text-white/80">
          <p className="text-center text-white/70">
            Pets, elements & passive bonuses will appear here.
          </p>
        </div>
      )}

      {/* 🔹 Stats summary */}
      <div className="mt-6 w-full max-w-md space-y-2 text-sm text-white/80">
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
