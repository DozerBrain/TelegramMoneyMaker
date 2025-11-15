// src/pages/Cards.tsx
import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../components/CardFrame";
import type { CardInstance } from "../App";

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

/* ------------ Small UI helpers ------------- */
function TabButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
) {
  const { active, className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition
        ${
          active
            ? "bg-emerald-500 text-emerald-950"
            : "bg-white/10 text-slate-200 hover:bg-white/15"
        }
        ${className}`}
    />
  );
}

const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "ultimate",
];

const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  ultimate: "Ultimate",
};

/* ------------ Props from App ------------- */
type Props = {
  taps: number;
  cards: CardInstance[];
  setCards: (v: CardInstance[] | ((prev: CardInstance[]) => CardInstance[])) => void;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;
  tapsPerCoupon: number;
};

/* ------------ CHEST TAB ------------- */
function ChestTab(
  props: Props & {
    lastPulled: CardInstance[];
    setLastPulled: (v: CardInstance[] | ((p: CardInstance[]) => CardInstance[])) => void;
  }
) {
  const {
    taps,
    cards,
    setCards,
    couponsAvailable,
    couponsSpent,
    setCouponsSpent,
    tapsPerCoupon,
    lastPulled,
    setLastPulled,
  } = props;

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
      const r = rollRarity();
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

/* ------------ COLLECTION TAB (NFT-like) ------------- */
function CollectionTab({ cards }: { cards: CardInstance[] }) {
  const grouped = useMemo(() => {
    const map: Record<Rarity, CardInstance[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
      mythic: [],
      ultimate: [],
    };
    for (const c of cards) {
      map[c.rarity].push(c);
    }
    return map;
  }, [cards]);

  const total = cards.length;

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        You don&apos;t own any cards yet. Earn coupons by tapping and
        open the chest to start your collection.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex justify-between items-center text-sm">
        <span className="text-slate-300">Total cards</span>
        <span className="font-semibold text-emerald-300">{total}</span>
      </div>

      {RARITY_ORDER.map((r) => {
        const list = grouped[r];
        if (!list.length) return null;

        return (
          <div key={r} className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300 px-1">
              <span>{RARITY_LABEL[r]}</span>
              <span className="font-mono text-emerald-300">
                x{list.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {list.map((card) => (
                <CardFrame
                  key={card.id}
                  rarity={card.rarity}
                  imgSrc={ART[card.rarity]}
                  serial={card.serial}
                  className="w-full"
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ------------ MAIN PAGE ------------- */
export default function CardsPage(props: Props) {
  const [tab, setTab] = useState<"chest" | "collection">("chest");
  const [lastPulled, setLastPulled] = useState<CardInstance[]>([]);

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-semibold text-emerald-400">
        Cards
      </h2>

      {/* Tabs */}
      <div className="mt-3 flex gap-2">
        <TabButton active={tab === "chest"} onClick={() => setTab("chest")}>
          Chest
        </TabButton>
        <TabButton
          active={tab === "collection"}
          onClick={() => setTab("collection")}
        >
          Collection
        </TabButton>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-4">
        {tab === "chest" ? (
          <ChestTab
            {...props}
            lastPulled={lastPulled}
            setLastPulled={setLastPulled}
          />
        ) : (
          <CollectionTab cards={props.cards} />
        )}
      </div>
    </div>
  );
}
