// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";

// UI
import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";
import AppBackground from "./components/AppBackground";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Spin from "./pages/Spin";
import InventoryPage from "./pages/Inventory";
import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import PetsPage from "./pages/Pets";
import SuitsPage from "./pages/Suits";
import CardsPage from "./pages/Cards";
import WorldMapPage from "./pages/WorldMap";

// Storage / helpers
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";
import { initTelegramUI } from "./lib/telegram";
import { suits } from "./data/suits";
import { getEquippedPet, getEquippedSuit } from "./lib/storage";
import { submitScore } from "./lib/leaderboard";
import { loadCloudSave, saveCloudSave } from "./lib/cloudSave"; // 🔥 cloud save

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
  // Load *local* save once (fast) – cloud will override it later if found
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

  // Missions (spin)
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

  // 🔥 Local best score for leaderboard (never submit lower than this)
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem("mm_best_score_v1");
      return raw ? Number(raw) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // 🔥 NEW: flag so we don't overwrite cloud before first sync
  const [cloudReady, setCloudReady] = useState(false);

  // Telegram init
  useEffect(() => {
    initTelegramUI();
  }, []);

  // 🔥 On mount, try to override with CLOUD save (if exists for this UID)
  // but NEVER let an *older* cloud snapshot rewind newer local progress.
  useEffect(() => {
    let cancelled = false;

    async function syncFromCloud() {
      try {
        const cloud = await loadCloudSave();
        if (cancelled) return;

        if (!cloud) {
          // No cloud yet → just use local, allow writing new cloud later
          return;
        }

        // Compare which is "ahead": local vs cloud (by best totalEarnings/score)
        const local = (loadSave() as any) || {};
        const localBest = local.totalEarnings ?? local.score ?? 0;
        const cloudBest = cloud.totalEarnings ?? cloud.score ?? 0;

        // 👇 If local is already ahead, DO NOT overwrite with older cloud
        if (cloudBest < localBest) {
          // Push local → cloud so they match, but keep your current progress
          saveCloudSave(local as any).catch(() => {});
          return;
        }

        // ✅ Cloud is equal or ahead → apply it to state
        setBalance(cloud.balance ?? cloud.score ?? 0);
        setTotalEarnings(cloud.totalEarnings ?? cloud.score ?? 0);
        setTaps(cloud.taps ?? cloud.tap ?? 0);
        setTapValue(cloud.tapValue ?? 1);
        setAutoPerSec(cloud.autoPerSec ?? 0);
        setMulti(cloud.multi ?? 1);

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

        // Sync bestScore from cloud too (never go down)
        setBestScore((prev) => Math.max(prev, cloudBest));

        const fixedCloud = {
          ...cloud,
          score: cloud.balance ?? cloud.score ?? 0,
          totalEarnings: cloud.totalEarnings ?? cloud.score ?? 0,
        };

        // Mirror cloud → local storage so everything stays in sync
        saveSave(fixedCloud as any);
      } catch {
        // ignore network errors
      } finally {
        if (!cancelled) setCloudReady(true);
      }
    }

    syncFromCloud();
    return () => {
      cancelled = true;
    };
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

  // 🔥 Auto-submit to leaderboard ONLY when you beat your bestScore
  useEffect(() => {
    if (totalEarnings <= 0) return;

    setBestScore((prevBest) => {
      const nextBest = totalEarnings > prevBest ? totalEarnings : prevBest;

      // If we actually improved, persist and submit
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
            // ignore network errors
          });
        } catch {
          // ignore
        }
      }

      return nextBest;
    });
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

  // Save game (merge with existing save, never wipe) + 🔥 push to cloud
  useEffect(() => {
    // ⛔ don't touch cloud until first cloud sync finished
    if (!cloudReady) return;

    const prev: any = (loadSave() as any) ?? {};
    const collection = buildCollectionFromCards(cards);

    const next: any = {
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
    couponsSpent,
    spinCooldownEndsAt,
  ]);

  // Hash navigation for TopBar quick links
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

  // Quick nav events (Cards / Suits / Pets / Games)
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

  // Handlers for Inventory / export / reset
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
      // also push imported data to cloud
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

  function handleClaimAchievement(id: string, reward: number) {
    setAchState((prev) => {
      const st = prev[id];
      if (!st?.done || st.claimed) return prev;
      return { ...prev, [id]: { done: true, claimed: true } };
    });
    setBalance((b) => b + reward);
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Premium animated background behind everything */}
      <AppBackground />

      {/* Foreground app content */}
      <div className="relative z-10 flex flex-col min-h-screen">
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

          {/* MISSIONS (uses Spin page logic for now) */}
          {tab === "missions" && (
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

          {/* GAMES → World Map mini-games */}
          {tab === "games" && <WorldMapPage balance={balance} />}

          {/* SHOP */}
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

          {/* INVENTORY – now real InventoryPage */}
          {tab === "inventory" && (
            <InventoryPage
              balance={balance}
              totalEarnings={totalEarnings}
              taps={taps}
              tapValue={tapValue}
              autoPerSec={autoPerSec}
              multi={multi}
              cards={cards}
              setCards={setCards}
              couponsAvailable={couponsAvailable}
              couponsSpent={couponsSpent}
              setCouponsSpent={setCouponsSpent}
              bulkDiscountLevel={bulkDiscountLevel}
              onExport={handleExport}
              onImport={handleImport}
              onReset={handleReset}
            />
          )}

          {/* TopBar-only pages (no bottom tab) */}
          {tab === "leaderboard" && <LeaderboardPage />}
          {tab === "profile" && (
            <ProfilePage
              balance={balance}
              totalEarnings={totalEarnings}
              taps={taps}
              tapValue={tapValue}
              autoPerSec={autoPerSec}
              multi={multi}
              achievementsState={achState}
              onClaim={handleClaimAchievement}
            />
          )}

          {/* Dedicated sub-pages (opened from Inventory / quick nav) */}
          {tab === "suits" && <SuitsPage balance={balance} />}
          {tab === "pets" && <PetsPage />}

          {tab === "cards" &&
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
          }
        </main>

        <Tabs active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
