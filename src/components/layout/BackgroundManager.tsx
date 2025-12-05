// src/components/layout/BackgroundManager.tsx
import React, { useMemo } from "react";
import type { Tab } from "../../types";

type Props = {
  activeTab: Tab;
};

export default function BackgroundManager({ activeTab }: Props) {
  const { image, overlayClass } = useMemo(() => {
    const hour = new Date().getHours();

    const isNight = hour >= 20 || hour < 8; // 20:00–07:59
    const isHome = activeTab === "home";

    let image = "";

    if (isHome) {
      image = isNight
        ? "/background/home_night.png"
        : "/background/home_day.png";
    } else {
      image = isNight
        ? "/background/secondary_night.png"
        : "/background/secondary_day.png";
    }

    const overlayClass = isNight ? "bg-black/55" : "bg-black/20";

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
