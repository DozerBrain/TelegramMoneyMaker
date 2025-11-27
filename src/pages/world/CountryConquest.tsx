// src/pages/world/CountryConquest.tsx
import React, { useMemo, useState } from "react";
import {
  WorldSave,
  findCountry,
  costForCountry,
  countryBonuses,
  saveWorldSave,
} from "../../lib/worldMapLogic";
import {
  codeToFlag,
  countryNameFromCode,
  REGION_LABELS,
  getRegionForCountry,
} from "../../data/countries";

type CountryConquestProps = {
  countryCode: string;
  save: WorldSave;
  onUpdateSave: (next: WorldSave) => void;
  onClose: () => void; // go back to map / region screen
};

/**
 * CountryConquest = tap challenge to "break" the country's defense.
 * - No monsters, no characters.
 * - Player taps a big button, HP goes down.
 * - When HP reaches 0, country is added to `owned` and bonuses are applied.
 */
const CountryConquest: React.FC<CountryConquestProps> = ({
  countryCode,
  save,
  onUpdateSave,
  onClose,
}) => {
  const code = (countryCode || "US").toUpperCase();

  const meta = useMemo(() => {
    const country = findCountry(code);
    const name = countryNameFromCode(code);
    const flag = codeToFlag(code);
    const region = country ? country.region : getRegionForCountry(code);
    const regionLabel = REGION_LABELS[region];

    const ownedCount = save.owned.length;
    const baseCost = costForCountry(code, ownedCount);
    const { apsBonus, couponBonus } = countryBonuses(code);

    // HP scaling: later countries are a bit tougher, but keep it reasonable.
    // Result: usually ~80–200 taps.
    const roughDifficulty = Math.max(1, Math.floor(baseCost / 50_000));
    const maxHp = Math.min(250, Math.max(60, roughDifficulty * 40));

    return {
      name,
      flag,
      regionLabel,
      baseCost,
      apsBonus,
      couponBonus,
      maxHp,
      isOwned: save.owned.includes(code),
    };
  }, [code, save]);

  const [hp, setHp] = useState(meta.maxHp);
  const [finished, setFinished] = useState<"none" | "win" | "alreadyOwned">(
    meta.isOwned ? "alreadyOwned" : "none"
  );

  const hpPercent = Math.max(0, Math.min(100, (hp / meta.maxHp) * 100));

  function handleTap() {
    if (finished !== "none") return;

    setHp((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        handleWin();
      }
      return next;
    });
  }

  function handleWin() {
    if (finished !== "none") return;

    const alreadyOwned = save.owned.includes(code);
    if (alreadyOwned) {
      setFinished("alreadyOwned");
      return;
    }

    const updated: WorldSave = {
      ...save,
      owned: [...save.owned, code],
    };

    onUpdateSave(updated);
    saveWorldSave(updated);
    setFinished("win");
  }

  function handleClose() {
    onClose();
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.flag}</span>
          <div>
            <div className="text-lg font-semibold tracking-wide">
              {meta.name}
            </div>
            <div className="text-xs text-slate-400 uppercase">
              {meta.regionLabel}
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="px-3 py-1 text-xs rounded-full border border-slate-700 hover:bg-slate-800 active:scale-95"
        >
          Back
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-4 py-3 gap-4">
        {/* HP bar */}
        <div className="bg-slate-900 rounded-2xl p-4 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-200">
              Country Defense
            </span>
            <span className="text-xs text-slate-400">
              {hp}/{meta.maxHp} HP
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tap to break through this country's defenses. Every tap deals 1
            damage.
          </div>
        </div>

        {/* Rewards preview */}
        <div className="bg-slate-900 rounded-2xl p-4 space-y-2">
          <div className="text-sm font-semibold text-slate-100">
            Conquest Rewards (Passive)
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">APS Bonus</span>
            <span className="text-emerald-400 font-medium">
              +{meta.apsBonus.toFixed(1)} APS
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Coupon Boost</span>
            <span className="text-emerald-400 font-medium">
              +{(meta.couponBonus * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Country cost (for difficulty)</span>
            <span>${meta.baseCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Status */}
        {finished === "alreadyOwned" && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-3 py-2">
            You already control this country. Conquest complete.
          </div>
        )}
        {finished === "win" && (
          <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-3 py-2">
            Country conquered! Its APS and coupon bonuses are now active.
          </div>
        )}

        {/* Tap button */}
        <div className="mt-auto pb-4">
          <button
            onClick={handleTap}
            disabled={finished !== "none"}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-semibold text-sm tracking-wide shadow-lg active:scale-95 disabled:opacity-60 disabled:active:scale-100"
          >
            {finished === "none"
              ? "TAP TO ATTACK"
              : finished === "win"
              ? "CONQUERED"
              : "ALREADY OWNED"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryConquest;
