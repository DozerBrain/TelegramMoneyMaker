// src/App.tsx
import React from "react";

import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";
// ❌ old background (remove this)
// import AppBackground from "./components/AppBackground";
// ✅ new dynamic background
import BackgroundManager from "./components/layout/BackgroundManager";

import AppRoutes from "./AppRoutes";
import { useGameState } from "./lib/useGameState";

export default function App() {
  const game = useGameState();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* 🔥 Global dynamic background (day/night + home/secondary) */}
      <BackgroundManager activeTab={game.tab} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar
          taps={game.taps}
          tapValue={game.tapValue}
          autoPerSec={game.autoPerSec}
        />

        <main className="flex-1">
          <AppRoutes
            tab={game.tab}
            // Core
            balance={game.balance}
            setBalance={game.setBalance}
            totalEarnings={game.totalEarnings}
            setTotalEarnings={game.setTotalEarnings}
            taps={game.taps}
            setTaps={game.setTaps}
            tapValue={game.tapValue}
            setTapValue={game.setTapValue}
            autoPerSec={game.autoPerSec}
            setAutoPerSec={game.setAutoPerSec}
            multi={game.multi}
            setMulti={game.setMulti}
            // Chips
            chips={game.chips}
            setChips={game.setChips}
            // Long-term stats
            critChance={game.critChance}
            setCritChance={game.setCritChance}
            critMult={game.critMult}
            setCritMult={game.setCritMult}
            autoBonusMult={game.autoBonusMult}
            setAutoBonusMult={game.setAutoBonusMult}
            couponBoostLevel={game.couponBoostLevel}
            setCouponBoostLevel={game.setCouponBoostLevel}
            bulkDiscountLevel={game.bulkDiscountLevel}
            setBulkDiscountLevel={game.setBulkDiscountLevel}
            // Suits / pets
            bestSuitName={game.bestSuitName}
            setBestSuitName={game.setBestSuitName}
            equippedPetId={game.equippedPetId}
            // Spin
            spinCooldownEndsAt={game.spinCooldownEndsAt}
            setSpinCooldownEndsAt={game.setSpinCooldownEndsAt}
            // Achievements
            achState={game.achState}
            onClaimAchievement={game.handleClaimAchievement}
            // Cards / coupons
            cards={game.cards}
            setCards={game.setCards}
            couponsAvailable={game.couponsAvailable}
            couponsSpent={game.couponsSpent}
            setCouponsSpent={game.setCouponsSpent}
            // Inventory helpers
            onExport={game.handleExport}
            onImport={game.handleImport}
            onReset={game.handleReset}
            // Multipliers
            suitMult={game.suitMult}
            petTapMult={game.petTapMult}
            petAutoMult={game.petAutoMult}
            cardMultAll={game.cardMultAll}
            globalMult={game.globalMult}
          />
        </main>

        <Tabs active={game.tab} onChange={game.setTab} />
      </div>
    </div>
  );
}
