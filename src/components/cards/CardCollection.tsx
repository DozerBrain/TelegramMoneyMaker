// src/components/cards/CardCollection.tsx
import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../CardFrame";
import type { CardInstance } from "../../types/cards";
import {
  ART,
  RARITY_ORDER,
  RARITY_LABEL,
} from "./cardConfig";

type Grouped = Record<Rarity, CardInstance[]>;

type Props = {
  cards: CardInstance[];
};

export default function CardCollection({ cards }: Props) {
  const [view, setView] = useState<"summary" | "rarity">("summary");
  const [activeRarity, setActiveRarity] = useState<Rarity>("common");

  const grouped: Grouped = useMemo(() => {
    const map: Grouped = {
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

  function handleOpenRarity(r: Rarity) {
    setActiveRarity(r);
    setView("rarity");
  }

  /* ---------- SUMMARY VIEW (one row per rarity, including x0) ---------- */
  function renderSummary() {
    return (
      <section className="space-y-3">
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900/80 via-emerald-900/20 to-black p-4 flex justify-between items-center text-sm shadow-lg shadow-emerald-500/10">
          <div>
            <div className="text-[11px] text-emerald-300/80 uppercase tracking-wide">
              Collection Power
            </div>
            <div className="text-lg font-semibold text-emerald-200">
              {total} cards owned
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-right max-w-[120px]">
            Higher rarities boost your income more.
          </div>
        </div>

        {RARITY_ORDER.map((r) => {
          const list = grouped[r];
          const count = list.length;
          const hasAny = count > 0;

          const previewSerial = hasAny
            ? list[0].serial
            : `${RARITY_LABEL[r]} • x0`;

          return (
            <button
              key={r}
              onClick={() => handleOpenRarity(r)}
              className={`w-full text-left rounded-2xl border p-3 flex gap-3 items-center active:scale-[0.99] transition
                ${
                  hasAny
                    ? "border-white/12 bg-gradient-to-br from-slate-900/80 to-black hover:border-emerald-400/70"
                    : "border-white/5 bg-gradient-to-br from-black/80 to-slate-950/80 opacity-80"
                }`}
            >
              <div className="w-20 shrink-0">
                <CardFrame
                  rarity={r}
                  imgSrc={ART[r]}
                  serial={previewSerial}
                  className="w-full"
                />
              </div>
              <div className="flex-1 flex justify-between items-center gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {RARITY_LABEL[r]}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {hasAny
                      ? `Tap to view all ${RARITY_LABEL[r]} cards`
                      : `No ${RARITY_LABEL[r]} cards yet`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-300">
                    x{count}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>
    );
  }

  /* ---------- DETAIL VIEW (all cards of one rarity) ---------- */
  function renderRarityDetail() {
    const list = grouped[activeRarity];
    const label = RARITY_LABEL[activeRarity];

    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("summary")}
            className="px-3 py-1 rounded-xl bg-white/10 text-xs text-slate-200 active:scale-[0.97]"
          >
            ← Back
          </button>
          <h3 className="text-lg font-semibold text-emerald-300">
            {label} cards
          </h3>
        </div>

        <div className="text-xs text-slate-400 px-1 flex justify-between">
          <span>{label}</span>
          <span className="font-mono text-emerald-300">
            x{list.length}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-black p-4 text-sm text-slate-400">
            You don&apos;t own any {label} cards yet. Keep opening chests and
            chasing those drops.
          </div>
        ) : (
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
        )}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {view === "summary" ? renderSummary() : renderRarityDetail()}
    </div>
  );
}
