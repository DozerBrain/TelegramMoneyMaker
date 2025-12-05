// src/components/layout/BackgroundManager.tsx
import React, { useMemo } from "react";
import type { Tab } from "../../types";

import { getDayNightMode, DAY_NIGHT_THEME, type DayNightMode } from "../../lib/dayNightTheme";

type Props = {
  activeTab: Tab;
};

export default function BackgroundManager({ activeTab }: Props) {
  const { image, overlayClass } = useMemo(() => {
    const mode: DayNightMode = getDayNightMode();
    const isHome = activeTab === "home";

    let image = "";

    if (isHome) {
      image =
        mode === "night"
          ? "/background/home_night.png"
          : "/background/home_day.png";
    } else {
      image =
        mode === "night"
          ? "/background/secondary_night.png"
          : "/background/secondary_day.png";
    }

    const overlayClass = DAY_NIGHT_THEME.overlay[mode];

    return { image, overlayClass };
  }, [activeTab]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <img
        src={image}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  );
}
