// src/lib/useGameAutosave.ts
import { useEffect } from "react";
import { loadSave, saveSave, defaultSave } from "./storage";
import { saveCloudSave } from "./cloudSave";

type SaveInputs = {
  cloudReady: boolean;

  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;

  critChance: number;
  critMult: number;
  autoBonusMult: number;
  couponBoostLevel: number;
  bulkDiscountLevel: number;

  bestSuitName: string;
  equippedSuitId: string | null;
  equippedPetId: string | null;

  achState: Record<string, { done: boolean; claimed: boolean }>;
  cards: any[]; // CardInstance[] but we keep it generic here
  collection: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
    ultimate: number;
  };

  couponsSpent: number;
  spinCooldownEndsAt: number | null;
  chips: number;
};

export function useGameAutosave(inputs: SaveInputs) {
  const {
    cloudReady,
    balance,
    totalEarnings,
    taps,
    tapValue,
    autoPerSec,
    multi,
    critChance,
    critMult,
    autoBonusMult,
    couponBoostLevel,
    bulkDiscountLevel,
    bestSuitName,
    equippedSuitId,
    equippedPetId,
    achState,
    cards,
    collection,
    couponsSpent,
    spinCooldownEndsAt,
    chips,
  } = inputs;

  useEffect(() => {
    if (!cloudReady) return;

    // wait 1.2s after last change before saving
    const handle = window.setTimeout(() => {
      const prev: any = (loadSave() as any) ?? {};

      // safety: avoid NaN / Infinity corrupting the save
      const safeBalance = Number.isFinite(balance) ? balance : 0;
      const safeTotal = Number.isFinite(totalEarnings) ? totalEarnings : 0;
      const safeTaps = Number.isFinite(taps) ? taps : 0;
      const safeChips = Number.isFinite(chips) ? chips : 0;

      const next: any = {
        ...prev,

        // Legacy fields
        score: safeBalance,
        tap: safeTaps,

        // Core
        balance: safeBalance,
        totalEarnings: safeTotal,
        taps: safeTaps,
        tapValue,
        autoPerSec,
        multi,

        // Casino
        chips: safeChips,

        // New stats
        critChance,
        critMult,
        autoBonusMult,
        couponBoostLevel,
        bulkDiscountLevel,

        // Suits / pets
        bestSuitName,
        equippedSuit: equippedSuitId ?? prev.equippedSuit ?? null,
        equippedPet: equippedPetId ?? prev.equippedPet ?? null,

        // Progression
        achievements: achState,
        quests: prev.quests ?? [],

        // Cards
        cards,
        collection,
        couponsSpent,

        // Missions & profile
        spinCooldownEndsAt,
        profile: prev.profile ?? defaultSave.profile,
      };

      // Local save
      saveSave(next);

      // Cloud save (fire and forget)
      saveCloudSave(next).catch(() => {
        // ignore network errors
      });
    }, 1200);

    return () => {
      window.clearTimeout(handle);
    };
  }, [
    cloudReady,
    balance,
    totalEarnings,
    taps,
    tapValue,
    autoPerSec,
    multi,
    critChance,
    critMult,
    autoBonusMult,
    couponBoostLevel,
    bulkDiscountLevel,
    bestSuitName,
    equippedSuitId,
    equippedPetId,
    achState,
    cards,
    collection,
    couponsSpent,
    spinCooldownEndsAt,
    chips,
  ]);
}
