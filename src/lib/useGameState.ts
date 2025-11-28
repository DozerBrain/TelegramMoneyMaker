// src/lib/useGameState.ts
import { useEffect, useMemo, useState } from "react";
import { loadSave, saveSave, defaultSave } from "./storage";
import { useInterval } from "./useInterval";
import { achievements } from "../data/achievements";
import { initTelegramUI } from "./telegram";
import { suits } from "../data/suits";
import { getEquippedPet, getEquippedSuit } from "./storage";
import { submitScore } from "./leaderboard";
import { loadCloudSave, saveCloudSave } from "./cloudSave";
import {
  computeCardMultAll,
  computeSuitMult,
  computePetMultipliers,
  TAPS_PER_COUPON,
} from "../incomeMath";

import type { Tab } from "../types";
import type { CardInstance } from "../types/cards";
import { useGameAutosave } from "./useGameAutosave";

// titles – unlock from achievements / world
import { updateTitleState } from "./storageTitles";
import { getWorldTitles } from "../data/titles";

type AchState = Record<string, { done: boolean; claimed: boolean }>;

type GameStateReturn = {
  // navigation
  tab: Tab;
  setTab: (t: Tab) => void;

  // core
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  totalEarnings: number;
  setTotalEarnings: React.Dispatch<React.SetStateAction<number>>;
  taps: number;
  setTaps: React.Dispatch<React.SetStateAction<number>>;
  tapValue: number;
  setTapValue: React.Dispatch<React.SetStateAction<number>>;
  autoPerSec: number;
  setAutoPerSec: React.Dispatch<React.SetStateAction<number>>;
  multi: number;
  setMulti: React.Dispatch<React.SetStateAction<number>>;

  // casino
  chips: number;
  setChips: React.Dispatch<React.SetStateAction<number>>;

  // long-term stats
  critChance: number;
  setCritChance: React.Dispatch<React.SetStateAction<number>>;
  critMult: number;
  setCritMult: React.Dispatch<React.SetStateAction<number>>;
  autoBonusMult: number;
  setAutoBonusMult: React.Dispatch<React.SetStateAction<number>>;
  couponBoostLevel: number;
  setCouponBoostLevel: React.Dispatch<React.SetStateAction<number>>;
  bulkDiscountLevel: number;
  setBulkDiscountLevel: React.Dispatch<React.SetStateAction<number>>;

  // suits / pets
  equippedSuitId: string | null;
  setEquippedSuitId: React.Dispatch<React.SetStateAction<string | null>>;
  bestSuitName: string;
  setBestSuitName: React.Dispatch<React.SetStateAction<string>>;
  equippedPetId: string | null;
  setEquippedPetId: React.Dispatch<React.SetStateAction<string | null>>;

  // missions / spin
  spinCooldownEndsAt: number | null;
  setSpinCooldownEndsAt: React.Dispatch<React.SetStateAction<number | null>>;

  // achievements
  achState: AchState;
  handleClaimAchievement: (id: string, reward: number) => void;

  // cards / coupons
  cards: CardInstance[];
  setCards: React.Dispatch<React.SetStateAction<CardInstance[]>>;
  couponsSpent: number;
  setCouponsSpent: React.Dispatch<React.SetStateAction<number>>;
  couponsAvailable: number;

  // multipliers
  suitMult: number;
  petTapMult: number;
  petAutoMult: number;
  cardMultAll: number;
  globalMult: number;

  // inventory helpers
  handleExport: () => void;
  handleImport: (raw: string) => void;
  handleReset: () => void;

  // taps → coupons
  effectiveTapsPerCoupon: number;
};

function buildCollectionFromCards(cards: CardInstance[]) {
  const counts = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    ultimate: 0,
  };

  for (const c of cards) counts[c.rarity]++;
  return counts;
}

export function useGameState(): GameStateReturn {
  const initial = useMemo(() => (loadSave() as any) || {}, []);

  // --- core ---
  const [balance, setBalance] = useState<number>(
    initial.balance ?? initial.score ?? 0
  );
  const [totalEarnings, setTotalEarnings] = useState<number>(
    initial.totalEarnings ?? initial.score ?? 0
  );
  const [taps, setTaps] = useState<number>(initial.taps ?? initial.tap ?? 0);
  const [tapValue, setTapValue] = useState<number>(initial.tapValue ?? 1);
  const [autoPerSec, setAutoPerSec] = useState<number>(
    initial.autoPerSec ?? 0
  );
  const [multi, setMulti] = useState<number>(initial.multi ?? 1);

  // casino
  const [chips, setChips] = useState<number>(initial.chips ?? 0);

  // long-term stats
  const [critChance, setCritChance] = useState<number>(
    initial.critChance ?? 0
  );
  const [critMult, setCritMult] = useState<number>(initial.critMult ?? 5);
  const [autoBonusMult, setAutoBonusMult] = useState<number>(
    initial.autoBonusMult ?? 1
  );
  const [couponBoostLevel, setCouponBoostLevel] = useState<number>(
    initial.couponBoostLevel ?? 0
  );
  const [bulkDiscountLevel, setBulkDiscountLevel] = useState<number>(
    initial.bulkDiscountLevel ?? 0
  );

  // suits / pets
  const [equippedSuitId, setEquippedSuitId] = useState<string | null>(
    initial.equippedSuit ?? null
  );
  const [bestSuitName, setBestSuitName] = useState<string>(
    suits.find((su) => su.id === (initial.equippedSuit ?? "starter"))?.name ??
      "Starter"
  );
  const [equippedPetId, setEquippedPetId] = useState<string | null>(
    initial.equippedPet ?? null
  );

  // missions / spin
  const [spinCooldownEndsAt, setSpinCooldownEndsAt] = useState<number | null>(
    initial.spinCooldownEndsAt ?? null
  );

  // achievements
  const [achState, setAchState] = useState<AchState>(
    initial.achievements ?? {}
  );

  // cards / coupons
  const [cards, setCards] = useState<CardInstance[]>(
    Array.isArray(initial.cards) ? initial.cards : []
  );
  const [couponsSpent, setCouponsSpent] = useState<number>(
    initial.couponsSpent ?? 0
  );

  // world map bonuses
  const [mapApsBonus, setMapApsBonus] = useState<number>(0);
  const [mapCouponBonus, setMapCouponBonus] = useState<number>(0);

  // countries owned (for world achievements / titles)
  const [countriesOwned, setCountriesOwned] = useState<number>(
    initial.countriesOwned ?? 0
  );

  // navigation
  const [tab, setTab] = useState<Tab>("home");

  // best score / leaderboard
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem("mm_best_score_v1");
      return raw ? Number(raw) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // cloud ready flag
  const [cloudReady, setCloudReady] = useState(false);

  // Telegram init
  useEffect(() => {
    initTelegramUI();
  }, []);

  // Cloud sync
  useEffect(() => {
    let cancelled = false;

    async function syncFromCloud() {
      try {
        const cloud = await loadCloudSave();
        if (cancelled) return;
        if (!cloud) return;

        const local = (loadSave() as any) || {};
        const localBest = local.totalEarnings ?? local.score ?? 0;
        const cloudBest = cloud.totalEarnings ?? cloud.score ?? 0;

        if (cloudBest < localBest) {
          saveCloudSave(local as any).catch(() => {});
          return;
        }

        setBalance(cloud.balance ?? cloud.score ?? 0);
        setTotalEarnings(cloud.totalEarnings ?? cloud.score ?? 0);
        setTaps(cloud.taps ?? cloud.tap ?? 0);
        setTapValue(cloud.tapValue ?? 1);
        setAutoPerSec(cloud.autoPerSec ?? 0);
        setMulti(cloud.multi ?? 1);
        setChips(cloud.chips ?? 0);

        setCritChance(cloud.critChance ?? 0);
        setCritMult(cloud.critMult ?? 5);
        setAutoBonusMult(cloud.autoBonusMult ?? 1);
        setCouponBoostLevel(cloud.couponBoostLevel ?? 0);
        setBulkDiscountLevel(cloud.bulkDiscountLevel ?? 0);

        setEquippedSuitId(cloud.equippedSuit ?? null);
        setEquippedPetId(cloud.equippedPet ?? null);
        setBestSuitName(cloud.bestSuitName ?? "Starter");

        setAchState(cloud.achievements ?? {});
        setCards(Array.isArray(cloud.cards) ? cloud.cards : []);
        setCouponsSpent(cloud.couponsSpent ?? 0);
        setSpinCooldownEndsAt(cloud.spinCooldownEndsAt ?? null);

        setCountriesOwned(cloud.countriesOwned ?? 0);

        setBestScore((prev) => Math.max(prev, cloudBest));

        const fixedCloud = {
          ...cloud,
          score: cloud.balance ?? cloud.score ?? 0,
          totalEarnings: cloud.totalEarnings ?? cloud.score ?? 0,
        };

        saveSave(fixedCloud as any);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCloudReady(true);
      }
    }

    syncFromCloud();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync equipped pet / suit (and countries) from storage
  useEffect(() => {
    const syncEquip = () => {
      try {
        const pet = getEquippedPet();
        const suitId = getEquippedSuit();

        if (pet !== undefined) setEquippedPetId(pet ?? null);

        if (suitId !== undefined) {
          setEquippedSuitId(suitId ?? null);
          const suit = suits.find((su) => su.id === (suitId ?? "starter"));
          if (suit) setBestSuitName(suit.name);
        }

        const s = loadSave() as any;
        if (typeof s.countriesOwned === "number") {
          setCountriesOwned(s.countriesOwned);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("mm:save", syncEquip as any);
    window.addEventListener("storage", syncEquip as any);
    syncEquip();

    return () => {
      window.removeEventListener("mm:save", syncEquip as any);
      window.removeEventListener("storage", syncEquip as any);
    };
  }, []);

  // World map bonuses + optional countries payload
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{
        apsBonus: number;
        couponBonus: number;
        countriesOwned?: number;
      }>;
      if (!ce.detail) return;
      setMapApsBonus(ce.detail.apsBonus ?? 0);
      setMapCouponBonus(ce.detail.couponBonus ?? 0);
      if (typeof ce.detail.countriesOwned === "number") {
        setCountriesOwned(ce.detail.countriesOwned);
      }
    };

    window.addEventListener("MM_MAP_BONUS", handler as EventListener);
    return () =>
      window.removeEventListener("MM_MAP_BONUS", handler as EventListener);
  }, []);

  // mirror countriesOwned into save
  useEffect(() => {
    if (!cloudReady) return;
    try {
      (saveSave as any)({ countriesOwned });
    } catch {
      // ignore
    }
  }, [cloudReady, countriesOwned]);

  // auto-unlock WORLD TITLES based on countriesOwned
  useEffect(() => {
    if (!cloudReady) return;
    if (countriesOwned <= 0) return;

    updateTitleState((prev) => {
      const worldTitles = getWorldTitles();
      const unlocked = new Set(prev.unlockedTitleIds);
      let changed = false;

      for (const t of worldTitles) {
        const need = t.worldMinOwned ?? Infinity;
        if (countriesOwned >= need && !unlocked.has(t.id)) {
          unlocked.add(t.id);
          changed = true;
        }
      }

      if (!changed) return prev;
      return {
        ...prev,
        unlockedTitleIds: Array.from(unlocked),
      };
    });
  }, [cloudReady, countriesOwned]);

  // sync achievement-based titles (for achievements claimed before titles existed)
  useEffect(() => {
    if (!cloudReady) return;

    updateTitleState((prev) => {
      const unlocked = new Set(prev.unlockedTitleIds);
      let changed = false;

      for (const a of achievements) {
        if (!a.unlockTitleId) continue;
        const st = achState[a.id];
        if (st?.claimed && !unlocked.has(a.unlockTitleId)) {
          unlocked.add(a.unlockTitleId);
          changed = true;
        }
      }

      if (!changed) return prev;
      return {
        ...prev,
        unlockedTitleIds: Array.from(unlocked),
      };
    });
  }, [cloudReady, achState]);

  // Multipliers
  const suitMult = useMemo(
    () => computeSuitMult(equippedSuitId),
    [equippedSuitId]
  );
  const { petTapMult, petAutoMult, globalMult } = useMemo(
    () => computePetMultipliers(equippedPetId),
    [equippedPetId]
  );
  const cardMultAll = useMemo(() => computeCardMultAll(cards), [cards]);

  // Coupons
  const effectiveTapsPerCoupon = useMemo(
    () => TAPS_PER_COUPON / (1 + couponBoostLevel * 0.1 + mapCouponBonus),
    [couponBoostLevel, mapCouponBonus]
  );
  const couponsEarned = useMemo(
    () => Math.floor(taps / effectiveTapsPerCoupon),
    [taps, effectiveTapsPerCoupon]
  );
  const couponsAvailable = Math.max(0, couponsEarned - couponsSpent);
  // 🔒 Safety clamp for old saves: if couponsSpent is higher than couponsEarned,
  // pull it back so new coupons can appear again.
  useEffect(() => {
    if (couponsSpent > couponsEarned) {
      setCouponsSpent(couponsEarned);
    }
  }, [couponsSpent, couponsEarned]);

  // Collection
  const collection = useMemo(
    () => buildCollectionFromCards(cards),
    [cards]
  );

  // Auto income
  useInterval(() => {
    const baseAuto = autoPerSec + mapApsBonus;
    if (baseAuto <= 0) return;

    const gain = Math.max(
      0,
      Math.floor(
        baseAuto *
          multi *
          autoBonusMult *
          suitMult *
          petAutoMult *
          cardMultAll *
          globalMult
      )
    );

    if (gain > 0) {
      setBalance((b) => b + gain);
      setTotalEarnings((t) => t + gain);
    }
  }, 1000);

  // Leaderboard autosubmit
  useEffect(() => {
    if (totalEarnings <= 0) return;

    setBestScore((prevBest) => {
      const nextBest = totalEarnings > prevBest ? totalEarnings : prevBest;

      if (nextBest !== prevBest) {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("mm_best_score_v1", String(nextBest));
          }
        } catch {
          // ignore
        }

        try {
          submitScore(nextBest).catch(() => {
            // ignore
          });
        } catch {
          // ignore
        }
      }

      return nextBest;
    });
  }, [totalEarnings]);

  // Achievements checking (includes countriesOwned)
  useEffect(() => {
    const ctx = {
      taps,
      balance,
      totalEarnings,
      bestSuitName,
      countriesOwned,
    };
    setAchState((prev) => {
      const next = { ...prev };
      for (const a of achievements) {
        if (!next[a.id]) next[a.id] = { done: false, claimed: false };
        if (!next[a.id].done && a.check(ctx as any)) {
          next[a.id] = { ...next[a.id], done: true };
        }
      }
      return next;
    });
  }, [taps, balance, totalEarnings, bestSuitName, countriesOwned]);

  // Autosave hook (local + cloud)
  useGameAutosave({
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
    // countriesOwned is persisted separately above
  });

  // Hash navigation
  useEffect(() => {
    const applyHash = () => {
      const h = (location.hash || "").toLowerCase();
      if (h.startsWith("#/leaderboard")) setTab("leaderboard");
      else if (h.startsWith("#/profile")) setTab("profile");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // MM_GOTO listener
  useEffect(() => {
    const onGoto = (e: Event) => {
      const ce = e as CustomEvent<{ goto: Tab }>;
      if (!ce.detail?.goto) return;
      setTab(ce.detail.goto);
    };
    window.addEventListener("MM_GOTO", onGoto as EventListener);
    return () =>
      window.removeEventListener("MM_GOTO", onGoto as EventListener);
  }, []);

  // export / import / reset / claim
  function handleExport() {
    try {
      const snapshot = loadSave();
      const json = JSON.stringify(snapshot, null, 2);
      navigator.clipboard.writeText(json).then(
        () => alert("Save copied to clipboard!"),
        () => {
          const blob = new Blob([json], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "moneymaker-save.json";
          a.click();
          URL.revokeObjectURL(url);
          alert("Save downloaded as moneymaker-save.json");
        }
      );
    } catch {
      alert("Could not export save.");
    }
  }

  function handleImport(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      saveSave(parsed as any);
      saveCloudSave(parsed as any).catch(() => {});
      location.reload();
    } catch {
      alert("Invalid save JSON.");
    }
  }

  function handleReset() {
    const fresh = { ...defaultSave } as any;
    saveSave(fresh);
    saveCloudSave(fresh).catch(() => {});
    location.reload();
  }

  // when achievement is claimed, also unlock its title (if any)
  function handleClaimAchievement(id: string, reward: number) {
    setAchState((prev) => {
      const st = prev[id];
      if (!st?.done || st.claimed) return prev;
      return { ...prev, [id]: { done: true, claimed: true } };
    });
    setBalance((b) => b + reward);

    const ach = achievements.find((a) => a.id === id);
    if (ach?.unlockTitleId) {
      updateTitleState((prev) => {
        if (prev.unlockedTitleIds.includes(ach.unlockTitleId!)) return prev;
        return {
          ...prev,
          unlockedTitleIds: [...prev.unlockedTitleIds, ach.unlockTitleId!],
        };
      });
    }
  }

  return {
    tab,
    setTab,
    balance,
    setBalance,
    totalEarnings,
    setTotalEarnings,
    taps,
    setTaps,
    tapValue,
    setTapValue,
    autoPerSec,
    setAutoPerSec,
    multi,
    setMulti,

    chips,
    setChips,

    critChance,
    setCritChance,
    critMult,
    setCritMult,
    autoBonusMult,
    setAutoBonusMult,
    couponBoostLevel,
    setCouponBoostLevel,
    bulkDiscountLevel,
    setBulkDiscountLevel,

    equippedSuitId,
    setEquippedSuitId,
    bestSuitName,
    setBestSuitName,
    equippedPetId,
    setEquippedPetId,

    spinCooldownEndsAt,
    setSpinCooldownEndsAt,

    achState,
    handleClaimAchievement,

    cards,
    setCards,
    couponsSpent,
    setCouponsSpent,
    couponsAvailable,

    suitMult,
    petTapMult,
    petAutoMult,
    cardMultAll,
    globalMult,

    handleExport,
    handleImport,
    handleReset,

    effectiveTapsPerCoupon,
  };
}
