// src/components/title/TitleBanner.tsx
import React from "react";
import { type Rarity } from "../../data/titles";
import { rarityToTailwind } from "../../lib/titleLogic";

type Props = {
  label: string;
  rarity: Rarity;
  // Optional progress, e.g. 57 / 197 for world titles
  progressCurrent?: number;
  progressMax?: number;
};

export default function TitleBanner({
  label,
  rarity,
  progressCurrent,
  progressMax,
}: Props) {
  const styles = rarityToTailwind(rarity);

  const showProgress =
    typeof progressCurrent === "number" && typeof progressMax === "number";

  return (
    <div className="w-full flex items-center justify-center mt-2">
      <div
        className={[
          "relative inline-flex items-center justify-between px-4 py-1.5",
          "rounded-full border text-[11px] font-semibold tracking-wide uppercase",
          "text-white",
          styles.fill,
          styles.border,
          styles.glow,
        ].join(" ")}
        style={{
          // This makes the "arrow tip" feeling by overshooting and masking
          clipPath:
            "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",
        }}
      >
        <span className="px-1 whitespace-nowrap">{label}</span>

        {showProgress && (
          <span className="ml-3 text-[10px] font-normal opacity-90 whitespace-nowrap">
            {progressCurrent}/{progressMax}
          </span>
        )}
      </div>
    </div>
  );
}
