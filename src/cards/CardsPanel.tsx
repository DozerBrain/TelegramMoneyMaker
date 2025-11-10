import React, { useMemo, useState } from "react";
import CardFrame, { Rarity } from "../components/CardFrame";

/* ------------ Art paths (clean artworks) ------------- */
const ART: Record<Rarity, string> = {
  common: "/cards/common.jpg",
  uncommon: "/cards/uncommon.jpg",
  rare: "/cards/rare.jpg",
  epic: "/cards/epic.jpg",
  legendary: "/cards/legendary.jpg",
  mythic: "/cards/mythic.jpg",
  ultimate: "/cards/ultimate.jpg",
};

/* ------------ Serial helpers ------------- */
const PREFIX: Record<Rarity, string> = {
  common: "CM", uncommon: "UC", rare: "RR", epic: "EP", legendary: "LG", mythic: "MY", ultimate: "UL",
};
function nextSerial(r: Rarity) {
  const key = `mm_serial_${r}`;
  const n = Number(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  return `#${PREFIX[r]}-${String(n).padStart(4, "0")} | MNYMKR v1.0`;
}

/* ------------ Drop table (normalized to 100%) ------------- */
type DropRow = { r: Rarity; p: number };
const DROPS: DropRow[] = [
  { r: "ultimate",  p: 0.005 },
  { r: "mythic",    p: 0.07 },
  { r: "legendary", p: 1.0 },
  { r: "epic",      p: 3.6 },
  { r: "rare",      p: 14.6 },
  { r: "uncommon",  p: 29.3 },
  { r: "common",    p: 51.2 },
];
function rollRarity(): Rarity {
  const x = Math.random() * 100; let acc = 0;
  for (const row of DROPS) { acc += row.p; if (x <= acc) return row.r; }
  return "common";
}

/* ------------ Aura helpers (Epic+) ------------- */
function auraClassFor(r: Rarity): string | null {
  if (r === "epic") return "aura-epic";
  if (r === "legendary") return "aura-legendary";
  if (r === "mythic") return "aura-mythic";
  if (r === "ultimate") return "aura-ultimate";
  return null;
}

/* ------------ Local TabButton ------------- */
function TabButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
) {
  const { active, className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition
        ${active ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-slate-200 hover:bg-white/15"}
        ${className}`}
    />
  );
}

/* ------------ Cards grid preview ------------- */
function CardsPreviewGrid() {
  const items: { r: Rarity }[] = useMemo(
    () => (["common","uncommon","rare","epic","legendary","mythic","ultimate"] as Rarity[]).map(r=>({r})),
    []
  );
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map(({ r }) => (
        <CardFrame key={r} rarity={r} imgSrc={ART[r]} serial={nextSerial(r)} />
      ))}
    </div>
  );
}

/* ------------ Pack opener (tap-to-open every 5 taps) ------------- */
function PackOpener() {
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<Rarity | null>(null);
  const [serial, setSerial] = useState<string>("");
  const [aura, setAura] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const TAPS_TO_OPEN = 5;

  const onTap = () => {
    if (opening) return;
    setTaps((prev) => {
      const next = prev + 1;
      if (next >= TAPS_TO_OPEN) {
        openPack();
        return 0;
      }
      return next;
    });
  };

  const openPack = () => {
    setOpening(true); setResult(null); setAura(null);
    setTimeout(() => {
      const r = rollRarity(); setResult(r); setSerial(nextSerial(r));
      const cls = auraClassFor(r);
      if (cls) { setAura(cls); setTimeout(() => setAura(null), 1200); }
      setOpening(false);
    }, 800);
  };

  return (
    <div className="relative space-y-4">
      {aura && <div className={`aura-overlay ${aura}`} />}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
        <div className="text-sm text-slate-300 mb-1">Tap Counter</div>
        <div className="text-2xl font-extrabold text-emerald-400">{taps} / {TAPS_TO_OPEN}</div>
        <p className="text-xs text-slate-400 mt-1">Tap the button {Math.max(0, TAPS_TO_OPEN - taps)} more time(s) to open a pack.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-slate-300 mb-2">Drop Rates</div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          {DROPS.map((d) => (
            <div key={d.r} className="flex justify-between">
              <span className="capitalize">{d.r}</span>
              <span className="tabular-nums">{d.p}%</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onTap}
        disabled={opening}
        className={`w-full rounded-2xl py-3 text-lg font-extrabold transition 
          ${opening ? "bg-white/10 text-slate-400" : "bg-emerald-500 text-emerald-950 active:scale-[0.98]"}`}
      >
        {opening ? "Opening..." : `Tap (${taps}/${TAPS_TO_OPEN})`}
      </button>

      <div className="min-h-[420px] grid place-items-center">
        {!result && !opening && <div className="text-slate-400 text-sm">Tap {TAPS_TO_OPEN} times to open a pack.</div>}
        {result && (
          <div className="animate-in fade-in zoom-in duration-300">
            <CardFrame rarity={result} imgSrc={ART[result]} serial={serial} className="w-[260px]" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------ Exported Panel ------------- */
export default function CardsPanel() {
  const [subtab, setSubtab] = useState<"collection" | "packs">("collection");
  return (
    <div className="space-y-3 w-full">
      <div className="flex gap-2">
        <TabButton active={subtab==="collection"} onClick={()=>setSubtab("collection")}>Collection</TabButton>
        <TabButton active={subtab==="packs"} onClick={()=>setSubtab("packs")}>Packs</TabButton>
      </div>
      {subtab === "collection" ? <CardsPreviewGrid /> : <PackOpener />}
    </div>
  );
}
