import React from "react";
import { getTheme } from "../../theme/dayNightTheme";

type ScreenContainerProps = {
  children: React.ReactNode;
  variant?: "home" | "secondary"; // just in case we want subtle differences later
  scroll?: boolean;
};

export default function ScreenContainer({
  children,
  variant = "secondary",
  scroll = true,
}: ScreenContainerProps) {
  const theme = getTheme(); // make sure your dayNightTheme returns at least { mode: "day" | "night" }

  const isDay = theme.mode === "day";

  // Main panel style (matches your backgrounds: clean / glassy / premium)
  const basePanelClass =
    "w-full max-w-md mx-auto rounded-3xl border backdrop-blur-xl transition-colors duration-300";

  const panelTone =
    variant === "home"
      ? isDay
        ? "bg-white/70 border-emerald-200 shadow-[0_18px_60px_rgba(16,185,129,0.35)]"
        : "bg-slate-950/70 border-emerald-500/40 shadow-[0_22px_70px_rgba(16,185,129,0.7)]"
      : isDay
      ? "bg-white/80 border-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.25)]"
      : "bg-slate-950/80 border-slate-700/70 shadow-[0_18px_60px_rgba(15,23,42,0.7)]";

  return (
    <div
      className={
        "px-3 pt-2 pb-24 w-full h-full flex " +
        (scroll ? "overflow-y-auto" : "")
      }
    >
      <div className={basePanelClass + " " + panelTone}>{children}</div>
    </div>
  );
}
