// src/components/cards/CardChest.tsx
import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../CardFrame";
import type { CardInstance } from "../../types/cards";
import { ART, rollRarity, nextSerial, DROPS } from "./cardConfig";

type Props = {
  taps: number;
  cards: CardInstance[];
  setCards: (
    v: CardInstance[] | ((prev: CardInstance[]) => CardInstance[])
  ) => void;
  // This is still in the type so other code compiles,
  // but we won't trust it anymore – we'll compute our own.
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;
  tapsPerCoupon: number;
  bulkDiscountLevel: number;
};

const MAX_BULK_DISCOUNT = 5;

export default function CardChest({
  taps,
  cards,
  setCards,
  couponsAvailable: couponsAvailableProp, // we ignore this value now
  couponsSpent,
  setCouponsSpent,
  tapsPerCoupon,
  bulkDiscountLevel,
}: Props) {
  const [lastPulled, setLastPulled] = useState<CardInstance[]>([]);

  // How many coupons you SHOULD have earned total from taps
  const couponsEarned = useMemo(
    () => Math.floor(taps / tapsPerCoupon),
    [taps, tapsPerCoupon]
  );

  // ✅ Real available coupons = earned - spent (never below 0)
  const couponsAvailable = useMemo(
    () => Math.max(0, couponsEarned - couponsSpent),
    [couponsEarned, couponsSpent]
  );

  const tapsTowardNext = taps % tapsPerCoupon;
  const tapsToNextCoupon =
    tapsPerCoupon - (tapsTowardNext === 0 ? 0 : tapsTowardNext);

  const totalCardsOwned = cards.length;

  const tenPackCost = Math.max(
    10 - Math.min(bulkDiscountLevel, MAX_BULK_DISCOUNT),
    10 - MAX_BULK_DISCOUNT
  ); // 10 -> 5

  function openCards(costCoupons: number, count: number) {
    // Use our computed couponsAvailable, NOT the prop
    if (couponsAvailable < costCoupons) return;

    const pulled: CardInstance[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const r: Rarity = rollRarity();
      const serial = nextSerial(r);
      const card: CardInstance = {
        id: `card_${now}_${i}_${Math.random().toString(36).slice(2, 8)}`,
        rarity: r,
        serial,
        obtainedAt: now,
      };
      pulled.push(card);
    }

    setCards((prev) => [...prev, ...pulled]);
    setCouponsSpent((prev) => prev + costCoupons);
    setLastPulled(pulled);
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <section className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-900/40 via-slate-900/80 to-black/90 p-4 space-y-3 shadow-lg shadow-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold tracking-wide text-emerald-300/80 uppercase">
            Chest Overview
          </div>
          <div className="text-[11px] text-slate-400">
            🎟 1 coupon / {tapsPerCoupon} taps
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="space-y-1">
            <div className="text-slate-300 text-xs uppercase tracking-wide">
              Total Cards
            </div>
            <div className="text-lg font-bold text-emerald-300">
              {totalCardsOwned}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-slate-300 text-xs uppercase tracking-wide">
              Coupons
            </div>
            <div className="text-lg font-bold text-emerald-300">
              {couponsAvailable}
            </div>
            <div className="text-[11px] text-slate-400">
              Earned: {couponsEarned}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Next coupon progress</span>
            <span>
              {tapsToNextCoupon === 0
                ? "Next tap = +1 coupon"
                : `${tapsToNextCoupon} taps left`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{
                width: `${
                  ((tapsTowardNext || tapsPerCoupon) / tapsPerCoupon) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Drop rates */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-black/90 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-200 font-semibold">
            Drop rates
          </div>
          <div className="text-[11px] text-slate-500">
            Chances per card
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {DROPS.map((d) => (
            <div
              key={d.r}
              className="flex justify-between text-xs text-slate-300"
            >
              <span className="capitalize">{d.r}</span>
              <span className="tabular-nums text-emerald-300">{d.p}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Open buttons */}
      <section className="space-y-2">
        <button
          className={`w-full rounded-2xl py-3 text-sm font-semibold shadow-md shadow-emerald-500/20 transition 
          flex items-center justify-center gap-2
          ${
            couponsAvailable >= 1
              ? "bg-emerald-500 text-emerald-950 active:scale-[0.97] hover:bg-emerald-400"
              : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
          }`}
          disabled={couponsAvailable < 1}
          onClick={() => openCards(1, 1)}
        >
          <span>Open 1 Card</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-100">
            Cost: 1 coupon
          </span>
        </button>

        <button
          className={`w-full rounded-2xl py-3 text-sm font-semibold shadow-md shadow-emerald-400/25 transition 
          flex items-center justify-center gap-2
          ${
            couponsAvailable >= tenPackCost
              ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 active:scale-[0.97] hover:from-emerald-300 hover:to-cyan-300"
              : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
          }`}
          disabled={couponsAvailable < tenPackCost}
          onClick={() => openCards(tenPackCost, 10)}
        >
          <span>Open 10 Cards</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/20 text-slate-900">
            Best value • {tenPackCost} coupon
            {tenPackCost !== 1 ? "s" : ""}
          </span>
        </button>

        <p className="text-[11px] text-slate-500 mt-1 text-center">
          Tap in the main game to stack coupons, then blast them here for big pulls.
        </p>
      </section>

      {/* Last pulled cards */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-black p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-200 font-semibold">
            Last pull
          </div>
          {lastPulled.length > 0 && (
            <div className="text-[11px] text-slate-500">
              {lastPulled.length} card{lastPulled.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {lastPulled.length === 0 ? (
          <div className="text-xs text-slate-500">
            Open a chest to see your latest cards here.
          </div>
        ) : (
          <div
            className={`grid gap-3 ${
              lastPulled.length > 1 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {lastPulled.map((card) => (
              <CardFrame
                key={card.id}
                rarity={card.rarity}
                imgSrc={ART[card.rarity]}
                serial={card.serial}
                className="w-full"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
