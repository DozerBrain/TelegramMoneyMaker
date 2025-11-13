import React from "react";
import { Tab } from "../types";

type Props = {
  active: Tab;
  onChange: React.Dispatch<React.SetStateAction<Tab>>;
};

export default function Tabs({ active, onChange }: Props) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "home",        label: "Home" },
    { key: "shop",        label: "Shop" },
    { key: "spin",        label: "Spin" },
    { key: "more",        label: "More" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "profile",     label: "Profile" },
  ];

  return (
    <div className="flex justify-around border-t border-white/10 bg-[#101418] py-3">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            active === t.key ? "bg-emerald-600" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
