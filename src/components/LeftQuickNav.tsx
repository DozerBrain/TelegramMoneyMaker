// src/components/LeftQuickNav.tsx
import React from "react";
import type { Tab } from "../types";

function go(to: Tab) {
  window.dispatchEvent(
    new CustomEvent("MM_GOTO", { detail: { goto: to } })
  );
}

export default function LeftQuickNav() {
  return (
    <div className="absolute left-4 top-28 z-50 flex flex-col gap-4">
      <button
        onClick={() => go("cards")}
        className="px-4 py-2 rounded-2xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-200 shadow"
      >
        🧩 Cards
      </button>
      <button
        onClick={() => go("suits")}
        className="px-4 py-2 rounded-2xl bg-sky-900/30 border border-sky-500/40 text-sky-200 shadow"
      >
        🧥 Suits
      </button>
      <button
        onClick={() => go("pets")}
        className="px-4 py-2 rounded-2xl bg-amber-900/30 border border-amber-500/40 text-amber-200 shadow"
      >
        🐾 Pets
      </button>
    </div>
  );
}
