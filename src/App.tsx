// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import CardsModal from "./cards/CardsModal";
import "./styles/global.css"; // auras / extras
// If you have the banknote button component & css:
import BanknoteButton from "./components/BanknoteButton"; // make sure this file exists

/* ========= Version tag ========= */
const MM_VERSION = "ALLPACK v1.0";

/* ---------------- Types ---------------- */
type ShopItem = { id: string; name: string; kind: "upgrade"|"consumable"; cost: number; apply: () => void };
type Particle = { id: number; x: number; y: number; value: number };
type Ripple = { id: number };
type LBRow = { id: string; name: string; score: number; you?: boolean };

type Reward =
  | { kind: "coins"; amount: number }
  | { kind: "energy"; amount: number }
  | { kind: "tap"; amount: number }
  | { kind: "auto"; amount: number }
  | { kind: "booster"; minutes: number };

type Achievement = { id: string; title: string; desc: string; goal: number; key: "score"|"taps"|"streak"|"upgrades"; reward: number };

/* -------------- Telegram global -------------- */
declare global { interface Window { Telegram?: any } }

/* ---------- small utils ---------- */
const lsSet = (k:string,v:any)=> localStorage.setItem(k, typeof v==="string"? v: JSON.stringify(v));
const lsGet = (k:string, d:string)=> localStorage.getItem(k) ?? d;
const lsn   = (k:string, d:number)=> { const v = localStorage.getItem(k); return v? Number(v) : d; };
const fmt   = (n:number)=> n.toLocaleString();

function useInterval(fn:()=>void, ms:number){ useEffect(()=>{ const id=setInterval(fn,ms); return ()=>clearInterval(id) },[fn,ms]) }
function rand(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min }
function dur(left:number){
  const s=Math.ceil(left/1000); const m=Math.floor(s/60); const r=s%60;
  return m>0? `${m}m ${r}s` : `${r}s`;
}

function toast(_msg:string){ /* hook up your UI toast if you have one */ }

/* Simple UI bar */
function Bar({label,percent,right,color="emerald",className=""}:{label:string;percent:number;right:string;color?:"emerald"|"sky"|"amber";className?:string;}){
  const c = color==="emerald"?"bg-emerald-500":color==="sky"?"bg-sky-500":"bg-amber-400";
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 ${className}`}>
      <div className="flex justify-between text-xs text-slate-300 mb-1">
        <span>{label}</span><span>{right}</span>
      </div>
      <div className="h-2.5 rounded bg-white/10 overflow-hidden">
        <div className={`h-full ${c}`} style={{width:`${Math.max(0,Math.min(100,percent))}%`}}/>
      </div>
    </div>
  );
}

/* ========= App ========= */
export default function App() {
  const tg = (typeof window !== "undefined" && window.Telegram?.WebApp) || null;

  /* -------- core state -------- */
  const [username, setUsername] = useState(() => lsGet("username","Player"));
  const [score, setScore] = useState(() => lsn("score", 0));
  const [taps, setTaps] = useState(() => lsn("taps", 0));
  const [energy, setEnergy] = useState(() => lsn("energy", 50));
  const [maxEnergy, setMaxEnergy] = useState(() => lsn("maxEnergy", 50));
  const [tapPower, setTapPower] = useState(() => lsn("tapPower", 1));
  const [autoRate, setAutoRate] = useState(() => lsn("autoRate", 0));
  const [regenRate, setRegenRate] = useState(() => lsn("regenRate", 5));
  const [coins, setCoins] = useState(() => lsn("coins", 0));
  const [streak, setStreak] = useState(() => lsn("streak", 0));
  const [lastLogin, setLastLogin] = useState(() => lsn("lastLogin", 0));
  const [upgradesBought, setUpgradesBought] = useState(() => lsn("upgradesBought", 0));

  /* -------- meta systems -------- */
  const [tab, setTab] = useState<"quests"|"shop"|"more">("quests");

  // prestige
  const [shards, setShards] = useState(() => lsn("shards", 0));
  const [prestigeCount, setPrestigeCount] = useState(() => lsn("prestigeCount",0));
  const globalMultiplier = useMemo(()=> 1 + shards*0.1, [shards]); // +10% each shard

  // skins & pets (kept simple)
  type SkinId = "default"|"emeraldSuit"|"goldSuit";
  type PetId  = "none"|"miniCoin"|"owl";
  const [skin, setSkin] = useState<SkinId>(()=> lsGet("skin","default") as SkinId);
  const [pet, setPet]   = useState<PetId>(()=> lsGet("pet","none") as PetId);
  const skinBonus = skin==="emeraldSuit"?1.05: skin==="goldSuit"?1.08: 1;   // affects tap
  const petAuto   = pet==="miniCoin"?1: pet==="owl"?2: 0;                    // +auto/sec

  // sounds (minimal ping)
  const [sfxOn] = useState(()=> lsGet("sfxOn","1")==="1");

  /* -------- fx/ui -------- */
  const mascotRef = useRef<HTMLImageElement>(null);
  const tapCardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const pid = useRef(1); const rid = useRef(1);

  // combo/fever
  const lastTapAt = useRef(0);
  const [combo, setCombo] = useState(0);   // 0..100
  const [mult, setMult]   = useState(1);   // 1..3
  const [feverUntil, setFeverUntil] = useState(0);
  const feverActive = Date.now() < feverUntil;

  // spin & chest
  const [nextSpinAt, setNextSpinAt] = useState<number>(() => lsn("nextSpinAt", 0));
  const [spinCountdown, setSpinCountdown] = useState("");
  const [nextChestAt, setNextChestAt] = useState<number>(()=> lsn("nextChestAt",0));
  const [chestCountdown, setChestCountdown] = useState("");

  // achievements
  const ACH: Achievement[] = useMemo(()=>[
    {id:"sc1", title:"1k Earner", desc:"Reach 1,000 total", goal:1000, key:"score", reward:100},
    {id:"sc2", title:"10k Earner", desc:"Reach 10,000", goal:10000, key:"score", reward:400},
    {id:"sc3", title:"100k Earner", desc:"Reach 100,000", goal:100000, key:"score", reward:2000},
    {id:"tap1", title:"Tap Novice", desc:"500 taps", goal:500, key:"taps", reward:150},
    {id:"tap2", title:"Tap Pro", desc:"2,000 taps", goal:2000, key:"taps", reward:500},
    {id:"tap3", title:"Tap GOD", desc:"10,000 taps", goal:10000, key:"taps", reward:3000},
    {id:"up1", title:"First Upgrade", desc:"Buy 1 upgrade", goal:1, key:"upgrades", reward:50},
    {id:"up2", title:"Investor", desc:"Buy 10 upgrades", goal:10, key:"upgrades", reward:400},
    {id:"up3", title:"Tycoon", desc:"Buy 30 upgrades", goal:30, key:"upgrades", reward:1500},
    {id:"st1", title:"Streaker", desc:"3-day streak", goal:3, key:"streak", reward:200},
    {id:"st2", title:"Hot Streak", desc:"7-day streak", goal:7, key:"streak", reward:600},
    {id:"st3", title:"Unstoppable", desc:"14-day streak", goal:14, key:"streak", reward:1500},
    {id:"sc4", title:"Millionaire", desc:"Reach 1,000,000", goal:1_000_000, key:"score", reward:10000},
    {id:"tap4", title:"Storm Fingers", desc:"50,000 taps", goal:50_000, key:"taps", reward:8000},
    {id:"up4", title:"Architect", desc:"60 upgrades", goal:60, key:"upgrades", reward:4000},
  ],[]);

  /* -------- init -------- */
  useEffect(() => {
    try{
      if (tg) {
        tg.expand?.(); tg.ready?.();
        tg.setHeaderColor?.("#0b1220"); tg.setBackgroundColor?.("#0b1220");
        const uname = tg.initDataUnsafe?.user?.first_name || tg.initDataUnsafe?.user?.username || username || "Player";
        setUsername(uname); lsSet("username", uname);
      }
      const now = Date.now(), last = lastLogin || 0, days = Math.floor((now - last)/86400000);
      if (last===0 || days===0) {} 
      else if (days===1) { setStreak(s=>s+1); setCoins(c=>c+20*Math.min(7,(streak||0)+1)); toast("Daily streak +1 ⭐") }
      else { setStreak(1); toast("Streak reset") }
      setLastLogin(now);
    }catch{}
    // eslint-disable-next-line
  },[]);

  /* -------- persist -------- */
  useEffect(()=>{ 
    lsSet("score",score); lsSet("taps",taps); lsSet("energy",energy); lsSet("maxEnergy",maxEnergy);
    lsSet("tapPower",tapPower); lsSet("autoRate",autoRate); lsSet("regenRate",regenRate); lsSet("coins",coins);
    lsSet("streak",streak); lsSet("lastLogin",lastLogin); lsSet("upgradesBought",upgradesBought);
    lsSet("shards",shards); lsSet("prestigeCount",prestigeCount); lsSet("skin",skin); lsSet("pet",pet); lsSet("sfxOn",sfxOn?'1':'0');
  },[score,taps,energy,maxEnergy,tapPower,autoRate,regenRate,coins,streak,lastLogin,upgradesBought,shards,prestigeCount,skin,pet,sfxOn]);

  /* -------- loops -------- */
  useInterval(()=>{ const p = regenRate/60; setEnergy(e=>Math.min(maxEnergy, e+p)) },1000);
  useInterval(()=>{ const extra = petAuto; if (autoRate+extra>0) setScore(s=>s + Math.round((autoRate+extra)*globalMultiplier)) },1000);
  useInterval(()=>{
    const left = Math.max(0, nextSpinAt - Date.now());
    setSpinCountdown(left>0? dur(left):"");
    const left2 = Math.max(0, nextChestAt - Date.now());
    setChestCountdown(left2>0? dur(left2):"");
  },1000);

  /* -------- tap -------- */
  const spawnParticle = (cx?:number, cy?:number)=>{
    const rect = tapCardRef.current?.getBoundingClientRect(); if(!rect) return;
    const id = pid.current++; const x = cx?((cx-rect.left)/rect.width)*100:50; const y = cy?((cy-rect.top)/rect.height)*100:58;
    const shown = Math.max(1, Math.floor(tapPower*skinBonus*globalMultiplier*(feverActive?2:1)*mult));
    setParticles(ps=>[...ps,{id,x,y,value:shown}]);
    setTimeout(()=> setParticles(ps=>ps.filter(p=>p.id!==id)), 850);
  };
  const spawnRipple = ()=>{ const id=rid.current++; setRipples(rs=>[...rs,{id}]); setTimeout(()=>setRipples(rs=>rs.filter(r=>r.id!==id)),450) };

  const onTap = (e?:React.MouseEvent)=>{
    if (energy<1) return toast("No energy. Wait ⏳");
    // combo
    const now = Date.now(); const within = now - (lastTapAt.current||0) <= 1000; const nextCombo = Math.min(100, within? combo+7 : 7);
    const nextMult = Math.min(3, 1 + nextCombo/50);
    setCombo(feverActive?0:nextCombo); setMult(Number(nextMult.toFixed(2)));
    if(nextCombo===100 && !feverActive){ setFeverUntil(now+5000); /* vibe */ }
    // gain
    const gain = Math.floor(tapPower*skinBonus*globalMultiplier*(feverActive?2:1)*nextMult);
    setScore(s=>s+gain); setTaps(t=>t+1); setEnergy(e_=>Math.max(0,e_-1));
    // fx
    mascotRef.current?.classList.remove("mrT-pop"); void mascotRef.current?.offsetWidth; mascotRef.current?.classList.add("mrT-pop");
    spawnParticle(e?.clientX,e?.clientY); spawnRipple();
    tg?.HapticFeedback?.impactOccurred?.("medium");
  };

  /* -------- shop -------- */
  const shop = useMemo<ShopItem[]>(()=>[
    { id:"tap1", name:"+1 Tap Power", kind:"upgrade", cost:100, apply:()=>{ setTapPower(x=>x+1); setUpgradesBought(u=>u+1); } },
    { id:"energy10", name:"+10 Max Energy", kind:"upgrade", cost:150, apply:()=>{ setMaxEnergy(x=>x+10); setUpgradesBought(u=>u+1); } },
    { id:"auto1", name:"+1 Auto/sec", kind:"upgrade", cost:300, apply:()=>{ setAutoRate(x=>x+1); setUpgradesBought(u=>u+1); } },
    { id:"regen5", name:"+5 Energy/min", kind:"upgrade", cost:250, apply:()=>{ setRegenRate(x=>x+5); setUpgradesBought(u=>u+1); } },
  ],[]);
  const buy = (item:ShopItem)=>{ if(coins<item.cost) return toast("Not enough coins 💰"); setCoins(c=>c-item.cost); item.apply(); toast(`Purchased ${item.name} ✅`) };

  /* -------- leaderboard (stub local) -------- */
  const [leaderboard, setLeaderboard] = useState<LBRow[]>(()=> ensureWeekBoard(username, score));
  useEffect(()=>{ setLeaderboard(ensureWeekBoard(username, score)) },[score,username]);

  /* -------- spin & chest handlers -------- */
  const onReward = (r:Reward)=>{
    switch(r.kind){
      case "coins": setCoins(c=>c+r.amount); toast(`+${r.amount} coins 💰`); break;
      case "energy": setEnergy(e=>Math.min(maxEnergy, e+r.amount)); toast(`+${r.amount} energy ⚡`); break;
      case "tap": setTapPower(p=>p+r.amount); toast(`Tap Power +${r.amount} 💥`); break;
      case "auto": setAutoRate(a=>a+r.amount); toast(`Auto/sec +${r.amount} 🤖`); break;
      case "booster":
        toast("Booster x2 (5m) activated!");
        const oldTap=tapPower, oldAuto=autoRate; setTapPower(p=>p*2); setAutoRate(a=>a*2);
        setTimeout(()=>{ setTapPower(oldTap); setAutoRate(oldAuto); toast("Booster ended") }, r.minutes*60*1000);
        break;
    }
  };
  const openChest = ()=>{
    if(Date.now() < nextChestAt) return;
    const pool:Reward[] = [
      {kind:"coins", amount: 200+rand(0,300)},
      {kind:"energy", amount: 30},
      {kind:"tap", amount: 1},
      {kind:"auto", amount: 1},
      {kind:"booster", minutes: 5},
    ];
    const r = pool[Math.floor(Math.random()*pool.length)];
    onReward(r);
    const next = Date.now()+ 24*60*60*1000; setNextChestAt(next); lsSet("nextChestAt", next);
  };

  /* -------- prestige -------- */
  const shardGain = useMemo(()=> Math.floor(score/10000), [score]); // 1 per 10k total
  const doPrestige = ()=>{
    if (shardGain<=0) return toast("Earn at least 10k to prestige.");
    setShards(s=>s+shardGain); setPrestigeCount(p=>p+1);
    setScore(0); setTaps(0); setEnergy(50); setMaxEnergy(50);
    setTapPower(1); setAutoRate(0); setRegenRate(5); setCoins(0); setUpgradesBought(0);
    toast(`Prestiged! +${shardGain} shards ✨ Permanent x${(1+ (shards+shardGain)*0.1).toFixed(2)} boost`);
  };

  /* -------- cards modal -------- */
  const [cardsOpen, setCardsOpen] = useState(false);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full text-slate-100 relative overflow-hidden">
      {/* emerald bg blobs */}
      <div className="absolute inset-0 -z-10 bg-[#0b1220]">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[90px]"></div>
        <div className="absolute top-1/2 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[90px]"></div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-24 pt-5 flex flex-col items-center">
        {/* header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              MoneyMaker 💸 <span className="ml-1 rounded-lg bg-white/10 px-2 py-0.5 text-xs align-middle">{MM_VERSION}</span>
            </h1>
            <p className="text-xs text-slate-400">Welcome, {username}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Cards button in header */}
            <button
              onClick={()=>setCardsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/15 active:scale-[0.98]"
            >
              <span className="text-lg">🃏</span><span>Cards</span>
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right shadow-inner backdrop-blur-sm">
              <div className="text-[10px] uppercase text-slate-400">TOTAL</div>
              <div className="text-lg font-extrabold tabular-nums">{fmt(score)} pts</div>
              <div className="text-[11px] text-slate-400">Streak {streak}d</div>
            </div>
          </div>
        </div>

        {/* bars */}
        <Bar className="mt-4 w-full" label="Energy" percent={(energy/maxEnergy)*100} right={`${Math.floor(energy)}/${maxEnergy}`} color="emerald"/>
        <Bar className="mt-2 w-full" label={feverActive?"Fever":"Combo"} percent={feverActive?100:combo} right={feverActive?"x2 BOOST":`x${mult.toFixed(2)} • x${globalMultiplier.toFixed(2)} global`} color={feverActive?"amber":"sky"}/>

        {/* play card */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/15 blur-2xl"></div>

          {/* Cards button on play card */}
          <button
            onClick={()=>setCardsOpen(true)}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/15 active:scale-[0.98]"
          >
            <span className="text-lg">🃏</span><span>Cards</span>
          </button>

          <img ref={mascotRef} src="/mr-t.png" alt="Mr.T" draggable={false}
               className="pointer-events-none mx-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
               style={{maxHeight:"42vh", height:"42vh", width:"auto", objectFit:"contain"}} />

          {/* +N particles */}
          {particles.map(p=>(
            <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300 drop-shadow"
                  style={{left:`${p.x}%`, top:`${p.y}%`, animation:"floatUp 850ms ease-out forwards"}}>+{p.value}</span>
          ))}

          {/* tap area: banknote button */}
          <div className="relative flex justify-center mt-4">
            {ripples.map(r=> <span key={r.id} className="absolute h-44 w-44 rounded-full bg-emerald-400/20 blur-[2px]" style={{animation:"ripple 450ms ease-out forwards"}}/>)}

            {/* If you don’t have BanknoteButton, replace with a normal button */}
            <BanknoteButton size={240} onTap={onTap} floatText={`+${Math.max(1, Math.floor(tapPower*skinBonus*globalMultiplier*(feverActive?2:1)*mult))}`} />
          </div>
        </div>

        {/* tabs */}
        <div className="mt-5 flex gap-2">
          <button onClick={()=>setTab("quests")} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab==="quests"?"bg-emerald-500 text-emerald-950":"bg-white/10 text-slate-200"}`}>Quests</button>
          <button onClick={()=>setTab("shop")}   className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab==="shop"  ?"bg-emerald-500 text-emerald-950":"bg-white/10 text-slate-200"}`}>Shop</button>
          <button onClick={()=>setTab("more")}   className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab==="more"  ?"bg-emerald-500 text-emerald-950":"bg-white/10 text-slate-200"}`}>More</button>
        </div>

        {/* panels */}
        <div className="mt-3 w-full">
          {tab==="quests" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-2 text-sm">
                <Quest title="Daily Login" reward={20} onClaim={()=> setCoins(c=>c+20)} />
                <Quest title="Follow Channel" reward={50} onClaim={()=> setCoins(c=>c+50)} />
                <Quest title="Invite a Friend" reward={150} onClaim={()=> setCoins(c=>c+150)} />
                <LuckySpin nextSpinAt={nextSpinAt} setNextSpinAt={(v)=>{setNextSpinAt(v); lsSet("nextSpinAt",v)}} onReward={onReward} countdown={spinCountdown}/>
              </div>
            </div>
          )}

          {tab==="shop" && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-3">
                {shop.map(i=>(
                  <div key={i.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div><div className="font-semibold">{i.name}</div><div className="text-xs text-slate-300">Cost: {i.cost}</div></div>
                    <button onClick={()=>buy(i)} className="rounded-xl bg-sky-500 px-3 py-1 text-sm font-semibold text-slate-950">Buy</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="more" && (
            <div className="space-y-3">
              {/* Achievements */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Achievements 🏅</h3>
                  <span className="text-xs text-slate-400">Rewards on claim</span>
                </div>
                <div className="space-y-2">
                  {ACH.map(a=> {
                    const cur = a.key==="score"? score : a.key==="taps"? taps : a.key==="streak"? streak : upgradesBought;
                    const done = cur>=a.goal; const claimed = lsGet(`ach_${a.id}`,"0")==="1";
                    const pct = Math.min(100, Math.round(cur/a.goal*100));
                    return (
                      <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{a.title}</div>
                            <div className="text-xs text-slate-400">{a.desc}</div>
                          </div>
                          <div className="text-xs text-slate-300">Reward: {a.reward} coins</div>
                        </div>
                        <Bar className="mt-2" label="" percent={pct} right={`${pct}%`} color={done?"emerald":"sky"} />
                        <button
                          onClick={()=>{ if(!done||claimed) return; setCoins(c=>c+a.reward); lsSet(`ach_${a.id}`,"1"); toast(`Achievement: ${a.title} ✅ +${a.reward}`); }}
                          disabled={!done || claimed}
                          className={`mt-2 w-full rounded-lg px-3 py-1 text-sm font-semibold ${(!done||claimed)?"bg-white/10 text-slate-400 cursor-not-allowed":"bg-emerald-500 text-emerald-950"}`}
                        >
                          {claimed? "Claimed" : done? "Claim" : "In progress"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Chest */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Daily Chest 🎁</h3>
                  <span className="text-xs text-slate-400">{Date.now()<nextChestAt? `Next in ${chestCountdown}`: "Ready!"}</span>
                </div>
                <button onClick={openChest} disabled={Date.now()<nextChestAt}
                        className={`w-full rounded-xl px-3 py-2 text-sm font-semibold ${Date.now()<nextChestAt?"bg-white/10 cursor-not-allowed":"bg-emerald-500 text-emerald-950"}`}>
                  {Date.now()<nextChestAt? "Come back later" : "Open Chest"}
                </button>
              </div>

              {/* Prestige */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Prestige</div>
                    <div className="text-xs text-slate-400">Earn shards for permanent boost</div>
                  </div>
                  <div className="text-sm">Shards: <span className="font-bold">{shards}</span></div>
                </div>
                <div className="mt-2 text-xs text-slate-300">Current gain if reset now: <b>{shardGain}</b> shards</div>
                <button onClick={doPrestige} className="mt-2 w-full rounded-xl bg-amber-400 text-amber-950 px-3 py-2 text-sm font-bold">Reset & Gain Shards</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards modal */}
      <CardsModal open={cardsOpen} onClose={()=>setCardsOpen(false)} />
    </div>
  );
}

/* ---------- tiny components used above ---------- */
function Quest({title,reward,onClaim}:{title:string;reward:number;onClaim:()=>void}){
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-400">Reward: {reward} coins</div>
      </div>
      <button onClick={onClaim} className="rounded-xl bg-emerald-500 px-3 py-1 text-sm font-semibold text-emerald-950">Claim</button>
    </div>
  );
}

function LuckySpin({nextSpinAt,setNextSpinAt,onReward,countdown}:{nextSpinAt:number; setNextSpinAt:(v:number)=>void; onReward:(r:Reward)=>void; countdown:string;}){
  const ready = Date.now()>=nextSpinAt;
  const spin = ()=>{
    if(!ready) return;
    const pool:Reward[] = [
      {kind:"coins", amount: 100+rand(0,200)},
      {kind:"energy", amount: 20},
      {kind:"tap", amount: 1},
      {kind:"auto", amount: 1},
    ];
    const r = pool[Math.floor(Math.random()*pool.length)];
    onReward(r);
    const next = Date.now()+ 60*60*1000; setNextSpinAt(next); lsSet("nextSpinAt", next);
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
      <div>
        <div className="font-semibold">Lucky Spin 🎡</div>
        <div className="text-xs text-slate-400">{ready? "Ready!" : `Next in ${countdown}`}</div>
      </div>
      <button disabled={!ready} onClick={spin}
              className={`rounded-xl px-3 py-1 text-sm font-semibold ${ready?"bg-amber-300 text-amber-950":"bg-white/10 text-slate-400 cursor-not-allowed"}`}>
        Spin
      </button>
    </div>
  );
}

/* ---------- local fake leaderboard helper ---------- */
function ensureWeekBoard(name:string, score:number):LBRow[]{
  const base:LBRow[] = [
    {id:"1", name:"Alice", score: 15000},
    {id:"2", name:"Bob", score: 12000},
    {id:"3", name:"Cara", score: 9000},
  ];
  const you:LBRow = {id:"you", name, score, you:true};
  return [you, ...base].sort((a,b)=> b.score-a.score);
}
