// src/pages/Inventory.tsx
import React, { useState } from "react";
import CardCollection from "../components/cards/CardCollection";
import SuitsPage from "../components/suits/Suits"; 
import PetsPage from "../components/pets/Pets";

export default function InventoryPage() {
  const [tab, setTab] = useState<"cards" | "suits" | "pets">("cards");

  return (
    <div className="w-full h-full flex flex-col items-center pt-2 pb-24">

      {/* TAB SWITCH */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          onClick={() => setTab("cards")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            tab === "cards"
              ? "bg-emerald-500 text-black"
              : "bg-white/10 text-white/70"
          }`}
        >
          Cards
        </button>

        <button
          onClick={() => setTab("suits")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            tab === "suits"
              ? "bg-emerald-500 text-black"
              : "bg-white/10 text-white/70"
          }`}
        >
          Suits
        </button>

        <button
          onClick={() => setTab("pets")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            tab === "pets"
              ? "bg-emerald-500 text-black"
              : "bg-white/10 text-white/70"
          }`}
        >
          Pets
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="mt-4 w-full max-w-md px-3">
        {tab === "cards" && <CardCollection />}
        {tab === "suits" && <SuitsPage />}
        {tab === "pets" && <PetsPage />}
      </div>
    </div>
  );
}
