// src/AppRoutes.tsx
import React from "react";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Spin from "./pages/Spin";
import InventoryPage from "./pages/Inventory";
import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import PetsPage from "./pages/Pets";
import SuitsPage from "./pages/Suits";
import CardsPage from "./pages/Cards";
import GamesPage from "./pages/Games";

import type { Tab } from "./types";
import type { CardInstance } from "./App"; // we still export this from App.tsx

type Props = {
  tab: Tab;

  // Core game state
  balance: number;
  setBalance: (v: number | ((p: number) => number)) => void;

  totalEarnings: number;
  setTotalEarnings: (v: number | ((p: number) => number)) => void;

  taps: number;
  setTaps: (v: number | ((p: number) => number)) => void;

  tapValue: number;
  setTapValue: (v: number | ((p: number) => number)) => void;

  autoPerSec: number;
  setAutoPerSec: (v: number | ((p: number) => number)) => void;

  multi: number;
  setMulti: (v: number | ((p: number) => number)) => void;

  // Casino
  chips: number;
  setChips: (v: number | ((p: number) => number)) => void;

  // Long-term upgrades
  critChance: number;
  setCritChance: (v: number | ((p: number) => number)) => void;

  critMult: number;
  setCritMult: (v: number | ((p: number) => number)) => void;

  autoBonusMult: number;
  setAutoBonusMult: (v: number | ((p: number) => number)) => void;

  couponBoostLevel: number;
  setCouponBoostLevel: (v: number | ((p: number) => number)) => void;

  bulkDiscountLevel: number;
  setBulkDiscountLevel: (v: number | ((p: number) => number)) => void;

  // Suits / pets / bonuses
  bestSuitName: string;
  setBestSuitName: (v: string | ((p: string) => string)) => void;

  equippedPetId: string | null;

  suitMult: number;
  petTapMult: number;
  cardMultAll: number;
  globalMult: number;

  // Spin / missions
  spinCooldownEndsAt: number | null;
  setSpinCooldownEndsAt: (v: number | null | ((p: number | null) => number | null)) => void;

  // Achievements
  achievementsState: Record<string, { done: boolean; claimed: boolean }>;
  onClaimAchievement: (id: string, reward: number) => void;

  // Cards & coupons
  cards: CardInstance[];
  setCards: (v: CardInstance[] | ((p: CardInstance[]) => CardInstance[])) => void;

  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;

  // Inventory helpers
  onExport: () => void;
  onImport: (raw: string) => void;
  onReset: () => void;
};

export default function AppRoutes(props: Props) {
  const {
    tab,
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
    bestSuitName,
    setBestSuitName,
    equippedPetId,
    suitMult,
    petTapMult,
    cardMultAll,
    globalMult,
    spinCooldownEndsAt,
    setSpinCooldownEndsAt,
    achievementsState,
    onClaimAchievement,
    cards,
    setCards,
    couponsAvailable,
    couponsSpent,
    setCouponsSpent,
    onExport,
    onImport,
    onReset,
  } = props;

  return (
    <>
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

      {tab === "games" && (
        <GamesPage
          balance={balance}
          setBalance={setBalance}
          chips={chips}
          setChips={setChips}
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
          onExport={onExport}
          onImport={onImport}
          onReset={onReset}
        />
      )}

      {tab === "leaderboard" && <LeaderboardPage />}

      {tab === "profile" && (
        <ProfilePage
          balance={balance}
          totalEarnings={totalEarnings}
          taps={taps}
          tapValue={tapValue}
          autoPerSec={autoPerSec}
          multi={multi}
          achievementsState={achievementsState}
          onClaim={onClaimAchievement}
        />
      )}

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
          tapsPerCoupon={10_000} // using same constant you pass from App (TAPS_PER_COUPON)
          bulkDiscountLevel={bulkDiscountLevel}
        />
      )}
    </>
  );
}
