// src/cards/CardsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { CARDS } from "../data/cards";
import { StorageAPI } from "../lib/storage";

type Rarity = typeof CARDS[number]["rarity"];

export default function CardsModal({ onClose }: { onClose: () => void }) {
  const [tap, setTap] = useState<number>(StorageAPI.getTap());
  const [lastDrop, setLastDrop] = useState<any>(StorageAPI.getLastDrop());
  const [collection, setCollection] = useState<Record<Rarity, number>>(StorageAPI.getCollection());

  // keep in sync with events from Home
  useEffect(() => {
    const onUpd = (e: any) => setTap(e.detail.tap);
    const onOpen = (e: any) => {
      const card = e.detail.card;
      setLastDrop(card);
      setCollection(StorageAPI.getCollection());
    };
    window.addEventListener("pack:update", onUpd as any);
    window.addEventListener("pack:opened", onOpen as any);
    return () => {
      window.removeEventListener("pack:update", onUpd as any);
      window.removeEventListener("pack:opened", onOpen as any);
    };
  }, []);

  const display = useMemo(() => {
    const first = new Map<Rarity, (typeof CARDS)[number]>();
    for (const c of CARDS) if (!first.has(c.rarity)) first.set(c.rarity, c);
    return Array.from(first.values());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 text-white shadow-xl ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-lg font-bold">Cards</div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">Close</button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Progress (driven by MAIN tap) */}
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <div className="text-sm opacity-80">Pack progress</div>
            <div className="text-3xl font-extrabold text-emerald-300">
              {tap} <span className="opacity-60">/ 5</span>
            </div>
            <div className="text-xs opacity-70 mt-1">Tap on the Home screen to fill this.</div>
          </div>

          {/* Reveal area */}
          {lastDrop && (
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xs opacity-70">Last drop</div>
              <div className="text-lg font-bold mt-1">{lastDrop.name}</div>
              <img src={lastDrop.image} alt={lastDrop.name} className="w-40 h-40 object-contain mx-auto mt-3 rounded-lg" />
            </div>
          )}

          {/* Collection grid */}
          <div className="rounded-xl bg-white/5 p-4">
            <div className="font-semibold mb-2">Collection</div>
            <div className="grid grid-cols-3 gap-3">
              {display.map((c) => (
                <div key={c.rarity} className="rounded-xl bg-white/5 p-2 text-center">
                  <img src={c.image} alt={c.name} className="w-20 h-20 object-contain mx-auto rounded-md" />
                  <div className="mt-1 text-xs opacity-80">{c.name}</div>
                  <div className="text-sm font-semibold">× {collection[c.rarity] ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
