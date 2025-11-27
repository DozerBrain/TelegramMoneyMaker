// src/pages/world/CountryList.tsx
import React, { useMemo } from "react";
import {
  COUNTRIES,
  REGIONS,
  type Country,
  type RegionId,
} from "../../data/countries";
import {
  costForCountry,
  countryBonuses,
} from "../../lib/worldMapLogic";
import { formatMoneyShort } from "../../lib/format";

type Props = {
  selectedRegion: RegionId;
  ownedSet: Set<string>;
  worldOwnedCount: number;
  balance: number;
  onBuy: (code: string) => void; // now: start conquest for this country
};

export default function CountryList({
  selectedRegion,
  ownedSet,
  worldOwnedCount,
  balance,
  onBuy,
}: Props) {
  const countriesInSelectedRegion = useMemo<Country[]>(
    () => COUNTRIES.filter((c) => c.region === selectedRegion),
    [selectedRegion]
  );

  return (
    <>
      <div className="mb-2 text-[11px] text-white/60">
        Countries in{" "}
        <span className="text-emerald-400 font-semibold">
          {REGIONS.find((r) => r.id === selectedRegion)?.label ??
            selectedRegion}
        </span>
      </div>

      <div className="rounded-2xl bg-zinc-900/80 border border-white/10 max-h-[50vh] overflow-y-auto">
        {countriesInSelectedRegion.length === 0 ? (
          <div className="px-4 py-6 text-sm text-white/60 text-center">
            No countries defined for this region yet.
          </div>
        ) : (
          countriesInSelectedRegion.map((c, index) => {
            const owned = ownedSet.has(c.code.toUpperCase());

            // 🔥 Each next country in the list is more expensive.
            // We use worldOwnedCount + index so prices climb visually down the list.
            const cost = costForCountry(c.code, worldOwnedCount + index);

            const { apsBonus, couponBonus } = countryBonuses(c.code);

            return (
              <div
                key={c.code}
                className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate">{c.name}</span>
                    <span className="text-[10px] text-white/50">
                      {c.code} · +{apsBonus.toFixed(1)} APS · +
                      {(couponBonus * 100).toFixed(1)}% coupons
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    ${formatMoneyShort(cost)}
                  </div>

                  {owned ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[10px] text-emerald-300">
                      OWNED
                    </span>
                  ) : (
                    <button
                      onClick={() => onBuy(c.code)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 disabled:bg-zinc-700 disabled:text-white/40"
                      disabled={balance < cost}
                    >
                      {balance < cost ? "Too expensive" : "Conquer"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 text-[10px] text-white/40">
        Tip: once you own all countries in a region, nearby regions will unlock
        and appear on the map. Later countries in each region cost more, but
        conquering them also pushes you toward higher world ranks with stronger
        bonuses.
      </div>
    </>
  );
}
