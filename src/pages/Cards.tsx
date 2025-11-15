// src/pages/Cards.tsx
import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../components/CardFrame";
import type { CardCollection } from "../App";

/* ------------ Art paths: use your /public/cards/*.png files ------------- */
const ART: Record<Rarity, string> = {
  common: "/cards/common.png",
  uncommon: "/cards/uncommon.png",
  rare: "/cards/rare.png",
  epic: "/cards/epic.png",
  legendary: "/cards/legendary.png",
  mythic: "/cards/mythic.png",
  ultimate: "/cards/ultimate.png",
};

/* ------------ Serial helpers ------------- */
const PREFIX: Record<Rarity, string> = {
  common: "CM",
  uncommon: "UC",
  rare: "RR",
  epic: "EP",
  legendary: "LG",
  mythic: "MY",
  ultimate: "UL",
};

function nextSerial(r: Rarity) {
  const key = `mm_serial_${r}`;
  const n = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  return `#${PREFIX[r]}-${String(n).padStart(4, "0")} | MNYMKR v1.0`;
}

/* ------------ Drop table (sum ~100%) ------------- */
type DropRow = { r: Rarity; p: number };
const DROPS: DropRow[] = [
  { r: "ultimate", p: 0.005 },
  { r: "mythic", p: 0.07 },
  { r: "legendary", p: 1.0 },
  { r: "epic", p: 3.6 },
  { r: "rare", p: 14.6 },
  { r: "uncommon", p: 29.3 },
  { r: "common", p: 51.2 },
];

/* ------------ Roll rarity logic ------------- */
function rollRarity(): Rarity {
  const x = Math.random() * 100;
  let acc = 0;
  for (const row of DROPS) {
    acc += row.p;
    if (x <= acc) return row.r;
  }
  return "common";
}

/* ------------ Props from App ------------- */
type Props = {
  taps: number;
  collection: CardCollection;
  setCollection: (c: CardCollection | ((c: CardCollection) => CardCollection)) => void;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;
  tapsPerCoupon: number;
};

/* ------------ Page ------------- */
export default function CardsPage({
  taps,
  collection,
  setCollection,
  couponsAvailable,
  couponsSpent,
  setCouponsSpent,
  tapsPerCoupon,
}: Props) {
  const [lastPulled, setLastPulled] = useState<
    { rarity: Rarity; serial: string }[]
  >([]);

  const couponsEarned = useMemo(
    () => Math.floor(taps / tapsPerCoupon),
    [taps, tapsPerCoupon]
  );

  const tapsTowardNext = taps % tapsPerCoupon;
  const tapsToNextCoupon =
    tapsPerCoupon - (tapsTowardNext === 0 ? 0 : tapsTowardNext);

  const totalCardsOwned = useMemo(
    () =>
      collection.common +
      collection.uncommon +
      collection.rare +
      collection.epic +
      collection.legendary +
      collection.mythic +
      collection.ultimate,
    [collection]
  );

  function addCard(r: Rarity) {
    setCollection((prev) => ({
      ...prev,
      [r]: (prev as any)[r] + 1,
    }));
  }

  function openCards(costCoupons: number, count: number) {
    if (couponsAvailable < costCoupons) return;

    const pulled: { rarity: Rarity; serial: string }[] = [];

    for (let i = 0; i < count; i++) {
      const r = rollRarity();
      addCard(r);
      pulled.push({ rarity: r, serial: nextSerial(r) });
    }

    setCouponsSpent((prev) => prev + costCoupons);
    setLastPulled(pulled);
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-semibold text-emerald-400">
        Card Chest
      </h2>

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
            {lastPulled.map((card, idx) => (
              <CardFrame
                key={card.serial + idx}
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
