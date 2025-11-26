// src/pages/world/WorldMapPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../lib/profile";
import { COUNTRIES, REGIONS, type RegionId } from "../../data/countries";
import {
  loadWorldSave,
  saveWorldSave,
  computeTotals,
  REGION_NEIGHBORS,
  regionOfCountry,
  type WorldSave,
} from "../../lib/worldMapLogic";
import WorldHeader from "./WorldHeader";
import RegionGrid from "./RegionGrid";
import CountryList from "./CountryList";

type Props = {
  // For now, only read balance so we can show if user can afford.
  balance: number;
  // Later we can call setBalance to actually spend money:
  // setBalance: (fn: (prev: number) => number) => void;
};

export default function WorldMapPage({ balance }: Props) {
  // --- figure out player home country / region from profile ---------------
  const { homeCountry, homeRegion } = useMemo(() => {
    const p = getProfile();
    const cc = (p.country || "US").toUpperCase();
    const region = regionOfCountry(cc);
    return { homeCountry: cc, homeRegion: region };
  }, []);

  const [world, setWorld] = useState<WorldSave>(() =>
    loadWorldSave(homeCountry, homeRegion)
  );

  const [selectedRegion, setSelectedRegion] =
    useState<RegionId>(homeRegion);

  // recompute unlockedRegions when owned changes
  useEffect(() => {
    const nextUnlocked = new Set<RegionId>(world.unlockedRegions);

    // if somehow homeRegion is missing, always add it
    nextUnlocked.add(homeRegion);

    // for every region, if all its countries are owned, unlock neighbors
    for (const r of REGIONS) {
      const countriesInRegion = COUNTRIES.filter(
        (c) => c.region === r.id
      ).map((c) => c.code.toUpperCase());

      const ownedUpper = world.owned.map((o) => o.toUpperCase());

      const allOwned =
        countriesInRegion.length > 0 &&
        countriesInRegion.every((code) => ownedUpper.includes(code));

      if (allOwned) {
        const neighbors = REGION_NEIGHBORS[r.id] ?? [];
        for (const n of neighbors) {
          nextUnlocked.add(n);
        }
      }
    }

    const finalUnlocked = Array.from(nextUnlocked);

    if (
      finalUnlocked.slice().sort().join(",") !==
      world.unlockedRegions.slice().sort().join(",")
    ) {
      const updated: WorldSave = {
        owned: world.owned,
        unlockedRegions: finalUnlocked as RegionId[],
      };
      setWorld(updated);
      saveWorldSave(updated);
    } else {
      // still store + broadcast totals
      saveWorldSave(world);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.owned]);

  // computed totals
  const { apsBonusTotal, couponBonusTotal } = useMemo(
    () => computeTotals(world.owned),
    [world.owned]
  );

  const ownedSet = useMemo(
    () => new Set(world.owned.map((c) => c.toUpperCase())),
    [world.owned]
  );

  function handleBuyCountry(code: string) {
    const upper = code.toUpperCase();
    if (ownedSet.has(upper)) return;

    const updated: WorldSave = {
      owned: [...world.owned, upper],
      unlockedRegions: world.unlockedRegions,
    };

    setWorld(updated);
    saveWorldSave(updated);

    // NOTE: we are NOT actually subtracting from balance yet.
    // Later we can call a prop setBalance from App.tsx.
  }

  return (
    <div className="p-4 pb-20 text-white">
      <WorldHeader
        apsBonusTotal={apsBonusTotal}
        couponBonusTotal={couponBonusTotal}
      />

      <RegionGrid
        selectedRegion={selectedRegion}
        unlockedRegions={world.unlockedRegions}
        onSelectRegion={setSelectedRegion}
      />

      <CountryList
        selectedRegion={selectedRegion}
        ownedSet={ownedSet}
        balance={balance}
        onBuy={handleBuyCountry}
      />
    </div>
  );
}
