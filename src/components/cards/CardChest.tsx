// src/components/cards/CardChest.tsx
import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../CardFrame";
import type { CardInstance } from "../../App";
import { ART, rollRarity, nextSerial, DROPS } from "./cardConfig";

type Props = {
  taps: number;
  cards: CardInstance[];
  setCards: (v: CardInstance[] | ((prev: CardInstance[]) => CardInstance[])) => void;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;
  tapsPerCoupon: number;
};

export default function CardChest({
  taps,
  cards,
  setCards,
  couponsAvailable,
  couponsSpent, // kept for future use / clarity
  setCouponsSpent,
  tapsPerCoupon,
}: Props) {
  const [lastPulled, setLastPulled] = useState<CardInstance[]>([]);

  const couponsEarned = useMemo(
    () => Math.floor(taps / tapsPerCoupon),
    [taps, tapsPerCoupon]
  );

  const tapsTowardNext = taps % tapsPerCoupon;
  const tapsToNextCoupon =
    tapsPerCoupon - (tapsTowardNext === 0 ? 0 : tapsTowardNext);

  const totalCardsOwned = cards.length;

  function openCards(costCoupons: number, count: number) {
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
    <>
      {/* Summary */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-300">Total cards owned</span>
          <span className="font-semibold text-emerald-300">
            {totalCardsOwned}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Coupons available</span>
          <span className="font-semibold text-emerald-300">
            {couponsAvailable}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Coupons earned</span>
          <span>
            {couponsEarned} (1 / {tapsPerCoupon} taps)
          </span>
        </div>
        <div className="mt-2">
          <div className="text-xs text-slate-400 mb-1">
            Next coupon in:
          </div>
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{
                width: `${
                  ((tapsTowardNext || tapsPerCoupon) / tapsPerCoupon) * 100
                }%`,
              }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400 text-right">
            {tapsToNextCoupon === 0
              ? "Ready – next tap gives a coupon!"
              : `${tapsToNextCoupon} tap(s) left`}
          </div>
        </div>
      </section>

      {/* Drop rates */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-slate-300 mb-2">Drop Rates</div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {DROPS.map((d) => (
            <div key={d.r} className="flex justify-between">
              <span className="capitalize">{d.r}</span>
              <span className="tabular-nums">{d.p}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Open buttons */}
      <section className="space-y-2">
        <button
          className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
            couponsAvailable >= 1
              ? "bg-emerald-500 text-emerald-950 active:scale-[0.98]"
              : "bg-white/10 text-slate-500"
          }`}
          disabled={couponsAvailable < 1}
          onClick={() => openCards(1, 1)}
        >
          Open 1 Card (Cost: 1 coupon)
        </button>

        <button
          className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
            couponsAvailable >= 10
              ? "bg-emerald-400 text-emerald-950 active:scale-[0.98]"
              : "bg-white/10 text-slate-500"
          }`}
          disabled={couponsAvailable < 10}
          onClick={() => openCards(10, 10)}
        >
          Open 10 Cards (Cost: 10 coupons)
        </button>

        <p className="text-[11px] text-slate-400 mt-1">
          You earn 1 coupon for every {tapsPerCoupon} taps in the main
          game.
        </p>
      </section>

      {/* Last pulled cards */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-slate-300 mb-2">Last pull</div>

        {lastPulled.length === 0 ? (
          <div className="text-xs text-slate-500">
            Open the chest to see your cards.
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
    </>
  );
}
