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
// Cards page is optional; we render a placeholder if missing
// import CardsPage from "./pages/Cards";

// Game helpers
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";
import { initTelegramUI } from "./lib/telegram";

// Types
import type { Tab } from "./types";

export default function App() {
  // Load last save once (normalize with fallbacks)
  const s: any = useMemo(() => loadSave() as any, []);

  // Core state (with robust fallbacks)
  const [balance, setBalance] = useState<number>((s.balance ?? s.score ?? 0) as number);
  const [totalEarnings, setTotalEarnings] = useState<number>((s.totalEarnings ?? s.score ?? 0) as number);
  const [taps, setTaps] = useState<number>((s.taps ?? s.tap ?? 0) as number);
  const [tapValue, setTapValue] = useState<number>((s.tapValue ?? 1) as number);
  const [autoPerSec, setAutoPerSec] = useState<number>((s.autoPerSec ?? 0) as number);
  const [multi, setMulti] = useState<number>((s.multi ?? 1) as number);

  // Suits
  const [bestSuitName, setBestSuitName] = useState<string>((s.bestSuitName ?? "Starter") as string);

  // Spin
  const [spinCooldownEndsAt, setSpinCooldownEndsAt] = useState<number | null>(
    (s.spinCooldownEndsAt ?? null) as number | null
  );

  // Achievements
  const [achState, setAchState] = useState<
    Record<string, { done: boolean; claimed: boolean }>
  >((s.achievements ?? {}) as Record<string, { done: boolean; claimed: boolean }>);

  // Tabs
  const [tab, setTab] = useState<Tab>("home");

  // Telegram Mini App init (safe no-op in normal browsers)
  useEffect(() => {
    initTelegramUI();
  }, []);

  // Passive income tick (autoPerSec * multi each second)
  useInterval(() => {
    if (autoPerSec > 0) {
      const gain = Math.max(0, Math.floor(autoPerSec * multi));
      if (gain > 0) {
        setBalance((b) => b + gain);
        setTotalEarnings((t) => t + gain);
      }
    }
  }, 1000);

  // Re-check achievements when key stats change
  useEffect(() => {
    const ctx = { taps, balance, totalEarnings, bestSuitName };
    setAchState((prev) => {
      const next = { ...prev };
      for (const a of achievements) {
        if (!next[a.id]) next[a.id] = { done: false, claimed: false };
        if (!next[a.id].done && a.check(ctx)) next[a.id] = { ...next[a.id], done: true };
      }
      return next;
    });
  }, [taps, balance, totalEarnings, bestSuitName]);

  // Persist save whenever important things change
  useEffect(() => {
    saveSave({
      ...defaultSave,

      // legacy-compatible mapping
      score: balance,
      tap: taps,
      collection: s.collection ?? defaultSave.collection,
      lastDrop: s.lastDrop ?? null,
      ownedPets: s.ownedPets ?? [],
      equippedPet: s.equippedPet ?? null,
      ownedSuits: s.ownedSuits ?? [],
      equippedSuit: s.equippedSuit ?? null,
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
    s.collection,
    s.lastDrop,
    s.ownedPets,
    s.equippedPet,
    s.ownedSuits,
    s.equippedSuit,
    s.profile,
    s.quests,
  ]);

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

  // Export / Import / Reset
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
          // If you have src/pages/Cards.tsx, replace this block with: <CardsPage />
          <div className="p-6 text-white/90">
            <h2 className="text-xl font-semibold mb-2">Cards</h2>
            <p className="text-white/70">
              Card collection screen coming soon. (Left quick button works; this is a safe placeholder
              so builds never fail.)
            </p>
          </div>
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
