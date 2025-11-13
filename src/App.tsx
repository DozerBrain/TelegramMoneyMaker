import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Tabs from "./components/Tabs";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Spin from "./pages/Spin";
import More from "./pages/More";
import { loadSave, saveSave, defaultSave } from "./lib/storage";
import { useInterval } from "./lib/useInterval";
import { achievements } from "./data/achievements";

type Tab = "home" | "shop" | "spin" | "more" | "leaderboard" | "profile";

export default function App(){
  const s = loadSave();

  // Core state
  const [balance, setBalance] = useState(s.balance);
  const [totalEarnings, setTotalEarnings] = useState(s.totalEarnings);
  const [taps, setTaps] = useState(s.taps);
  const [tapValue, setTapValue] = useState(s.tapValue);
  const [autoPerSec, setAutoPerSec] = useState(s.autoPerSec);
  const [multi, setMulti] = useState(s.multi);
  const [bestSuitName, setBestSuitName] = useState(s.bestSuitName);
  const [spinCooldownEndsAt, setSpinCooldownEndsAt] = useState<number|null>(s.spinCooldownEndsAt);

  const [achState, setAchState] = useState<Record<string, {done:boolean; claimed:boolean}>>(s.achievements);

  const [tab, setTab] = useState<Tab>("home");

  // Passive income tick
  useInterval(() => {
    if (autoPerSec > 0) {
      const gain = Math.max(0, Math.floor(autoPerSec * multi));
      if (gain > 0) {
        setBalance(b => b + gain);
        setTotalEarnings(t => t + gain);
      }
    }
  }, 1000);

  // Evaluate achievements whenever key stats change
  useEffect(()=>{
    const ctx = { taps, balance, totalEarnings, bestSuitName };
    setAchState(prev => {
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

  // Persist
  useEffect(()=>{
    saveSave({
      balance, totalEarnings, taps, tapValue, autoPerSec, multi,
      bestSuitName, spinCooldownEndsAt,
      quests: s.quests,
      achievements: achState,
    });
  }, [balance, totalEarnings, taps, tapValue, autoPerSec, multi, bestSuitName, spinCooldownEndsAt, achState]);

  // Export / Import helpers
  function doExport(){
    const raw = localStorage.getItem("moneymaker:save:v1");
    if (raw) {
      navigator.clipboard.writeText(raw);
      alert("Save copied to clipboard!");
    }
  }
  function doImport(raw: string){
    try {
      const parsed = JSON.parse(raw);
      localStorage.setItem("moneymaker:save:v1", JSON.stringify(parsed));
      location.reload();
    } catch {
      alert("Invalid save JSON.");
    }
  }
  function doReset(){
    localStorage.setItem("moneymaker:save:v1", JSON.stringify(defaultSave));
    location.reload();
  }

  // Claim achievement
  function claimAchievement(id:string, reward:number){
    setAchState(prev => {
      const st = prev[id];
      if (!st?.done || st.claimed) return prev;
      return { ...prev, [id]: { done: true, claimed: true } };
    });
    setBalance(b => b + reward);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f13] text-white">
      <TopBar taps={taps} tapValue={tapValue} autoPerSec={autoPerSec} />

      <main className="flex-1">
        {tab==="home" && (
          <Home
            balance={balance} setBalance={setBalance}
            totalEarnings={totalEarnings} setTotalEarnings={setTotalEarnings}
            taps={taps} setTaps={setTaps}
            tapValue={tapValue} multi={multi}
            currentSuitName={bestSuitName} setCurrentSuitName={setBestSuitName}
          />
        )}
        {tab==="shop" && (
          <Shop
            balance={balance} setBalance={setBalance}
            tapValue={tapValue} setTapValue={setTapValue}
            autoPerSec={autoPerSec} setAutoPerSec={setAutoPerSec}
            multi={multi} setMulti={setMulti}
          />
        )}
        {tab==="spin" && (
          <Spin
            balance={balance} setBalance={setBalance}
            tapValue={tapValue} setTapValue={setTapValue}
            autoPerSec={autoPerSec} setAutoPerSec={setAutoPerSec}
            multi={multi} setMulti={setMulti}
            spinCooldownEndsAt={spinCooldownEndsAt} setSpinCooldownEndsAt={setSpinCooldownEndsAt}
          />
        )}
        {tab==="more" && (
          <More
            balance={balance} totalEarnings={totalEarnings} taps={taps}
            tapValue={tapValue} autoPerSec={autoPerSec} multi={multi}
            achievementsState={achState}
            onClaim={claimAchievement}
            onReset={doReset} onExport={doExport} onImport={doImport}
          />
        )}
        {tab==="leaderboard" && <LeaderboardPage />}
        {tab==="profile" && <ProfilePage />}
      </main>

      <Tabs active={tab} onChange={(t)=>setTab(t as Tab)} />
    </div>
  );
}
