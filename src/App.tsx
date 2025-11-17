// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";

// UI
import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Spin from "./pages/Spin";
import More from "./pages/More";
import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import PetsPage from "./pages/Pets";
import SuitsPage from "./pages/Suits";
import CardsPage from "./pages/Cards";

// Storage / helpers
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";
import { initTelegramUI } from "./lib/telegram";
import { suits } from "./data/suits";
import { getEquippedPet, getEquippedSuit } from "./lib/storage";
import { submitScore } from "./lib/leaderboard";

// Central income math
import {
  computeCardMultAll,
  computeSuitMult,
  computePetMultipliers,
  TAPS_PER_COUPON,
} from "./incomeMath";

// Types
import type { Tab } from "./types";
import type { Rarity as CardRarity } from "./components/CardFrame";

export type CardInstance = {
  id: string;
  rarity: CardRarity;
  serial: string;
  obtainedAt: number;
};

/** Build legacy collection counts from NFT-style cards */
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

  for (const c of cards) {
    counts[c.rarity]++;
  }
  return counts;
}

export default function App() {
  // Load save once
  const initial = useMemo(() => (loadSave() as any) || {}, []);

  // Core state
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

  // 🔥 New long-term stats
  const [critChance, setCritChance] = useState<number>(
    initial.critChance ?? 0
  ); // stored as fraction (0.05 = 5%)
  const [critMult, setCritMult] = useState<number>(initial.critMult ?? 5); // x5 base
  const [autoBonusMult, setAutoBonusMult] = useState<number>(
    initial.autoBonusMult ?? 1
  ); // 1.0 = no bonus
  const [couponBoostLevel, setCouponBoostLevel] = useState<number>(
    initial.couponBoostLevel ?? 0
  ); // each level = +10% coupon gain
  const [bulkDiscountLevel, setBulkDiscountLevel] = useState<number>(
    initial.bulkDiscountLevel ?? 0
  ); // each level reduces 10-card chest cost by 1 (min 5)

  // Suits / pets
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

  // Spin
  const [spinCooldownEndsAt, setSpinCooldownEndsAt] = useState<number | null>(
    initial.spinCooldownEndsAt ?? null
  );

  // Achievements
  const [achState, setAchState] = useState<
    Record<string, { done: boolean; claimed: boolean }>
  >(initial.achievements ?? {});

  // Cards / coupons
  const [cards, setCards] = useState<CardInstance[]>(
    Array.isArray(initial.cards) ? initial.cards : []
  );
  const [couponsSpent, setCouponsSpent] = useState<number>(
    initial.couponsSpent ?? 0
  );

  // Tabs
  const [tab, setTab] = useState<Tab>("home");

  // Telegram init
  useEffect(() => {
    initTelegramUI();
  }, []);

  // Sync equipped pet / suit from storage events (Pets/Suits pages)
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

  // Coupons – with coupon generator bonus
  const effectiveTapsPerCoupon = useMemo(
    () => TAPS_PER_COUPON / (1 + couponBoostLevel * 0.1),
    [couponBoostLevel]
  );
  const couponsEarned = useMemo(
    () => Math.floor(taps / effectiveTapsPerCoupon),
    [taps, effectiveTapsPerCoupon]
  );
  const couponsAvailable = Math.max(0, couponsEarned - couponsSpent);

  // Auto income (includes autoBonusMult now)
  useInterval(() => {
    if (autoPerSec <= 0) return;

    const gain = Math.max(
      0,
      Math.floor(
        autoPerSec *
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

  // 🔥 Auto-submit score to leaderboard EVERY time totalEarnings changes
  useEffect(() => {
    if (totalEarnings <= 0) return;

    try {
      // submitScore reads profile (uid, name, country) from moneymaker_profile_v1
      submitScore(totalEarnings).catch(() => {
        // ignore network errors for now
      });
    } catch {
      // ignore
    }
  }, [totalEarnings]);

  // Achievements checking
  useEffect(() => {
    const ctx = { taps, balance, totalEarnings, bestSuitName };
    setAchState((prev) => {
      const next = { ...prev };
      for (const a of achievements) {
        if (!next[a.id]) next[a.id] = { done: false, claimed: false };
        if (!next[a.id].done && a.check(ctx)) {
          next[a.id] = { ...next[a.id], done: true };
        }
      }
      return next;
    });
  }, [taps, balance, totalEarnings, bestSuitName]);

  // Save game (merge with existing save, never wipe)
  useEffect(() => {
    const prev: any = (loadSave() as any) ?? {};
    const collection = buildCollectionFromCards(cards);

    saveSave({
      ...prev,

      // Legacy fields
      score: balance,
      tap: taps,

      // Core
      balance,
      totalEarnings,
      taps,
      tapValue,
      autoPerSec,
      multi,

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

      // Spin & profile
      spinCooldownEndsAt,
      profile: prev.profile ?? defaultSave.profile,
    });
  }, [
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
    couponsSpent,
    spinCooldownEndsAt,
  ]);

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

  // Quick nav events (Cards / Suits / Pets)
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

  // Handlers for More page
  function handleExport() {
    try {
      const snapshot = loadSave();
      const json = JSON.stringify(snapshot, null, 2);
      navigator.clipboard.writeText(json).then(
        () => alert("Save copied to clipboard!"),
        () => {
          const blob = new Blob([json], { type: "application/json" });
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
      location.reload();
    } catch {
      alert("Invalid save JSON.");
    }
  }

  function handleReset() {
    saveSave({ ...defaultSave } as any);
    location.reload();
  }

  function handleClaimAchievement(id: string, reward: number) {
    setAchState((prev) => {
      const st = prev[id];
      if (!st?.done || st.claimed) return prev;
      return { ...prev, [id]: { done: true, claimed: true } };
    });
    setBalance((b) => b + reward);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f13]">
      <TopBar taps={taps} tapValue={tapValue} autoPerSec={autoPerSec} />

      <main className="flex-1">
        {tab === "home" && (
          <Home
            balance={balance}
            setBalance={setBalance}
            totalEarnings={totalEarnings}
            setTotalEarnings={setTotalEarnings}
            taps={taps}
            setTaps={setTaps}
            tapValue={tapValue}
            multi={multi}
            currentSuitName={bestSuitName}
            setCurrentSuitName={setBestSuitName}
            suitMult={suitMult}
            petTapMult={petTapMult}
            cardMultAll={cardMultAll}
            globalMult={globalMult}
            equippedPetId={equippedPetId}
            critChance={critChance}
            critMult={critMult}
          />
        )}

        {tab === "shop" && (
          <Shop
            balance={balance}
            setBalance={setBalance}
            tapValue={tapValue}
            setTapValue={setTapValue}
            autoPerSec={autoPerSec}
            setAutoPerSec={setAutoPerSec}
            multi={multi}
            setMulti={setMulti}
            critChance={critChance}
            setCritChance={setCritChance}
            critMult={critMult}
            setCritMult={setCritMult}
            autoBonusMult={autoBonusMult}
            setAutoBonusMult={setAutoBonusMult}
            couponBoostLevel={couponBoostLevel}
            setCouponBoostLevel={setCouponBoostLevel}
            bulkDiscountLevel={bulkDiscountLevel}
            setBulkDiscountLevel={setBulkDiscountLevel}
          />
        )}

        {tab === "spin" && (
          <Spin
            balance={balance}
            setBalance={setBalance}
            tapValue={tapValue}
            setTapValue={setTapValue}
            autoPerSec={autoPerSec}
            setAutoPerSec={setAutoPerSec}
            multi={multi}
            setMulti={setMulti}
            spinCooldownEndsAt={spinCooldownEndsAt}
            setSpinCooldownEndsAt={setSpinCooldownEndsAt}
          />
        )}

        {tab === "leaderboard" && <LeaderboardPage />}
        {tab === "profile" && <ProfilePage />}
        {tab === "suits" && <SuitsPage balance={balance} />}
        {tab === "pets" && <PetsPage />}

        {tab === "cards" && (
          <CardsPage
            taps={taps}
            cards={cards}
            setCards={setCards}
            couponsAvailable={couponsAvailable}
            couponsSpent={couponsSpent}
            setCouponsSpent={setCouponsSpent}
            tapsPerCoupon={TAPS_PER_COUPON}
            bulkDiscountLevel={bulkDiscountLevel}
          />
        )}

        {tab === "more" && (
          <More
            balance={balance}
            totalEarnings={totalEarnings}
            taps={taps}
            tapValue={tapValue}
            autoPerSec={autoPerSec}
            multi={multi}
            achievementsState={achState}
            onClaim={handleClaimAchievement}
            onReset={handleReset}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </main>

      <Tabs active={tab} onChange={setTab} />
    </div>
  );
}
