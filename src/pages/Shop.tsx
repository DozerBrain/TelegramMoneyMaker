// src/pages/Shop.tsx
import React from "react";
import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance: number;
  setBalance: (n: number) => void;

  tapValue: number;
  setTapValue: (n: number) => void;

  autoPerSec: number;
  setAutoPerSec: (n: number) => void;

  multi: number;
  setMulti: (n: number) => void;

  critChance: number;
  setCritChance: (n: number) => void;

  critMult: number;
  setCritMult: (n: number) => void;

  autoBonusMult: number;
  setAutoBonusMult: (n: number) => void;

  couponBoostLevel: number;
  setCouponBoostLevel: (n: number) => void;

  bulkDiscountLevel: number;
  setBulkDiscountLevel: (n: number) => void;
};

type Upgrade = {
  id: string;
  title: string;
  desc: string;
  cost: number;
  disabled: boolean;
  onBuy: () => void;
};

// Hard caps so nothing explodes
const MAX_MULTI = 1000;
const MAX_CRIT_CHANCE = 0.2; // 20%
const MAX_CRIT_MULT = 20;
const MAX_AUTO_BONUS = 3; // x3 auto
const MAX_COUPON_LEVEL = 10; // +100% coupons
const MAX_BULK_DISCOUNT = 5; // 10 -> 5 coupons

// Helper: make sure costs stay finite & non-negative
function safeCost(v: number, fallback: number): number {
  if (!Number.isFinite(v) || v <= 0) return fallback;
  // clamp to something big but safe
  return Math.min(v, 9_000_000_000_000_000);
}

export default function Shop(props: Props) {
  const {
    balance,
    setBalance,
    tapValue,
    setTapValue,
    autoPerSec,
    setAutoPerSec,
    multi,
    setMulti,
    critChance,
    setCritChance,
    critMult,
    setCritMult,
    autoBonusMult,
    setAutoBonusMult,
    couponBoostLevel,
    setCouponBoostLevel,
    bulkDiscountLevel,
    setBulkDiscountLevel,
  } = props;

  const critLevel = Math.round(critChance * 100); // in %
  const autoBonusLevel = Math.round((autoBonusMult - 1) * 10); // each level ≈ +0.1
  const multiLevel = multi;

  // ---- Dynamic costs (balanced & safe) ----
  // TAPS
  const costTap1 = safeCost(Math.max(100, tapValue * 50), 100); // +1 tap
  const costTap5 = safeCost(Math.max(500, tapValue * 200), 500); // +5 tap
  const costTap10 = safeCost(Math.max(2_000, tapValue * 600), 2_000); // +10 tap
  const costTap50 = safeCost(Math.max(10_000, tapValue * 3_000), 10_000); // +50 tap
  const costTap100 = safeCost(Math.max(25_000, tapValue * 7_000), 25_000); // +100 tap

  // AUTO PER SEC (APS)
  const costAuto1 = safeCost(
    Math.max(5_000, (autoPerSec + 1) * 3_000),
    5_000
  );
  const costAuto5 = safeCost(
    Math.max(25_000, (autoPerSec + 5) * 15_000),
    25_000
  );
  const costAuto10 = safeCost(
    Math.max(50_000, (autoPerSec + 10) * 30_000),
    50_000
  );
  const costAuto50 = safeCost(
    Math.max(250_000, (autoPerSec + 50) * 150_000),
    250_000
  );
  const costAuto100 = safeCost(
    Math.max(500_000, (autoPerSec + 100) * 300_000),
    500_000
  );

  // MULTI
  const costMultSmall = safeCost(
    Math.max(25_000, (multiLevel + 0.5) * 40_000),
    25_000
  );
  const costMultBig = safeCost(
    Math.max(250_000, (multiLevel + 1) * 150_000),
    250_000
  );

  // CRIT
  const costCritChance = safeCost(
    Math.max(1_000_000, (critLevel + 1) * 1_000_000),
    1_000_000
  );
  const costCritPower = safeCost(
    Math.max(5_000_000, Math.max(1, critMult - 4) * 5_000_000),
    5_000_000
  );

  // AUTO BONUS
  const costAutoBoost = safeCost(
    Math.max(10_000_000, (autoBonusLevel + 1) * 10_000_000),
    10_000_000
  );

  // COUPON BOOST
  const costCouponBoost = safeCost(
    Math.max(2_000_000, (couponBoostLevel + 1) * 2_000_000),
    2_000_000
  );

  // BULK DISCOUNT (for card 10-pack)
  const costBulkDiscount = safeCost(
    Math.max(5_000_000, (bulkDiscountLevel + 1) * 5_000_000),
    5_000_000
  );

  const tenPackCost = Math.max(10 - bulkDiscountLevel, 10 - MAX_BULK_DISCOUNT); // 10 → 5

  const upgrades: Upgrade[] = [
    // ---- TAPS ----
    {
      id: "tap+1",
      title: "+1 per tap",
      desc: "Increase tap value by 1",
      cost: costTap1,
      disabled: false,
      onBuy: () => setTapValue(tapValue + 1),
    },
    {
      id: "tap+5",
      title: "+5 per tap",
      desc: "Increase tap value by 5",
      cost: costTap5,
      disabled: false,
      onBuy: () => setTapValue(tapValue + 5),
    },
    {
      id: "tap+10",
      title: "+10 per tap",
      desc: "Increase tap value by 10",
      cost: costTap10,
      disabled: false,
      onBuy: () => setTapValue(tapValue + 10),
    },
    {
      id: "tap+50",
      title: "+50 per tap",
      desc: "Big boost to tap value",
      cost: costTap50,
      disabled: false,
      onBuy: () => setTapValue(tapValue + 50),
    },
    {
      id: "tap+100",
      title: "+100 per tap",
      desc: "Huge boost to tap value",
      cost: costTap100,
      disabled: false,
      onBuy: () => setTapValue(tapValue + 100),
    },

    // ---- AUTO PER SECOND (APS) ----
    {
      id: "auto+1",
      title: "+1 auto / sec",
      desc: "Earn passively every second",
      cost: costAuto1,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 1),
    },
    {
      id: "auto+5",
      title: "+5 auto / sec",
      desc: "Passive income boost",
      cost: costAuto5,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 5),
    },
    {
      id: "auto+10",
      title: "+10 auto / sec",
      desc: "Strong passive income",
      cost: costAuto10,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 10),
    },
    {
      id: "auto+50",
      title: "+50 auto / sec",
      desc: "Massive passive boost",
      cost: costAuto50,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 50),
    },
    {
      id: "auto+100",
      title: "+100 auto / sec",
      desc: "Huge passive boost",
      cost: costAuto100,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 100),
    },

    // ---- MULTIPLIER ----
    {
      id: "mult+0.5",
      title: "+0.5x multiplier",
      desc: "Increase all earnings by 50%",
      cost: costMultSmall,
      disabled: multi >= MAX_MULTI,
      onBuy: () =>
        setMulti(
          Math.min(MAX_MULTI, parseFloat((multi + 0.5).toFixed(2)))
        ),
    },
    {
      id: "mult+1",
      title: "+1x multiplier",
      desc: "Big boost to all earnings",
      cost: costMultBig,
      disabled: multi >= MAX_MULTI,
      onBuy: () =>
        setMulti(
          Math.min(MAX_MULTI, parseFloat((multi + 1).toFixed(2)))
        ),
    },

    // ---- CRIT ----
    {
      id: "crit+1",
      title: "+1% crit chance",
      desc: `Current: ${(critChance * 100).toFixed(1)}%`,
      cost: costCritChance,
      disabled: critChance >= MAX_CRIT_CHANCE,
      onBuy: () =>
        setCritChance(Math.min(MAX_CRIT_CHANCE, critChance + 0.01)),
    },
    {
      id: "critPower+1",
      title: "+1x crit power",
      desc: `Current: x${critMult.toFixed(1)} on crit`,
      cost: costCritPower,
      disabled: critMult >= MAX_CRIT_MULT,
      onBuy: () => setCritMult(Math.min(MAX_CRIT_MULT, critMult + 1)),
    },

    // ---- AUTO BONUS ----
    {
      id: "autoBoost+0.1",
      title: "+10% auto income",
      desc: `Current: x${autoBonusMult.toFixed(1)} auto`,
      cost: costAutoBoost,
      disabled: autoBonusMult >= MAX_AUTO_BONUS,
      onBuy: () =>
        setAutoBonusMult(
          Math.min(
            MAX_AUTO_BONUS,
            parseFloat((autoBonusMult + 0.1).toFixed(2))
          )
        ),
    },

    // ---- COUPON BOOST ----
    {
      id: "couponBoost",
      title: "Coupon generator +10%",
      desc: `Current: +${couponBoostLevel * 10}% coupons`,
      cost: costCouponBoost,
      disabled: couponBoostLevel >= MAX_COUPON_LEVEL,
      onBuy: () =>
        setCouponBoostLevel(
          Math.min(MAX_COUPON_LEVEL, couponBoostLevel + 1)
        ),
    },

    // ---- BULK DISCOUNT ----
    {
      id: "bulkDiscount",
      title: "Bulk chest discount",
      desc: `10-card chest cost: ${tenPackCost} coupons`,
      cost: costBulkDiscount,
      disabled: bulkDiscountLevel >= MAX_BULK_DISCOUNT,
      onBuy: () =>
        setBulkDiscountLevel(
          Math.min(MAX_BULK_DISCOUNT, bulkDiscountLevel + 1)
        ),
    },
  ];

  function handleBuy(u: Upgrade) {
    if (u.disabled) return;
    if (!Number.isFinite(balance) || balance < u.cost) return;
    setBalance(balance - u.cost);
    u.onBuy();
  }

  const safeBalanceDisplay = Number.isFinite(balance) && balance >= 0 ? balance : 0;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 pb-24">
      <Card
        title="Upgrades"
        right={
          <span className="text-sm text-emerald-300">
            Balance: ${formatMoneyShort(safeBalanceDisplay)}
          </span>
        }
      >
        <div className="space-y-3">
          {upgrades.map((u) => {
            const affordable =
              Number.isFinite(balance) && balance >= u.cost && !u.disabled;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
              >
                <div className="text-sm">
                  <div className="font-semibold text-white">
                    {u.title}
                  </div>
                  <div className="text-xs text-white/60">{u.desc}</div>
                </div>
                <button
                  onClick={() => handleBuy(u)}
                  disabled={!affordable}
                  className={`min-w-[90px] px-4 py-2 rounded-full text-sm font-semibold
                    ${
                      affordable
                        ? "bg-emerald-500 text-emerald-950 active:scale-[0.97]"
                        : "bg-zinc-700 text-zinc-400 opacity-60 cursor-not-allowed"
                    }`}
                >
                  ${formatMoneyShort(u.cost)}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
