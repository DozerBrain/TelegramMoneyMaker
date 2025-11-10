import React from "react";

/** Rarity type */
export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

type Props = {
  rarity: Rarity;
  imgSrc: string;          // clean artwork only (no frame/text)
  title?: string;          // defaults to rarity label in caps
  serial?: string;         // e.g. "#CM-0001 | MNYMKR v1.0"
  className?: string;      // optional wrapper classes (w-48, etc.)
};

/** Palette + frame behavior */
const RARITY = {
  common:    { stroke: "#00FFB0", glow: "rgba(0,255,176,0.55)", text: "COMMON" },
  uncommon:  { stroke: "#00D4FF", glow: "rgba(0,212,255,0.55)", text: "UNCOMMON" },
  rare:      { stroke: "#B46CFF", glow: "rgba(180,108,255,0.55)", text: "RARE" },
  epic:      { stroke: "#FF7A00", glow: "rgba(255,122,0,0.55)",  text: "EPIC" },
  legendary: { stroke: "#FFD700", glow: "rgba(255,215,0,0.60)",  text: "LEGENDARY" },
  mythic:    { stroke: "#FF1E8A", glow: "rgba(255,30,138,0.60)", text: "MYTHIC" },
  ultimate:  { stroke: "#FFFFFF", glow: "rgba(255,255,255,0.75)", text: "ULTIMATE" },
} as const;

export default function CardFrame({
  rarity,
  imgSrc,
  title,
  serial,
  className = "",
}: Props) {
  const cfg = RARITY[rarity];
  const label = (title ?? cfg.text).toUpperCase();

  // For Ultimate we use a foil gradient; others use a solid stroke
  const isUltimate = rarity === "ultimate";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#0b1220] ${className}`}
      style={{
        boxShadow: `0 0 28px ${cfg.glow}, inset 0 0 0 1px rgba(255,255,255,0.06)`,
      }}
    >
      {/* Artwork */}
      <img
        src={imgSrc}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Dim top/bottom for text readability */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

      {/* Frame border (SVG keeps crisp corners) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 133">
        {isUltimate ? (
          <>
            {/* Animated foil gradient */}
            <defs>
              <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="#ffffff" />
                <stop offset="25%" stopColor="#00FFD1" />
                <stop offset="50%" stopColor="#7AA1FF" />
                <stop offset="75%" stopColor="#FF7AE6" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <rect
              x="2" y="2" width="96" height="129" rx="7"
              fill="none"
              stroke="url(#foil)"
              strokeWidth="1.5"
              className="foil-animate"
            />
          </>
        ) : (
          <rect
            x="2" y="2" width="96" height="129" rx="7"
            fill="none"
            stroke={cfg.stroke}
            strokeWidth="1.5"
          />
        )}
        {/* Inner bezel */}
        <rect
          x="6" y="8" width="88" height="117" rx="6"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Top rarity label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-3 px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wider"
        style={{
          color: "#0b1220",
          background: isUltimate
            ? "linear-gradient(90deg, #fff, #00FFD1, #7AA1FF, #FF7AE6, #fff)"
            : cfg.stroke,
          boxShadow: `0 0 16px ${cfg.glow}`,
        }}
      >
        {label}
      </div>

      {/* Bottom divider line */}
      <div
        className="absolute left-6 right-6 bottom-[38px] h-[1.5px] rounded"
        style={{
          background: isUltimate
            ? "linear-gradient(90deg, transparent, #fff, #00FFD1, #7AA1FF, #FF7AE6, #fff, transparent)"
            : `linear-gradient(90deg, transparent, ${cfg.stroke}, transparent)`,
          filter: "drop-shadow(0 0 4px rgba(255,255,255,0.45))",
        }}
      />

      {/* Serial text */}
      {serial && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold"
          style={{
            color: cfg.stroke,
            textShadow:
              "0 0 6px rgba(255,255,255,0.45), 0 0 10px rgba(255,255,255,0.25)",
            letterSpacing: "0.08em",
          }}
        >
          {serial}
        </div>
      )}
    </div>
  );
}
