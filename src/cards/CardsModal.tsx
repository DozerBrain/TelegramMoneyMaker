import React from "react";
import CardsPanel from "./CardsPanel";

type Props = { open: boolean; onClose: () => void };

export default function CardsModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0b1220] p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-extrabold">Cards</h2>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/15">Close</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <CardsPanel />
        </div>
      </div>
    </div>
  );
}
