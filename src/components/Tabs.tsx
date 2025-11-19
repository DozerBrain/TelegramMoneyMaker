// src/components/Tabs.tsx
import React from "react";
import type { Tab } from "../types";

type TabsProps = {
  active: Tab;
  onChange: (v: Tab) => void;
};

// Bottom nav: HOME | MISSIONS | GAMES | SHOP | INVENTORY
const MAIN_TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "missions", label: "MISSIONS" },
  { id: "games", label: "GAMES" },
  { id: "shop", label: "SHOP" },
  { id: "inventory", label: "INVENTORY" },
];

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-black/50 backdrop-blur border-t border-white/10">
      <div className="grid grid-cols-5">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            className={`py-3 text-[11px] sm:text-sm font-semibold tracking-wide ${
              active === t.id ? "text-emerald-400" : "text-white/70"
            }`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
