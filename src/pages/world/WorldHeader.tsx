// src/pages/world/WorldHeader.tsx
import React from "react";

type Props = {
  apsBonusTotal: number;
  couponBonusTotal: number;
};

export default function WorldHeader({
  apsBonusTotal,
  couponBonusTotal,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-sm font-semibold text-emerald-400">
          World Map
        </div>
        <div className="text-[11px] text-white/60">
          Conquer countries to boost APS & coupons.
        </div>
      </div>
      <div className="text-right text-xs">
        <div className="text-white/60">Map APS bonus</div>
        <div className="text-emerald-400 font-semibold">
          +{apsBonusTotal.toFixed(1)} APS
        </div>
        <div className="mt-1 text-white/60">Map coupon bonus</div>
        <div className="text-emerald-400 font-semibold">
          +{(couponBonusTotal * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
