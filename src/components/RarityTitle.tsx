// src/components/RarityTitle.tsx
import React from "react";
import {
  type RarityId,
  getRarityConfig,
  rarityBadgeClasses,
  rarityGradientStyle,
} from "../data/rarities";

type Props = {
  rarity: RarityId;
  children: React.ReactNode;
  small?: boolean; // optional smaller size
};

export default function RarityTitle({ rarity, children, small }: Props) {
  const cfg = getRarityConfig(rarity);
  const sizeClass = small ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1.5";

  const baseClasses =
    "inline-flex items-center justify-center rounded-full font-semibold tracking-wide uppercase";

  // Ultimate: rainbow gradient background, white text, stronger glow
  if (cfg.isUltimate) {
    return (
      <span
        className={`${baseClasses} ${sizeClass} text-white border border-white/80 shadow-[0_0_26px_rgba(244,244,245,0.95)]`}
        style={rarityGradientStyle(rarity)}
      >
        {children}
      </span>
    );
  }

  // Normal rarities – use badge + configured text class.
  return (
    <span
      className={`${baseClasses} ${sizeClass} ${rarityBadgeClasses(
        rarity
      )} ${cfg.textClass}`}
    >
      {children}
    </span>
  );
}
