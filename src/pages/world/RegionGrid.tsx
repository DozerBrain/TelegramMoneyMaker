// src/pages/world/RegionGrid.tsx
import React, { useMemo } from "react";
import { COUNTRIES, REGIONS, type RegionId } from "../../data/countries";

type Props = {
  selectedRegion: RegionId;
  unlockedRegions: RegionId[];
  onSelectRegion: (region: RegionId) => void;
};

export default function RegionGrid({
  selectedRegion,
  unlockedRegions,
  onSelectRegion,
}: Props) {
  const unlockedRegionSet = useMemo(
    () => new Set(unlockedRegions),
    [unlockedRegions]
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-3 mb-4">
      <div className="text-[11px] text-white/60 mb-2">
        Tap a region to focus it. Locked regions are hidden in the fog with ?.
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {REGIONS.map((r) => {
          const isUnlocked = unlockedRegionSet.has(r.id);
          const isSelected = selectedRegion === r.id;

          if (!isUnlocked) {
            return (
              <div
                key={r.id}
                className="relative rounded-xl bg-black/70 border border-white/10 flex items-center justify-center h-16"
              >
                <span className="text-2xl">?</span>
                <span className="absolute bottom-1 text-[9px] text-white/40">
                  {r.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={r.id}
              onClick={() => onSelectRegion(r.id)}
              className={`rounded-xl h-16 border flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-emerald-600/80 border-emerald-300 shadow-lg shadow-emerald-500/30"
                  : "bg-zinc-900/80 border-white/15"
              }`}
            >
              <span className="text-[11px] font-semibold">{r.label}</span>
              <span className="text-[9px] text-white/60 mt-1">
                {COUNTRIES.filter((c) => c.region === r.id).length} countries
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
