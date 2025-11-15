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

// Game helpers
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";
import { initTelegramUI } from "./lib/telegram";

// Data
import { suits } from "./data/suits";
import { getEquippedPet, getEquippedSuit } from "./lib/storage";

// Income math
import {
  computeCardMultAll,
  computeSuitMult,
  computePetMultipliers,
  TAPS_PER_COUPON,
} from "./incomeMath";

// Types
import type { Tab } from "./types";
import type { Rarity as CardRarity } from "./components/CardFrame";

/** One NFT-like card instance stored in save */
export type CardInstance = {
  id: string;           // unique id
  rarity: CardRarity;   // "common" | "uncommon" | ...
  serial: string;       // "#UL-0003 | MNYMKR v1.0"
  obtainedAt: number;   // timestamp
};

export default function App() {
  // Load last save once (normalize with fallbacks)
  const s: any = useMemo(() => loadSave() as any, []);

  // Core state
  const [balance, setBalance] = useState<number>(
    (s.balance ?? s.score ?? 0) as number
  );
  const [totalEarnings, setTotalEarnings] = useState<number>(
    (s.totalEarnings ?? s.score ?? 0) as number
  );
  const [taps, setTaps] = useState<number>(
    (s.taps ?? s.tap ?? 0) as number
  );
  const [tapValue, setTapValue] = useState<number>(
    (s.tapValue ?? 1) as number
  );
  const [autoPerSec, setAutoPerSec] = useState<number>(
    (s.autoPerSec ?? 0) as number
  );
  const [multi, setMulti] = useState<number>(
    (s.multi ?? 1) as number
  );

  // Suits
  const [equippedSuitId, setEquippedSuitId] = useState<string | null>(
    (s.equippedSuit ?? null) as string | null
  );
  const [bestSuitName, setBestSuitName] = useState<string>(
    (s.bestSuitName ??
      suits.find((su) => su.id === (s.equippedSuit ?? "starter"))?.name ??
      "Starter") as string
  );

  // Pets
  const [equippedPetId, setEquippedPetId] = useState<string | null>(
    (s.equippedPet ?? null) as string | null
  );

  // Spin
  const [spinCooldownEndsAt, setSpinCooldownEndsAt] = useState<number | null>(
    (s.spinCooldownEndsAt ?? null) as number | null
  );

  // Achievements
  const [achState, setAchState] = useState<
    Record<string, { done: boolean; claimed: boolean }>
  >((s.achievements ?? {}) as Record<
    string,
    { done: boolean; claimed: boolean }
  >);

  // NFT-like cards + coupons
  const [cards, setCards] = useState<CardInstance[]>(
    (Array.isArray(s.cards) ? s.cards : []) as CardInstance[]
  );
  const [couponsSpent, setCouponsSpent] = useState<number>(
    (s.couponsSpent ?? 0) as number
  );

  // Tabs
  const [tab, setTab] = useState<Tab>("home");

  // Telegram Mini App init (safe no-op in normal browsers)
  useEffect(() => {
    initTelegramUI();
  }, []);

  // Sync equipped pet/suit with storage when Pets/Suits UI saves
  useEffect(() => {
    const syncEquip = () => {
      try {
        const pet = getEquippedPet();
        const suitId = getEquippedSuit();

        if (pet !== undefined) {
          setEquippedPetId(pet ?? null);
        }
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

    // initial sync
    syncEquip();

    return () => {
      window.removeEventListener("mm:save", syncEquip as any);
      window.removeEventListener("storage", syncEquip as any);
    };
  }, []);

  /* ---------- DERIVED MULTIPLIERS ---------- */

  const suitMult = useMemo(
    () => computeSuitMult(equippedSuitId ?? "starter"),
    [equippedSuitId]
  );

  const { petTapMult, petAutoMult, globalMult } = useMemo(
    () => computePetMultipliers(equippedPetId),
    [equippedPetId]
  );

  const cardMultAll = useMemo(
    () => computeCardMultAll(cards),
    [cards]
  );

  // Coupons from taps
  const couponsEarned = useMemo(
    () => Math.floor(taps / TAPS_PER_COUPON),
    [taps]
  );
  const couponsAvailable = Math.max(0, couponsEarned - couponsSpent);

  /* ---------- PASSIVE INCOME (AUTO) WITH FULL MATH ---------- */

  useInterval(() => {
    if (autoPerSec > 0) {
      const gain = Math.max(
        0,
        Math.floor(
          autoPerSec *
            multi *
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
    }
  }, 1000);

  /* ---------- ACHIEVEMENTS ---------- */

  useEffect(() => {
    const ctx = { taps, balance, totalEarnings, bestSuitName };
    setAchState((prev) => {
      const next = { ...prev };
      for (const a of achievements) {
        if (!next[a.id]) next[a.id] = { done: false, claimed: false };
        if (!next[a.id].done && a.check(ctx))
          next[a.id] = { ...next[a.id], done: true };
      }
      return next;
    });
  }, [taps, balance, totalEarnings, bestSuitName]);

  /* ---------- SAVE GAME ---------- */

  useEffect(() => {
    // derive collection counts from cards for backwards compatibility
    let common = 0,
      uncommon = 0,
      rare = 0,
      epic = 0,
      legendary = 0,
      mythic = 0,
      ultimate = 0;

    for (const c of cards) {
      switch (c.rarity) {
        case "common":
          common++;
          break;
        case "uncommon":
          uncommon++;
          break;
        case "rare":
          rare++;
          break;
        case "epic":
          epic++;
          break;
        case "legendary":
          legendary++;
          break;
        case "mythic":
          mythic++;
          break;
        case "ultimate":
          ultimate++;
          break;
      }
    }

    const collection = {
      common,
      uncommon,
      rare,
      epic,
      legendary,
      mythic,
      ultimate,
    };

    saveSave({
      ...defaultSave,

      // legacy-compatible mapping
      score: balance,
      tap: taps,
      collection,
      lastDrop: s.lastDrop ?? null,
      ownedPets: s.ownedPets ?? [],
      equippedPet: equippedPetId ?? null,
      ownedSuits: s.ownedSuits ?? [],
      equippedSuit: equippedSuitId ?? null,
      profile: s.profile ?? defaultSave.profile,

      // current shape
      balance,
      totalEarnings,
      taps,
      tapValue,
      autoPerSec,
      multi,
      bestSuitName,
      spinCooldownEndsAt,
      quests: s.quests ?? [],
      achievements: achState,
      cards,
      couponsSpent,
    } as any);
  }, [
    balance,
    totalEarnings,
    taps,
    tapValue,
    autoPerSec,
    multi,
    bestSuitName,
    spinCooldownEndsAt,
    achState,
    equippedPetId,
    equippedSuitId,
    cards,
    couponsSpent,
    s.lastDrop,
    s.ownedPets,
    s.ownedSuits,
    s.profile,
    s.quests,
  ]);

  /* ---------- NAVIGATION ---------- */

  // Hash navigation (TopBar sets #/profile or #/leaderboard)
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

  // Listen for quick-nav events from LeftQuickNav (Cards / Suits / Pets)
  useEffect(() => {
    const onGoto = (e: Event) => {
      const ce = e as CustomEvent<{ goto: Tab }>;
      if (!ce.detail?.goto) return;
      setTab(ce.detail.goto);
    };
    window.addEventListener("MM_GOTO", onGoto as EventListener);
    return () => window.removeEventListener("MM_GOTO", onGoto as EventListener);
  }, []);

  /* ---------- SAVE EXPORT / IMPORT / RESET ---------- */

  function doExport() {
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

  function doImport(raw: string) {
    try {
      const parsed = JSON.parse(raw);
      saveSave(parsed as any);
      location.reload();
    } catch {
      alert("Invalid save JSON.");
    }
  }

  function doReset() {
    saveSave({ ...defaultSave } as any);
    location.reload();
  }

  // Claim achievement
  function claimAchievement(id: string, reward: number) {
    setAchState((prev) => {
      const st = prev[id];
      if (!st?.done || st.claimed) return prev;
      return { ...prev, [id]: { done: true, claimed: true } };
    });
    setBalance((b) => b + reward);
  }

  /* ---------- RENDER ---------- */

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

        {/* Cards / Suits / Pets */}
        {tab === "suits" && <SuitsPage />}
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
            onClaim={claimAchievement}
            onReset={doReset}
            onExport={doExport}
            onImport={doImport}
          />
        )}
      </main>

      <Tabs active={tab} onChange={setTab} />
    </div>
  );
}
