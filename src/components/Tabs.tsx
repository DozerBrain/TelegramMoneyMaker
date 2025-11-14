// src/components/Tabs.tsx
import React from "react";

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabsProps<T extends string> = {
  active: T;
  onChange: (v: T) => void;
  items?: ReadonlyArray<TabItem<T>>;
  className?: string;
};

// Default items matching your routes
const defaultItems = [
  { id: "home",        label: "Home" },
  { id: "shop",        label: "Shop" },
  { id: "spin",        label: "Spin" },
  { id: "leaderboard", label: "Top" },
  { id: "profile",     label: "Profile" },
  { id: "more",        label: "More" },
] as const satisfies ReadonlyArray<{ id: string; label: string }>;

// Generic, strongly typed Tabs component
export default function Tabs<T extends string>({
  active,
  onChange,
  items,
  className = "",
}: TabsProps<T>) {
  // If caller didn’t pass items, use defaults and assert type compatibility
  const list = (items ?? (defaultItems as unknown as ReadonlyArray<TabItem<T>>));

  return (
    <nav
      className={
        "fixed bottom-0 inset-x-0 h-14 bg-black/50 backdrop-blur border-t border-white/10 " +
        "flex items-stretch justify-between px-1 " +
        className
      }
    >
      <div className="grid grid-cols-6 gap-1 w-full max-w-xl mx-auto">
        {list.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              className={[
                "text-sm font-medium rounded-xl mx-0.5 my-1",
                "transition-colors duration-150",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/10",
              ].join(" ")}
              onClick={() => onChange(it.id)}
            >
              <div className="px-3 h-10 flex items-center justify-center">
                {it.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
