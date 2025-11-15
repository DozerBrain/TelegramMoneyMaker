// src/pages/Shop.tsx
import React from "react";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance: number;
  setBalance: (v: number | ((p: number) => number)) => void;

  tapValue: number;
  setTapValue: (v: number | ((p: number) => number)) => void;

  autoPerSec: number;
  setAutoPerSec: (v: number | ((p: number) => number)) => void;

  multi: number;
  setMulti: (v: number | ((p: number) => number)) => void;
};

type UpgradeProps = {
  title: string;
  description: string;
  price: number;
  disabled?: boolean;
  onBuy: () => void;
};

function UpgradeCard({ title, description, price, disabled, onBuy }: UpgradeProps) {
  const canAfford = !disabled;

  return (
    <div className="rounded-3xl bg-zinc-900/80 px-4 py-3 flex items-center justify-between mb-3">
      <div className="flex flex-col">
        <span className="text-white font-semibold text-base">{title}</span>
        <span className="text-xs text-zinc-400 mt-0.5">{description}</span>
      </div>
      <button
        onClick={onBuy}
        disabled={!canAfford}
        className={
          "px-3 py-2 rounded-2xl text-sm font-semibold min-w-[90px] text-center " +
          (canAfford
            ? "bg-emerald-500 text-emerald-950 active:scale-[0.97] transition"
            : "bg-zinc-700/70 text-zinc-400 cursor-not-allowed")
        }
      >
        ${formatMoneyShort(price)}
      </button>
    </div>
  );
}

export default function Shop({
  balance,
  setBalance,
  tapValue,
  setTapValue,
  autoPerSec,
  setAutoPerSec,
  multi,
  setMulti,
}: Props) {
  const priceTap1 = 100;
  const priceTap5 = 1_000;
  const priceAuto1 = 5_000;
  const priceMult15 = 25_000;
  const priceMult2 = 250_000;

  const canBuy = (cost: number) => balance >= cost;

  const buy = (cost: number, action: () => void) => {
    if (!canBuy(cost)) return;
    setBalance((b) => b - cost);
    action();
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 rounded-3xl bg-zinc-800/90 px-4 py-3 flex items-center justify-between">
        <span className="text-zinc-300 text-sm">Balance:</span>
        <span className="text-white font-semibold text-sm">
          ${formatMoneyShort(balance)}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-white mb-3">Upgrades</h2>

      <UpgradeCard
        title="+1 per tap"
        description="Increase tap value by 1"
        price={priceTap1}
        disabled={!canBuy(priceTap1)}
        onBuy={() => buy(priceTap1, () => setTapValue((v) => v + 1))}
      />

      <UpgradeCard
        title="+5 per tap"
        description="Increase tap value by 5"
        price={priceTap5}
        disabled={!canBuy(priceTap5)}
        onBuy={() => buy(priceTap5, () => setTapValue((v) => v + 5))}
      />

      <UpgradeCard
        title="+1 auto / sec"
        description="Earn passively each second"
        price={priceAuto1}
        disabled={!canBuy(priceAuto1)}
        onBuy={() => buy(priceAuto1, () => setAutoPerSec((v) => v + 1))}
      />

      <UpgradeCard
        title="x1.5 multiplier"
        description="Multiply all earnings"
        price={priceMult15}
        disabled={!canBuy(priceMult15)}
        onBuy={() => buy(priceMult15, () => setMulti((v) => v * 1.5))}
      />

      <UpgradeCard
        title="x2 multiplier"
        description="Big boost to all earnings"
        price={priceMult2}
        disabled={!canBuy(priceMult2)}
        onBuy={() => buy(priceMult2, () => setMulti((v) => v * 2))}
      />
    </div>
  );
}
