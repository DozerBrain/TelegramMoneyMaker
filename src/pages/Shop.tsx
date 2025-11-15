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

const MAX_MULTI = 1000;
const MAX_CRIT_CHANCE = 0.2; // 20%
const MAX_CRIT_MULT = 20;
const MAX_AUTO_BONUS = 3; // x3 auto
const MAX_COUPON_LEVEL = 10; // +100% coupons
const MAX_BULK_DISCOUNT = 5; // 10 -> 5 coupons

export default function Shop({
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
}: Props) {
  const critLevel = Math.round(critChance * 100); // in %
  const autoBonusLevel = Math.round((autoBonusMult - 1) * 10); // each = +0.1
  const multiLevel = multi;

  // ---- Dynamic costs (balanced for long-term play) ----
  const costTap1 = Math.max(100, tapValue * 50); // +1 tap
  const costTap5 = Math.max(1000, tapValue * 200); // +5 tap
  const costAuto1 = Math.max(5000, (autoPerSec + 1) * 3000); // +1 APS

  const costMultSmall = Math.max(
    25_000,
    Math.floor((multiLevel + 1) * 40_000)
  ); // +0.5x
  const costMultBig = Math.max(
    250_000,
    Math.floor((multiLevel + 1) * 150_000)
  ); // +1x

  const costCritChance = Math.max(
    1_000_000,
    (critLevel + 1) * 1_000_000
  );
  const costCritPower = Math.max(
    5_000_000,
    Math.max(1, critMult - 4) * 5_000_000
  );

  const costAutoBoost = Math.max(
    10_000_000,
    (autoBonusLevel + 1) * 10_000_000
  );

  const costCouponBoost = Math.max(
    2_000_000,
    (couponBoostLevel + 1) * 2_000_000
  );

  const costBulkDiscount = Math.max(
    5_000_000,
    (bulkDiscountLevel + 1) * 5_000_000
  );

  const tenPackCost = Math.max(
    10 - bulkDiscountLevel,
    10 - MAX_BULK_DISCOUNT
  ); // 10 -> 5

  const upgrades: Upgrade[] = [
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
      id: "auto+1",
      title: "+1 auto / sec",
      desc: "Earn passively every second",
      cost: costAuto1,
      disabled: false,
      onBuy: () => setAutoPerSec(autoPerSec + 1),
    },
    {
      id: "mult+0.5",
      title: "+0.5x multiplier",
      desc: "Increase all earnings by 50%",
      cost: costMultSmall,
      disabled: multi >= MAX_MULTI,
      onBuy: () =>
        setMulti(
          Math.min(
            MAX_MULTI,
            parseFloat((multi + 0.5).toFixed(2))
          )
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
          Math.min(
            MAX_MULTI,
            parseFloat((multi + 1).toFixed(2))
          )
        ),
    },
    {
      id: "crit+1",
      title: "+1% crit chance",
      desc: `Current: ${(critChance * 100).toFixed(1)}%`,
      cost: costCritChance,
      disabled: critChance >= MAX_CRIT_CHANCE,
      onBuy: () =>
        setCritChance(
          Math.min(MAX_CRIT_CHANCE, critChance + 0.01)
        ),
    },
    {
      id: "critPower+1",
      title: "+1x crit power",
      desc: `Current: x${critMult.toFixed(1)} on crit`,
      cost: costCritPower,
      disabled: critMult >= MAX_CRIT_MULT,
      onBuy: () =>
        setCritMult(
          Math.min(MAX_CRIT_MULT, critMult + 1)
        ),
    },
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
    if (balance < u.cost) return;
    setBalance(balance - u.cost);
    u.onBuy();
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card
        title="Upgrades"
        right={
          <span className="text-sm text-emerald-300">
            Balance: ${formatMoneyShort(balance)}
          </span>
        }
      >
        <div className="space-y-3">
          {upgrades.map((u) => {
            const affordable = balance >= u.cost && !u.disabled;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
              >
                <div className="text-sm">
                  <div className="font-semibold text-white">
                    {u.title}
                  </div>
                  <div className="text-xs text-white/60">
                    {u.desc}
                  </div>
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
