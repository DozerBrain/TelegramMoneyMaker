// src/cards/CardsModal.tsx
import React, { useMemo, useState } from "react";

type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "ultimate";

type Card = {
  id: number;
  rarity: Rarity;
  name: string;
  image: string;      // /cards/<name>.png
  weight: number;     // drop weight (relative)
};

// 🔹 Rarity config: images must exist in /public/cards/
const ALL_CARDS: Card[] = [
  { id: 1, rarity: "common",    name: "Common",    image: "/cards/common.png",    weight: 5120 },
  { id: 2, rarity: "uncommon",  name: "Uncommon",  image: "/cards/uncommon.png",  weight: 2930 },
  { id: 3, rarity: "rare",      name: "Rare",      image: "/cards/rare.png",      weight: 1460 },
  { id: 4, rarity: "epic",      name: "Epic",      image: "/cards/epic.png",      weight: 360  },
  { id: 5, rarity: "legendary", name: "Legendary", image: "/cards/legendary.png", weight: 100  },
  { id: 6, rarity: "mythic",    name: "Mythic",    image: "/cards/mythic.png",    weight: 7    },
  { id: 7, rarity: "ultimate",  name: "Ultimate",  image: "/cards/ultimate.png",  weight: 0.5  },
];

// Small helpers
function pickWeighted(cards: Card[]) {
  const total = cards.reduce((s, c) => s + c.weight, 0);
  const r = Math.random() * total;
  let cum = 0;
  for (const c of cards) {
    cum += c.weight;
    if (r <= cum) return c;
  }
  return cards[0];
}

function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function CardsModal({ onClose }: { onClose: () => void }) {
  // UI state
  const [tab, setTab] = useState<"collection" | "packs">("packs");
  const [tapCount, setTapCount] = useState(0); // 0..5 inside the modal
  const [lastDrop, setLastDrop] = useState<Card | null>(null);

  // Simple collection: rarity => count
  const [collection, setCollection] = useState<Record<Rarity, number>>({
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    ultimate: 0,
  });

  // Aggregate display list for collection grid
  const displayCards = useMemo(() => {
    const firstPerRarity = new Map<Rarity, Card>();
    for (const c of ALL_CARDS) if (!firstPerRarity.has(c.rarity)) firstPerRarity.set(c.rarity, c);
    return Array.from(firstPerRarity.values());
  }, []);

  // Tap button: count to 5 → open pack → reveal
  function handleTap() {
    if (tapCount < 4) {
      setTapCount(tapCount + 1);
      return;
    }
    // Open pack on 5th tap
    const drop = pickWeighted(ALL_CARDS);
    setLastDrop(drop);
    setTapCount(0);
    setCollection((prev) => ({ ...prev, [drop.rarity]: (prev[drop.rarity] ?? 0) + 1 }));
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-900 text-white shadow-xl ring-1 ring-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-lg font-bold">Cards</div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-3">
          <button
            onClick={() => setTab("collection")}
            className={cls(
              "px-3 py-1.5 rounded-lg text-sm",
              tab === "collection" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 hover:bg-white/10"
            )}
          >
            Collection
          </button>
          <button
            onClick={() => setTab("packs")}
            className={cls(
              "px-3 py-1.5 rounded-lg text-sm",
              tab === "packs" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 hover:bg-white/10"
            )}
          >
            Packs
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {tab === "packs" ? (
            <div className="space-y-4">
              {/* Tap Counter */}
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-center text-sm opacity-80 mb-1">Tap Counter</div>
                <div className="text-center text-3xl font-extrabold text-emerald-300">
                  {tapCount} <span className="opacity-60">/ 5</span>
                </div>
                <div className="text-center text-xs opacity-70 mt-1">
                  Tap the button {5 - tapCount} more time(s) to open a pack.
                </div>
              </div>

              {/* Drop Rates */}
              <div className="rounded-xl bg-white/5 p-4">
                <div className="font-semibold mb-2">Drop Rates</div>
                <div className="grid grid-cols-2 gap-y-1 text-sm opacity-90">
                  <div>Ultimate</div><div className="text-right">0.005%</div>
                  <div>Mythic</div><div className="text-right">0.07%</div>
                  <div>Legendary</div><div className="text-right">1.0%</div>
                  <div>Epic</div><div className="text-right">3.6%</div>
                  <div>Rare</div><div className="text-right">14.6%</div>
                  <div>Uncommon</div><div className="text-right">29.3%</div>
                  <div>Common</div><div className="text-right">51.2%</div>
                </div>
              </div>

              {/* Tap/Open button */}
              <button
                onClick={handleTap}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition px-4 py-3 font-semibold"
              >
                Tap ({tapCount}/5)
              </button>

              {/* Reveal */}
              {lastDrop && (
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <div className="text-xs opacity-70">You opened a pack and got:</div>
                  <div className="text-lg font-bold mt-1">{lastDrop.name}</div>
                  <img
                    src={lastDrop.image}
                    alt={lastDrop.name}
                    className="w-40 h-40 object-contain mx-auto mt-3 rounded-lg"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ) : (
            // Collection tab
            <div className="space-y-3">
              <div className="text-sm opacity-80">
                Your cards by rarity. (Images are your transparent PNGs from <code>/public/cards/</code>.)
              </div>
              <div className="grid grid-cols-3 gap-3">
                {displayCards.map((c) => (
                  <div key={c.rarity} className="rounded-xl bg-white/5 p-2 text-center">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-20 h-20 object-contain mx-auto rounded-md"
                      draggable={false}
                    />
                    <div className="mt-1 text-xs opacity-80">{c.name}</div>
                    <div className="text-sm font-semibold">
                      × {collection[c.rarity] ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
