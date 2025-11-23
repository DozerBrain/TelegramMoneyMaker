// src/pages/Inventory.tsx
import React, { useState } from "react";
import CardCollection from "../components/cards/CardCollection";
import Suits from "../components/suits/Suits";
import Pets from "../components/pets/Pets";

export default function InventoryPage() {
  const [tab, setTab] = useState<"cards" | "suits" | "pets">("cards");

  return (
    <div className="w-full h-full flex flex-col items-center pt-6 pb-24 px-4">

      {/* Header Tabs */}
      <div className="w-full max-w-md flex items-center justify-between gap-2">
        {[
          { id: "cards", label: "Cards" },
          { id: "suits", label: "Suits" },
          { id: "pets", label: "Pets" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`
              flex-1 py-3 rounded-xl border text-center font-semibold
              ${
                tab === t.id
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-black/20 text-white/60"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Under Tabs */}
      <div className="w-full max-w-md mt-4">
        {tab === "cards" && <CardCollection />}
        {tab === "suits" && <Suits />}
        {tab === "pets" && <Pets />}
      </div>

    </div>
  );
}
