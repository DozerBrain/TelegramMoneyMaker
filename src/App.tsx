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

// Game helpers
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";
import { initTelegramUI } from "./lib/telegram";

// Tab keys
type Tab = "home" | "shop" | "spin" | "leaderboard" | "profile" | "more";

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
  >(
    (s.achievements ?? {}) as Record<string, { done: boolean; claimed: boolean }>
  );

  // Tabs
  const [tab, setTab] = useState<Tab>("home");

  // Telegram Mini App init (safe no-op in normal browsers)
  useEffect(() => {
    initTelegramUI();
  }, []);

  // --- Passive income tick (autoPerSec * multi each second)
  useInterval(() => {
    if (autoPerSec > 0) {
      const gain = Math.max(0, Math.floor(autoPerSec * multi));
      if (gain > 0) {
        setBalance((b) => b + gain);
        setTotalEarnings((t) => t + gain);
      }
    }
  }, 1000);

  // --- Achievements re-check when key stats change
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

  // --- Persist save whenever anything important changes
  useEffect(() => {
    // Save with the fields your pages expect; unknown fields are fine
    saveSave({
      ...defaultSave,

      // legacy-compatible mapping
      score: balance, // keep score in sync
      tap: taps,
      collection: s.collection ?? defaultSave.collection,
      lastDrop: s.lastDrop ?? null,
      ownedPets: s.ownedPets ?? [],
      equippedPet: s.equippedPet ?? null,
      ownedSuits: s.ownedSuits ?? [],
      equippedSuit: s.equippedSuit ?? null,
      profile: s.profile ?? defaultSave.profile,

      // richer shape (newer fields)
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

  // --- Hash navigation (TopBar sets #/profile or #/leaderboard)
  useEffect(() => {
    const applyHash = () => {
      const h = (location.hash || "").toLowerCase();
      if (h.startsWith("#/leaderboard")) setTab("leaderboard");
      else if (h.startsWith("#/profile")) setTab("profile");
      // add more hashes as needed
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // --- Export / Import / Reset (use storage snapshot API)
  function doExport() {
    try {
      const snapshot = loadSave();
      const json = JSON.stringify(snapshot, null, 2);
      navigator.clipboard.writeText(json).then(
        () => alert("Save copied to clipboard!"),
        () => {
          // fallback to download if clipboard fails
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
      saveSave(parsed as any); // storage.ts spreads fields into proper keys
      location.reload();
    } catch {
      alert("Invalid save JSON.");
    }
  }

  function doReset() {
    saveSave({ ...defaultSave } as any);
    location.reload();
  }

  // --- Claim achievement (adds reward to balance)
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
      {/* Top header with title, avatar (Telegram), and rank */}
      <TopBar taps={taps} tapValue={tapValue} autoPerSec={autoPerSec} />

      {/* Pages */}
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

      {/* Bottom Tabs — cast keeps types happy if Tabs expects string */}
      <Tabs active={tab} onChange={(v: string) => setTab(v as Tab)} />
    </div>
  );
}
