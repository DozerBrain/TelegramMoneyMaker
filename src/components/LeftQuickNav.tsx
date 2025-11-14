import React from "react";
import type { Tab } from "../types";

export default function LeftQuickNav({ onOpen }: { onOpen: (t: Tab) => void }) {
  return (
    <div className="absolute left-4 top-28 flex flex-col gap-3 z-10">
      <button
        onClick={() => onOpen("cards")}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-700/40 text-emerald-200 shadow active:scale-[0.98]"
      >
        <span>🎴</span> <span className="font-medium">Cards</span>
      </button>

      <button
        onClick={() => onOpen("suits")}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-900/20 border border-sky-700/40 text-sky-200 shadow active:scale-[0.98]"
      >
        <span>🧥</span> <span className="font-medium">Suits</span>
      </button>

      <button
        onClick={() => onOpen("pets")}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-teal-900/20 border border-teal-700/40 text-teal-200 shadow active:scale-[0.98]"
      >
        <span>🐉</span> <span className="font-medium">Pets</span>
      </button>
    </div>
  );
}
