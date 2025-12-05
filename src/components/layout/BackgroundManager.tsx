// src/components/layout/BackgroundManager.tsx
import React, { useMemo } from "react";
import type { Tab } from "../../types";

type Props = {
  activeTab: Tab;
};

export default function BackgroundManager({ activeTab }: Props) {
  const { image, overlayClass } = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 8; // Night mode
    const isHome = activeTab === "home";

    let image = "";

    if (isHome) {
      image = isNight ? "/bg/home_night.jpg" : "/bg/home_day.jpg";
    } else {
      image = isNight ? "/bg/secondary_night.jpg" : "/bg/secondary_day.jpg";
    }

    const overlayClass = isNight ? "bg-black/55" : "bg-black/20";

    return { image, overlayClass };
  }, [activeTab]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <img
        src={image}
        className="w-full h-full object-cover transition-opacity duration-500"
      />

      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  );
}
