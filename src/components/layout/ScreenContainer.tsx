// src/components/layout/ScreenContainer.tsx
import React, { useMemo } from "react";
import type { Tab } from "../../types";

type Props = {
  tab: Tab;
  children: React.ReactNode;
};

export default function ScreenContainer({ tab, children }: Props) {
  const { isHome, wrapperClass, cardClass } = useMemo(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour < 8;
    const isHome = tab === "home";

    const wrapperBase =
      "relative mx-auto w-full h-full max-w-md px-3 pb-24 pt-4";

    if (isHome) {
      // Home screen = no card, just spacing, background shows fully
      return {
        isHome: true,
        wrapperClass: "relative mx-auto w-full h-full max-w-md pb-24 pt-2 px-0",
        cardClass: "",
      };
    }

    const cardBase =
      "w-full h-full rounded-3xl border backdrop-blur-xl overflow-hidden";

    const dayCard =
      "bg-white/10 border-white/30 shadow-[0_0_40px_rgba(34,197,94,0.35)]";
    const nightCard =
      "bg-slate-950/70 border-emerald-400/25 shadow-[0_0_50px_rgba(6,182,212,0.6)]";

    const cardClass = `${cardBase} ${
      isNight ? nightCard : dayCard
    }`;

    return {
      isHome: false,
      wrapperClass: wrapperBase,
      cardClass,
    };
  }, [tab]);

  if (isHome) {
    return <div className={wrapperClass}>{children}</div>;
  }

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>{children}</div>
    </div>
  );
}
