// src/lib/dayNightTheme.ts
export type DayNightMode = "day" | "night";

/** Decide if it's day or night based on the DEVICE local time */
export function getDayNightMode(date: Date = new Date()): DayNightMode {
  const hour = date.getHours(); // player's timezone (device)
  return hour >= 20 || hour < 8 ? "night" : "day";
}

/** Small hook to keep mode in sync (checks once per minute) */
import { useEffect, useState } from "react";

export function useDayNightMode(): DayNightMode {
  const [mode, setMode] = useState<DayNightMode>(() => getDayNightMode());

  useEffect(() => {
    const id = setInterval(() => {
      setMode(getDayNightMode());
    }, 60_000); // every 60s
    return () => clearInterval(id);
  }, []);

  return mode;
}

/**
 * Tailwind class tokens for different UI pieces.
 * Everything else (Home, Shop, etc.) will just read from here.
 */
export const DAY_NIGHT_THEME = {
  overlay: {
    day: "bg-black/20",
    night: "bg-black/55",
  },
  // Generic “glass card” (panels, shop cards, etc.)
  card: {
    day: "bg-slate-950/60 border-emerald-400/25 shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    night:
      "bg-slate-950/85 border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.45)]",
  },
  // Tap panel specifically (a bit brighter)
  tapPanel: {
    day: "bg-slate-950/55 border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    night:
      "bg-slate-950/80 border-emerald-400/55 shadow-[0_0_55px_rgba(16,185,129,0.55)]",
  },
  // Soft text colors
  textSoft: {
    day: "text-emerald-200",
    night: "text-emerald-300",
  },
  textMuted: {
    day: "text-slate-400",
    night: "text-slate-300",
  },
} as const;
