// src/data/rarities.ts

// 🔥 Global rarity IDs for the whole game.
// Make sure this matches your CardFrame Rarity type.
export type RarityId =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

export type RarityConfig = {
  id: RarityId;
  label: string;
  shortLabel: string;
  order: number; // for sorting (0 = lowest → 6 = highest)

  // Base HEX color (useful for custom styling / gradients).
  colorHex: string;

  // Tailwind classes for TEXT and BADGE usage (titles, labels, etc.)
  textClass: string;
  badgeBgClass: string;
  badgeBorderClass: string;
  glowClass: string;

  // Ultimate / special handling
  isUltimate?: boolean;
  gradientCss?: string; // used for inline style on rainbow stuff
};

// 🔒 FINAL PALETTE – SAME EVERYWHERE (cards, titles, creatures, ranks)

export const RARITY_LIST: RarityConfig[] = [
  {
    id: "common",
    label: "Common",
    shortLabel: "C",
    order: 0,
    colorHex: "#bfbfbf",
    textClass: "text-zinc-300",
    badgeBgClass: "bg-zinc-900/80",
    badgeBorderClass: "border-zinc-500/50",
    glowClass: "shadow-[0_0_12px_rgba(148,163,184,0.35)]",
  },
  {
    id: "uncommon",
    label: "Uncommon",
    shortLabel: "U",
    order: 1,
    colorHex: "#44d17a",
    textClass: "text-emerald-400",
    badgeBgClass: "bg-emerald-900/30",
    badgeBorderClass: "border-emerald-400/60",
    glowClass: "shadow-[0_0_16px_rgba(16,185,129,0.45)]",
  },
  {
    id: "rare",
    label: "Rare",
    shortLabel: "R",
    order: 2,
    colorHex: "#3da8ff",
    textClass: "text-sky-400",
    badgeBgClass: "bg-sky-900/30",
    badgeBorderClass: "border-sky-400/60",
    glowClass: "shadow-[0_0_16px_rgba(56,189,248,0.45)]",
  },
  {
    id: "epic",
    label: "Epic",
    shortLabel: "E",
    order: 3,
    colorHex: "#a64bff",
    textClass: "text-purple-400",
    badgeBgClass: "bg-purple-900/30",
    badgeBorderClass: "border-purple-400/70",
    glowClass: "shadow-[0_0_18px_rgba(168,85,247,0.55)]",
  },
  {
    id: "legendary",
    label: "Legendary",
    shortLabel: "L",
    order: 4,
    colorHex: "#ffcb39",
    textClass: "text-amber-300",
    badgeBgClass: "bg-amber-900/30",
    badgeBorderClass: "border-amber-300/70",
    glowClass: "shadow-[0_0_20px_rgba(252,211,77,0.6)]",
  },
  {
    id: "mythic",
    label: "Mythic",
    shortLabel: "M",
    order: 5,
    colorHex: "#ff4c7e",
    textClass: "text-rose-400",
    badgeBgClass: "bg-rose-900/40",
    badgeBorderClass: "border-rose-400/70",
    glowClass: "shadow-[0_0_22px_rgba(251,113,133,0.65)]",
  },
  {
    id: "ultimate",
    label: "Ultimate",
    shortLabel: "U★",
    order: 6,
    colorHex: "#ffffff", // base doesn't matter much, we use gradient
    textClass: "text-white",
    badgeBgClass: "bg-black/80",
    badgeBorderClass: "border-white/80",
    glowClass: "shadow-[0_0_26px_rgba(244,244,245,0.95)]",
    isUltimate: true,
    gradientCss:
      "linear-gradient(90deg,#ff4c4c,#ffb53d,#ffe93d,#3dff7d,#3db7ff,#b73dff,#ff4cff)",
  },
];

// Fast lookup map
export const RARITY_MAP: Record<RarityId, RarityConfig> = RARITY_LIST.reduce(
  (acc, cfg) => {
    acc[cfg.id] = cfg;
    return acc;
  },
  {} as Record<RarityId, RarityConfig>
);

// ---- HELPERS ---------------------------------------------------------------

export function getRarityConfig(r: RarityId): RarityConfig {
  return RARITY_MAP[r];
}

export function rarityOrder(a: RarityId, b: RarityId): number {
  return RARITY_MAP[a].order - RARITY_MAP[b].order;
}

/**
 * Returns a Tailwind class string for coloring text by rarity.
 * Example: <span className={rarityTextClass("legendary")}>Legendary</span>
 */
export function rarityTextClass(r: RarityId): string {
  return RARITY_MAP[r].textClass;
}

/**
 * Returns classes for a pill/badge background for the rarity.
 * Use together with "inline-flex items-center ..." etc.
 */
export function rarityBadgeClasses(r: RarityId): string {
  const cfg = RARITY_MAP[r];
  return [
    cfg.badgeBgClass,
    cfg.badgeBorderClass,
    "border",
    cfg.glowClass,
  ].join(" ");
}

/**
 * Returns style object for gradient (mainly for Ultimate rainbow).
 * Use like: <span style={rarityGradientStyle("ultimate")} />
 */
export function rarityGradientStyle(
  r: RarityId
): React.CSSProperties | undefined {
  const cfg = RARITY_MAP[r];
  if (!cfg.gradientCss) return undefined;
  return {
    backgroundImage: cfg.gradientCss,
  };
}
