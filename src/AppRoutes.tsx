// src/AppRoutes.tsx
import React from "react";

// Types
import type { Tab } from "./types";
import type { CardInstance } from "./types/cards";

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
import GamesPage from "./pages/Games";

// Layout
import ScreenContainer from "./components/layout/ScreenContainer";

// Income math constant
import { TAPS_PER_COUPON } from "./incomeMath";

type Props = {
  tab: Tab;

  // Core
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

  // Chips
  chips: number;
  setChips: (v: number | ((p: number) => number)) => void;

  // Long-term stats
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

  // Suits / pets
  bestSuitName: string;
  setBestSuitName: (v: string | ((p: string) => string)) => void;
  equippedPetId: string | null;

  // Spin / missions
  spinCooldownEndsAt: number | null;
  setSpinCooldownEndsAt: (
    v: number | null | ((p: number | null) => number | null)
  ) => void;

  // Achievements
  achState: Record<string, { done: boolean; claimed: boolean }>;
  onClaimAchievement: (id: string, reward: number) => void;

  // Cards / coupons
  cards: CardInstance[];
  setCards: (v: CardInstance[] | ((p: CardInstance[]) => CardInstance[])) => void;
  couponsAvailable: number;
  couponsSpent: number;
  setCouponsSpent: (v: number | ((p: number) => number)) => void;

  // Inventory helpers
  onExport: () => void;
  onImport: (raw: string) => void;
  onReset: () => void;

  // Multipliers
  suitMult: number;
  petTapMult: number;
  petAutoMult: number;
  cardMultAll: number;
  globalMult: number;
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
    spinCooldownEndsAt,
    setSpinCooldownEndsAt,
    achState,
    onClaimAchievement,
    cards,
    setCards,
    couponsAvailable,
    couponsSpent,
    setCouponsSpent,
    onExport,
    onImport,
    onReset,
    suitMult,
    petTapMult,
    petAutoMult,
    cardMultAll,
    globalMult,
  } = props;

  return (
    <>
      {tab === "home" && (
        <ScreenContainer tab={tab}>
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
        </ScreenContainer>
      )}

      {tab === "missions" && (
        <ScreenContainer tab={tab}>
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
        </ScreenContainer>
      )}

      {tab === "games" && (
        <ScreenContainer tab={tab}>
          <GamesPage
            balance={balance}
            setBalance={setBalance}
            chips={chips}
            setChips={setChips}
          />
        </ScreenContainer>
      )}

      {tab === "shop" && (
        <ScreenContainer tab={tab}>
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
        </ScreenContainer>
      )}

      {tab === "inventory" && (
        <ScreenContainer tab={tab}>
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
        </ScreenContainer>
      )}

      {tab === "leaderboard" && (
        <ScreenContainer tab={tab}>
          <LeaderboardPage />
        </ScreenContainer>
      )}

      {tab === "profile" && (
        <ScreenContainer tab={tab}>
          <ProfilePage
            balance={balance}
            totalEarnings={totalEarnings}
            taps={taps}
            tapValue={tapValue}
            autoPerSec={autoPerSec}
            multi={multi}
            achievementsState={achState}
            onClaim={onClaimAchievement}
          />
        </ScreenContainer>
      )}

      {tab === "suits" && (
        <ScreenContainer tab={tab}>
          <SuitsPage balance={balance} />
        </ScreenContainer>
      )}

      {tab === "pets" && (
        <ScreenContainer tab={tab}>
          <PetsPage />
        </ScreenContainer>
      )}

      {tab === "cards" && (
        <ScreenContainer tab={tab}>
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
        </ScreenContainer>
      )}
    </>
  );
}
