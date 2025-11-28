// src/data/achievements.ts
import type { TitleId } from "./titles";

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  reward: number; // cash reward (small bonus, main reward = title)
  unlockTitleId?: TitleId; // optional title reward
  check: (ctx: {
    taps: number;
    balance: number;
    totalEarnings: number;
    bestSuitName: string;
    countriesOwned: number; // 🔥 for world / conquest achievements

    // 🔥 optional extras for special achievements
    couponsSpent?: number; // total coupons spent on chests
    cardsOwned?: number; // total card instances owned
  }) => boolean;
};

// Helper to gate by suit – order MUST match suits.ts `name` values
const SUIT_ORDER = [
  "Starter",
  "Emerald",
  "Velvet",
  "Millionaire",
  "Crypto",
] as const;

const suitReached = (best: string, target: string) => {
  const order = SUIT_ORDER as readonly string[];
  const bestIdx = order.indexOf(best);
  const targetIdx = order.indexOf(target);
  if (bestIdx === -1 || targetIdx === -1) return false;
  return bestIdx >= targetIdx;
};

export const achievements: Achievement[] = [
  // 🔹 TAPS
  {
    id: "tap_1",
    name: "First Tap",
    desc: "Make your very first tap.",
    reward: 100,
    check: (c) => c.taps >= 1,
  },
  {
    id: "tap_100",
    name: "Tap Rookie",
    desc: "Reach 100 taps.",
    reward: 500,
    check: (c) => c.taps >= 100,
    // First real title – early flex
    unlockTitleId: "rookie_tapper",
  },
  {
    id: "tap_1k",
    name: "Tap Pro",
    desc: "Reach 1,000 taps.",
    reward: 2_000,
    check: (c) => c.taps >= 1_000,
  },

  // 🔹 BALANCE (current)
  {
    id: "bal_1k",
    name: "First K",
    desc: "Hold $1,000 at once.",
    reward: 1_000,
    check: (c) => c.balance >= 1_000,
  },
  {
    id: "bal_10k",
    name: "Stack Builder",
    desc: "Hold $10,000 at once.",
    reward: 5_000,
    check: (c) => c.balance >= 10_000,
  },
  {
    id: "bal_100k",
    name: "Six Figures",
    desc: "Hold $100,000 at once.",
    reward: 20_000,
    check: (c) => c.balance >= 100_000,
  },

  // 🔹 TOTAL EARNINGS (lifetime)
  {
    id: "tot_1m",
    name: "Million Made",
    desc: "Earn $1,000,000 total.",
    reward: 50_000,
    check: (c) => c.totalEarnings >= 1_000_000,
  },
  {
    id: "tot_10m",
    name: "Eight Figures",
    desc: "Earn $10,000,000 total.",
    reward: 200_000,
    check: (c) => c.totalEarnings >= 10_000_000,
  },
  // Mid / late game earnings for legendary / ultimate titles
  {
    id: "tot_1b",
    name: "Billion Club",
    desc: "Earn $1,000,000,000 total.",
    reward: 500_000,
    check: (c) => c.totalEarnings >= 1_000_000_000,
    unlockTitleId: "tap_myth", // legendary title
  },
  {
    id: "tot_1t",
    name: "Trillion Flow",
    desc: "Earn $1,000,000,000,000 total.",
    reward: 5_000_000,
    check: (c) => c.totalEarnings >= 1_000_000_000_000,
    unlockTitleId: "ultra_being", // ultimate title
  },

  // 🔹 SUIT UNLOCKS – names MUST match suits.ts `name`
  {
    id: "suit_emerald",
    name: "Emerald Drip",
    desc: "Unlock the Emerald suit.",
    reward: 5_000,
    check: (c) => suitReached(c.bestSuitName, "Emerald"),
  },
  {
    id: "suit_velvet",
    name: "Royal Velvet",
    desc: "Unlock the Velvet suit.",
    reward: 20_000,
    check: (c) => suitReached(c.bestSuitName, "Velvet"),
  },
  {
    id: "suit_millionaire",
    name: "Made Million",
    desc: "Unlock the Millionaire suit.",
    reward: 100_000,
    check: (c) => suitReached(c.bestSuitName, "Millionaire"),
    unlockTitleId: "suit_millionaire_mogul",
  },
  {
    id: "suit_crypto",
    name: "Crypto King",
    desc: "Unlock the Crypto King suit.",
    reward: 500_000,
    check: (c) => suitReached(c.bestSuitName, "Crypto"),
    unlockTitleId: "suit_crypto_phantom",
  },

  // 🔹 WORLD / CONQUER THE WORLD – based on countries owned
  {
    id: "world_1",
    name: "First Claim",
    desc: "Own at least 1 country.",
    reward: 50_000,
    check: (c) => c.countriesOwned >= 1,
    unlockTitleId: "world_local_boss",
  },
  {
    id: "world_10",
    name: "Regional Overlord",
    desc: "Own at least 10 countries.",
    reward: 150_000,
    check: (c) => c.countriesOwned >= 10,
    unlockTitleId: "world_regional_overlord",
  },
  {
    id: "world_30",
    name: "Continental Ruler",
    desc: "Own at least 30 countries.",
    reward: 400_000,
    check: (c) => c.countriesOwned >= 30,
    unlockTitleId: "world_continental_ruler",
  },
  {
    id: "world_60",
    name: "Global Expansion",
    desc: "Own at least 60 countries.",
    reward: 1_000_000,
    check: (c) => c.countriesOwned >= 60,
    unlockTitleId: "world_global_tycoon",
  },
  {
    id: "world_100",
    name: "Half-World Emperor",
    desc: "Own at least 100 countries.",
    reward: 3_000_000,
    check: (c) => c.countriesOwned >= 100,
    unlockTitleId: "world_emperor",
  },
  {
    id: "world_150",
    name: "Universal Legend",
    desc: "Own at least 150 countries.",
    reward: 7_500_000,
    check: (c) => c.countriesOwned >= 150,
    unlockTitleId: "world_universal_legend",
  },
  {
    id: "world_197",
    name: "Full Conquer",
    desc: "Own all 197 countries.",
    reward: 20_000_000,
    check: (c) => c.countriesOwned >= 197,
    unlockTitleId: "world_multiversal_overlord",
  },

  // 🔹 SPECIAL – COUPONS & CARDS
  {
    id: "coupon_hoarder",
    name: "Coupon Hoarder",
    desc: "Spend 100 coupons on card chests.",
    reward: 100_000,
    check: (c) => (c.couponsSpent ?? 0) >= 100,
    unlockTitleId: "coupon_hoarder",
  },
  {
    id: "card_collector",
    name: "Card Collector",
    desc: "Own 50 cards in your collection.",
    reward: 250_000,
    check: (c) => (c.cardsOwned ?? 0) >= 50,
    unlockTitleId: "card_collector",
  },
];

// Build initial claimed/done map
export function initialAchievementState() {
  const m: Record<string, { done: boolean; claimed: boolean }> = {};
  for (const a of achievements) m[a.id] = { done: false, claimed: false };
  return m;
}
