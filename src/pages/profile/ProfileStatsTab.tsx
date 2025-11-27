// src/pages/profile/ProfileStatsTab.tsx
import React from "react";
import { formatMoneyShort } from "../../lib/format";

type Props = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;
};

const fmtMoney = (n: number) => `$${formatMoneyShort(Math.floor(n))}`;
const fmtAps = (n: number) => `$${formatMoneyShort(Math.floor(n))}/s`;
const fmtInt = (n: number) => n.toLocaleString("en-US");
const fmtMultiplier = (m: number) => `x${formatMoneyShort(m)}`;

export default function ProfileStatsTab({
  balance,
  totalEarnings,
  taps,
  tapValue,
  autoPerSec,
  multi,
}: Props) {
  return (
    <>
      <h2 className="text-sm font-semibold text-white/80 mb-2">Stats</h2>
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Balance</div>
          <div className="font-semibold">{fmtMoney(balance)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Total earned</div>
          <div className="font-semibold">{fmtMoney(totalEarnings)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Taps</div>
          <div className="font-semibold">{fmtInt(taps)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Tap value</div>
          <div className="font-semibold">{fmtMoney(tapValue)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">APS</div>
          <div className="font-semibold">{fmtAps(autoPerSec)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Multiplier</div>
          <div className="font-semibold">{fmtMultiplier(multi)}</div>
        </div>
      </div>
    </>
  );
}
