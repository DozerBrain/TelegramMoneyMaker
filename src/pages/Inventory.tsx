// src/pages/Inventory.tsx
import React from "react";
import LeftQuickNav from "../components/LeftQuickNav";

export default function InventoryPage() {
  return (
    <div className="w-full h-full flex flex-col items-center pt-2 pb-24">
      {/* Top row: Cards / Suits / Pets */}
      <LeftQuickNav variant="inventory" />

      {/* You can add more inventory content below later:
          card summary, suit bonuses, pet bonuses, etc. */}
      <div className="mt-4 px-4 w-full max-w-md text-center text-sm text-white/70">
        <p>
          Manage your <span className="text-emerald-400 font-semibold">Cards</span>,{" "}
          <span className="text-emerald-400 font-semibold">Suits</span> and{" "}
          <span className="text-emerald-400 font-semibold">Pets</span>. Tap a
          icon above to open its page.
        </p>
      </div>
    </div>
  );
}
