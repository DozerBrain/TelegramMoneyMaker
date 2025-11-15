// src/pages/Shop.tsx
import React from "react";
import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance: number;
  setBalance: (n: number) => void;

  tapValue: number;
  setTapValue: (n: number) => void;

  autoPerSec: number;
  setAutoPerSec: (n: number) => void;

  multi: number;
  setMulti: (n: number) => void;
};

type Upgrade = {
  id: string;
  title: string;
  desc: string;
  cost: number;
  buy: () => void;
};

const MAX_MULTI = 1000; // hard cap so it never goes insane again

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
  // ---- Dynamic costs (balanced for long-term play) ----
  const costTap1 = Math.max(100, tapValue * 100); // +1 tap
  const costTap5 = Math.max(1000, tapValue * 400); // +5 tap
  const costAuto1 = Math.max(5000, (autoPerSec + 1) * 2500); // +1 APS

  // Multiplier upgrades get expensive fast
  const costMultSmall = Math.max(25_000, Math.floor(multi * 50_000)); // +0.5x
  const costMultBig = Math.max(250_000, Math.floor(multi * 200_000)); // +1x

  const upgrades: Upgrade[] = [
    {
      id: "tap+1",
      title: "+1 per tap",
      desc: "Increase tap value by 1",
      cost: costTap1,
      buy: () => setTapValue(tapValue + 1),
    },
    {
      id: "tap+5",
      title: "+5 per tap",
      desc: "Increase tap value by 5",
      cost: costTap5,
      buy: () => setTapValue(tapValue + 5),
    },
    {
      id: "auto+1",
      title: "+1 auto / sec",
      desc: "Earn passively each second",
      cost: costAuto1,
      buy: () => setAutoPerSec(autoPerSec + 1),
    },
    {
      id: "mult+0.5",
      title: "+0.5x multiplier",
      desc: "Increase all earnings by 50%",
      cost: costMultSmall,
      buy: () =>
        setMulti(
          Math.min(
            MAX_MULTI,
            // additive instead of multiplicative
            parseFloat((multi + 0.5).toFixed(2))
          )
        ),
    },
    {
      id: "mult+1",
      title: "+1x multiplier",
      desc: "Big boost to all earnings",
      cost: costMultBig,
      buy: () =>
        setMulti(
          Math.min(
            MAX_MULTI,
            parseFloat((multi + 1).toFixed(2))
          )
        ),
    },
  ];

  function handleBuy(u: Upgrade) {
    if (balance < u.cost) return;
    setBalance(balance - u.cost);
    u.buy();
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Card
        title="Upgrades"
        right={
          <span className="text-sm text-emerald-300">
            Balance: ${formatMoneyShort(balance)}
          </span>
        }
      >
        <div className="space-y-3">
          {upgrades.map((u) => {
            const affordable = balance >= u.cost;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
              >
                <div className="text-sm">
                  <div className="font-semibold text-white">{u.title}</div>
                  <div className="text-xs text-white/60">{u.desc}</div>
                </div>
                <button
                  onClick={() => handleBuy(u)}
                  disabled={!affordable}
                  className={`min-w-[90px] px-4 py-2 rounded-full text-sm font-semibold
                    ${
                      affordable
                        ? "bg-emerald-500 text-emerald-950 active:scale-[0.97]"
                        : "bg-zinc-700 text-zinc-400 opacity-60"
                    }`}
                >
                  ${formatMoneyShort(u.cost)}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
