// src/pages/Cards.tsx
import React from "react";
import CardFrame from "../components/CardFrame";

export default function CardsPage() {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-semibold text-emerald-200 mb-2">Cards</h1>

      {/* Example card tiles (content placeholders) */}
      <CardFrame title="Starter">
        <div className="h-24 rounded-xl bg-zinc-800/60" />
      </CardFrame>

      <CardFrame title="Boost">
        <div className="h-24 rounded-xl bg-zinc-800/60" />
      </CardFrame>
    </div>
  );
}
