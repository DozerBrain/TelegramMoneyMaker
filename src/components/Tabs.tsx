// src/components/Tabs.tsx
import React from "react";
import type { Tab } from "../types";

type TabsProps = {
  active: Tab;
  onChange: (v: Tab) => void;
};

// 👇 Bottom nav now only shows the core pages.
// Leaderboard + Profile are handled from the TopBar.
const MAIN_TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "spin", label: "Spin" },
  { id: "more", label: "More" },
];

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-black/50 backdrop-blur border-t border-white/10">
      <div className="grid grid-cols-4">
        {MAIN_TABS.map((t) => (
          <button
            key={t.id}
            className={`py-3 text-sm font-medium ${
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
