import React, { useEffect, useMemo, useRef, useState } from "react";

/* ========= Version tag (visible in header) ========= */
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

/* ============================================================
   App
============================================================ */
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

  /* -------- “meta” systems -------- */
  const [showShop, setShowShop] = useState(false);
  const [showQuests, setShowQuests] = useState(true);
  const [showMore, setShowMore] = useState(false);

  // prestige
  const [shards, setShards] = useState(() => lsn("shards", 0));
  const [prestigeCount, setPrestigeCount] = useState(() => lsn("prestigeCount",0));
  const globalMultiplier = useMemo(()=> 1 + shards*0.1, [shards]); // +10% each shard

  // skins & pets
  type SkinId = "default"|"emeraldSuit"|"goldSuit";
  type PetId  = "none"|"miniCoin"|"owl";
  const [skin, setSkin] = useState<SkinId>(()=> lsGet("skin","default") as SkinId);
  const [pet, setPet]   = useState<PetId>(()=> lsGet("pet","none") as PetId);
  const skinBonus = skin==="emeraldSuit"?1.05: skin==="goldSuit"?1.08: 1;   // affects tap
  const petAuto   = pet==="miniCoin"?1: pet==="owl"?2: 0;                    // +auto/sec

  // sounds
  const [sfxOn, setSfxOn] = useState(()=> lsGet("sfxOn","1")==="1");
  const audioRef = useRef<AudioContext|null>(null);
  const vibe = (type:"tap"|"fever")=>{
    if(!sfxOn) return;
    audioRef.current ??= new (window.AudioContext|| (window as any).webkitAudioContext)();
    const ctx = audioRef.current, o = ctx.createOscillator(), g = ctx.createGain();
    o.type="triangle";
    if(type==="tap"){ o.frequency.value=600; g.gain.value=.05 } else { o.frequency.value=220; g.gain.value=.08 }
    o.connect(g); g.connect(ctx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+(type==="tap"?0.08:0.4));
    o.stop(ctx.currentTime+(type==="tap"?0.09:0.42));
  };

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
    if(nextCombo===100 && !feverActive){ setFeverUntil(now+5000); vibe("fever") }
    // gain
    const gain = Math.floor(tapPower*skinBonus*globalMultiplier*(feverActive?2:1)*nextMult);
    setScore(s=>s+gain); setTaps(t=>t+1); setEnergy(e_=>Math.max(0,e_-1));
    // fx
    mascotRef.current?.classList.remove("mrT-pop"); void mascotRef.current?.offsetWidth; mascotRef.current?.classList.add("mrT-pop");
    spawnParticle(e?.clientX,e?.clientY); spawnRipple(); vibe("tap");
    lastTapAt.current=now; tg?.HapticFeedback?.impactOccurred?.("medium");
  };

  /* -------- shop -------- */
  const shop = useMemo<ShopItem[]>(()=>[
    { id:"tap1", name:"+1 Tap Power", kind:"upgrade", cost:100, apply:()=>{ setTapPower(x=>x+1); setUpgradesBought(u=>u+1); } },
    { id:"energy10", name:"+10 Max Energy", kind:"upgrade", cost:150, apply:()=>{ setMaxEnergy(x=>x+10); setUpgradesBought(u=>u+1); } },
    { id:"auto1", name:"+1 Auto/sec", kind:"upgrade", cost:300, apply:()=>{ setAutoRate(x=>x+1); setUpgradesBought(u=>u+1); } },
    { id:"regen5", name:"+5 Energy/min", kind:"upgrade", cost:250, apply:()=>{ setRegenRate(x=>x+5); setUpgradesBought(u=>u+1); } },
  ],[]);
  const buy = (item:ShopItem)=>{ if(coins<item.cost) return toast("Not enough coins 💰"); setCoins(c=>c-item.cost); item.apply(); toast(`Purchased ${item.name} ✅`) };

  /* -------- leaderboard -------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen w-full text-slate-100 relative overflow-hidden">
      {/* emerald bg blobs */}
      <div className="absolute inset-0 -z-10 bg-[#0b1220]">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[90px] animate-bgMove"></div>
        <div className="absolute top-1/2 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[90px] animate-bgMove2"></div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-24 pt-5 flex flex-col items-center">
        {/* header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              MoneyMaker 💸 <span className="ml-2 rounded-lg bg-white/10 px-2 py-0.5 text-xs align-middle">{MM_VERSION}</span>
            </h1>
            <p className="text-xs text-slate-400">Welcome, {username}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right shadow-inner backdrop-blur-sm">
            <div className="text-[10px] uppercase text-slate-400">TOTAL</div>
            <div className="text-lg font-extrabold tabular-nums">{fmt(score)} pts</div>
            <div className="text-[11px] text-slate-400">Streak {streak}d</div>
          </div>
        </div>

        {/* bars */}
        <Bar className="mt-4 w-full" label="Energy" percent={(energy/maxEnergy)*100} right={`${Math.floor(energy)}/${maxEnergy}`} color="emerald"/>
        <Bar className="mt-2 w-full" label={feverActive?"Fever":"Combo"} percent={feverActive?100:combo} right={feverActive?"x2 BOOST":`x${mult.toFixed(2)} • x${globalMultiplier.toFixed(2)} global`} color={feverActive?"amber":"sky"}/>

        {/* play card */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/15 blur-2xl"></div>
          <img ref={mascotRef} src="/mr-t.png" alt="Mr.T" draggable={false}
               className="pointer-events-none mx-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] mrT-idle"
               style={{maxHeight:"42vh", height:"42vh", width:"auto", objectFit:"contain"}} />
          {particles.map(p=>(
            <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300 drop-shadow"
                  style={{left:`${p.x}%`, top:`${p.y}%`, animation:"floatUp 850ms ease-out forwards"}}>+{p.value}</span>
          ))}
          <div className="relative flex justify-center mt-4">
            {ripples.map(r=> <span key={r.id} className="absolute h-44 w-44 rounded-full bg-emerald-400/20 blur-[2px]" style={{animation:"ripple 450ms ease-out forwards"}}/>)}
            <button onClick={(e)=>onTap(e)}
              className="relative z-[1] grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 text-3xl font-extrabold shadow-[0_18px_40px_rgba(16,185,129,0.35)] active:scale-[0.98] transition">
              TAP
              <span className="block text-xs font-semibold opacity-80">+{tapPower} / tap</span>
            </button>
          </div>
        </div>

        {/* main tabs */}
        <div className="mt-5 flex gap-2">
          <TabButton active={showQuests} onClick={()=>{setShowQuests(true); setShowShop(false); setShowMore(false);}}>Quests</TabButton>
          <TabButton active={showShop} onClick={()=>{setShowShop(true); setShowQuests(false); setShowMore(false);}}>Shop</TabButton>
          <TabButton active={showMore} onClick={()=>{setShowMore(true); setShowShop(false); setShowQuests(false);}}>More</TabButton>
        </div>

        {/* panels */}
        <div className="mt-3 w-full">
          {showQuests && (
            <Card className="divide-y divide-white/10">
              <Quest title="Daily Login" reward={20} onClaim={()=> setCoins(c=>c+20)} />
              <Quest title="Follow Channel" reward={50} onClaim={()=> setCoins(c=>c+50)} />
              <Quest title="Invite a Friend" reward={150} onClaim={()=> setCoins(c=>c+150)} />
              <LuckySpin nextSpinAt={nextSpinAt} setNextSpinAt={(v)=>{setNextSpinAt(v); lsSet("nextSpinAt",v)}} onReward={onReward} countdown={spinCountdown}/>
            </Card>
          )}

          {showShop && (
            <Card>
              <div className="space-y-3">
                {shop.map(i=>(
                  <div key={i.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div><div className="font-semibold">{i.name}</div><div className="text-xs text-slate-300">Cost: {i.cost}</div></div>
                    <button onClick={()=>buy(i)} className="rounded-xl bg-sky-500 px-3 py-1 text-sm font-semibold text-slate-950">Buy</button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showMore && (
            <div className="space-y-3">
              {/* Achievements */}
              <Card>
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
              </Card>

              {/* Daily Chest */}
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Daily Chest 🎁</h3>
                  <span className="text-xs text-slate-400">{Date.now()<nextChestAt? `Next in ${chestCountdown}`: "Ready!"}</span>
                </div>
                <button onClick={openChest} disabled={Date.now()<nextChestAt}
                        className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${Date.now()<nextChestAt?"bg-white/10 text-slate-400 cursor-not-allowed":"bg-emerald-500 text-emerald-950"}`}>
                  {Date.now()<nextChestAt? `Come back in ${chestCountdown}`: "Open Chest"}
                </button>
              </Card>

              {/* Prestige */}
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Prestige ✨</h3>
                  <span className="text-xs text-slate-400">Shards: {shards} • Global x{globalMultiplier.toFixed(2)}</span>
                </div>
                <div className="text-sm text-slate-300">Reset progress for <b>{shardGain}</b> shard(s). Each shard gives <b>+10%</b> forever.</div>
                <button onClick={doPrestige} disabled={shardGain<=0} className={`mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold ${shardGain<=0?"bg-white/10 text-slate-400 cursor-not-allowed":"bg-amber-400 text-amber-950"}`}>Prestige & Rebirth</button>
                <div className="mt-1 text-xs text-slate-400">Prestiges: {prestigeCount}</div>
              </Card>

              {/* Skins & Pets */}
              <Card>
                <h3 className="mb-2 font-bold">Skins & Pets 🐾</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Choice active={skin==="default"} onClick={()=>setSkin("default")} title="Classic" subtitle="No bonus"/>
                  <Choice active={skin==="emeraldSuit"} onClick={()=>setSkin("emeraldSuit")} title="Emerald Suit" subtitle="+5% tap"/>
                  <Choice active={skin==="goldSuit"} onClick={()=>setSkin("goldSuit")} title="Gold Suit" subtitle="+8% tap"/>
                  <Choice active={pet==="none"} onClick={()=>setPet("none")} title="No Pet" subtitle=""/>
                  <Choice active={pet==="miniCoin"} onClick={()=>setPet("miniCoin")} title="Mini Coin" subtitle="+1 auto/sec"/>
                  <Choice active={pet==="owl"} onClick={()=>setPet("owl")} title="Wise Owl" subtitle="+2 auto/sec"/>
                </div>
              </Card>

              {/* Social + Settings */}
              <Card>
                <h3 className="mb-2 font-bold">Boosts & Settings</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>{ setCoins(c=>c+50); toast("Thanks for sharing! +50 💸"); }} className="rounded-xl bg-emerald-500/20 text-emerald-200 px-3 py-2 text-sm font-semibold">Share to Story</button>
                  <button onClick={()=>{ tg?.showPopup?.({message:`Your friend code:\n${friendCode()}`}); }} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">Friend Code</button>
                  <button onClick={()=>{ setSfxOn(v=>!v); }} className={`rounded-xl px-3 py-2 text-sm font-semibold ${sfxOn?"bg-emerald-500/20 text-emerald-200":"bg-white/10"}`}>{sfxOn?"Sound: ON":"Sound: OFF"}</button>
                  <button onClick={()=>{ localStorage.clear(); location.reload() }} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold">Reset Local Data</button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* leaderboard */}
        <Card className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between"><h3 className="font-bold">Weekly Leaderboard 🏆</h3><span className="text-xs text-slate-400">Resets Monday 00:00</span></div>
          <ol className="divide-y divide-white/10">
            {leaderboard.slice(0,10).map((row,i)=>(
              <li key={row.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className={"w-6 text-center font-semibold "+ (i<3?"text-amber-300":"text-slate-400")}>{i+1}</span>
                  <span className={"font-medium "+(row.you?"text-emerald-300":"")}>{row.name}</span>
                </div>
                <span className="tabular-nums">{fmt(row.score)}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">Demo build. Replace localStorage with backend ⚠️</div>
      </div>

      {/* animations */}
      <style>{`
        @keyframes bgMove{0%{transform:translateY(0) translateX(0) scale(1)}50%{transform:translateY(30px) translateX(10px) scale(1.05)}100%{transform:translateY(0) translateX(0) scale(1)}}
        @keyframes bgMove2{0%{transform:translateY(0) translateX(0) scale(1)}50%{transform:translateY(-30px) translateX(-10px) scale(1.05)}100%{transform:translateY(0) translateX(0) scale(1)}}
        .animate-bgMove{animation:bgMove 9s ease-in-out infinite}.animate-bgMove2{animation:bgMove2 12s ease-in-out infinite}
        @keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.mrT-idle{animation:breathe 2.4s ease-in-out infinite}
        @keyframes pop{0%{transform:scale(1)}35%{transform:scale(1.06)}100%{transform:scale(1)}}.mrT-pop{animation:pop 220ms ease-out}
        @keyframes floatUp{0%{transform:translate(-50%,-50%) scale(0.9);opacity:0}10%{opacity:1}100%{transform:translate(-50%,-140%) scale(1.1);opacity:0}}
        @keyframes ripple{0%{transform:scale(0.7);opacity:.7}100%{transform:scale(1.5);opacity:0}}
      `}</style>
    </div>
  );
}

/* ============================================================
   Lucky Spin
============================================================ */
function LuckySpin({ nextSpinAt, setNextSpinAt, onReward, countdown }:{
  nextSpinAt:number; setNextSpinAt:(v:number)=>void; onReward:(r:Reward)=>void; countdown:string;
}) {
  const seg:Reward[] = [
    { kind:"coins", amount:100 }, { kind:"tap", amount:1 }, { kind:"coins", amount:250 }, { kind:"energy", amount:20 },
    { kind:"booster", minutes:5 }, { kind:"coins", amount:500 }, { kind:"auto", amount:1 }, { kind:"coins", amount:150 },
  ];
  const [angle,setAngle] = useState(0); const [spinning,setSpinning]=useState(false);
  const canSpin = Date.now()>=nextSpinAt;
  const spin=()=>{
    if(!canSpin||spinning) return;
    const n=seg.length, idx=Math.floor(Math.random()*n), slice=360/n, center=slice*idx+slice/2;
    const final = 5*360 + (360 - center);
    setSpinning(true); setAngle(final);
    setTimeout(()=>{ onReward(seg[idx]); setSpinning(false); const next=Date.now()+24*60*60*1000; setNextSpinAt(next); lsSet("nextSpinAt",next); }, 2600);
  };
  return (
    <div className="py-3">
      <div className="mb-2 flex items-center justify-between"><div className="font-semibold">Lucky Spin 🎰</div>{canSpin?<span className="text-xs text-emerald-300">Free spin ready!</span>:<span className="text-xs text-slate-400">Next in {countdown}</span>}</div>
      <div className="flex items-center justify-center py-2">
        <div className="relative">
          <div className="absolute left-1/2 top-[-10px] h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-emerald-300 drop-shadow"/>
          <div className="h-40 w-40 rounded-full border border-white/10 shadow-inner"
               style={{background:"conic-gradient(#10b981 0 45deg,#0ea5e9 45deg 90deg,#10b981 90deg 135deg,#f59e0b 135deg 180deg,#10b981 180deg 225deg,#0ea5e9 225deg 270deg,#10b981 270deg 315deg,#f59e0b 315deg 360deg)",
               transform:`rotate(${angle}deg)`, transition:spinning?"transform 2.6s cubic-bezier(0.12,0.68,0,1.02)":"none"}}/>
        </div>
      </div>
      <button onClick={spin} disabled={!canSpin||spinning}
        className={`mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold ${canSpin&&!spinning?"bg-emerald-500 text-emerald-950":"bg-white/10 text-slate-400 cursor-not-allowed"}`}>
        {canSpin? (spinning?"Spinning...":"Spin (Free)") : `Come back in ${countdown}`}
      </button>
    </div>
  );
}

/* ============================================================
   Small UI
============================================================ */
function Card({ children, className=""}:{children:React.ReactNode; className?:string}) {
  return <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>{children}</section>;
}
function Choice({active,onClick,title,subtitle}:{active:boolean; onClick:()=>void; title:string; subtitle:string}) {
  return (
    <button onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left ${active? "border-emerald-400/40 bg-emerald-500/10":"border-white/10 bg-white/5"}`}>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </button>
  );
}
function TabButton({active,onClick,children}:{active?:boolean; onClick?:()=>void; children:React.ReactNode}) {
  return (
    <button onClick={onClick}
      className={'rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] '+
        (active? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shadow-inner'
                : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/7')}>
      {children}
    </button>
  );
}
function Bar({label,percent,right,color="emerald",className=""}:{label:string;percent:number;right?:React.ReactNode;color?:"emerald"|"sky"|"amber";className?:string}) {
  const c = {emerald:"bg-emerald-400", sky:"bg-sky-400", amber:"bg-amber-400"}[color];
  const t = {emerald:"bg-emerald-400/15", sky:"bg-sky-400/15", amber:"bg-amber-400/15"}[color];
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300"><span>{label}</span><span className="tabular-nums">{right}</span></div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${t}`}><div className={`h-full ${c} transition-[width]`} style={{width:`${Math.max(0,Math.min(100,percent))}%`}}/></div>
    </div>
  );
}
function Quest({title,reward,onClaim}:{title:string;reward:number;onClaim:()=>void}) {
  const [claimed,setClaimed]=useState(()=> lsGet(`q_${slug(title)}`,"0")==="1");
  const claim=()=>{ if(claimed) return; setClaimed(true); lsSet(`q_${slug(title)}`,"1"); onClaim(); toast(`+${reward} coins ✅`) };
  return (
    <div className="flex items-center justify-between py-3">
      <div><div className="font-semibold">{title}</div><div className="text-xs text-slate-400">Reward: {reward}</div></div>
      <button onClick={claim} disabled={claimed} className={`rounded-lg px-3 py-1 text-xs font-semibold ${claimed?"bg-white/10 text-slate-400":"bg-emerald-500/20 text-emerald-200"}`}>{claimed?"Claimed":"Claim"}</button>
    </div>
  );
}

/* ============================================================
   Leaderboard helpers
============================================================ */
function ensureWeekBoard(name:string, myScore:number):LBRow[] {
  const key = `lb_week_${weekKey()}`; let rows:LBRow[]=[];
  try{ const raw=localStorage.getItem(key); if(raw) rows=JSON.parse(raw) }catch{}
  if(!rows||rows.length===0) rows = seedBoard();
  const youId="you"; const idx = rows.findIndex(r=>r.id===youId);
  if(idx===-1) rows.push({id:youId, name, score:myScore, you:true}); else rows[idx] = {...rows[idx], name, score:myScore, you:true};
  rows.sort((a,b)=> b.score-a.score); try{ localStorage.setItem(key, JSON.stringify(rows)) }catch{}
  return rows;
}
function seedBoard():LBRow[] {
  const names = ["CryptoPrince","TapMaster","LuckyLuna","TONWhale","GreenStack","CoinWolf","Minty","Blade","Jet","Kira"];
  const rows = names.map((n,i)=>({id:`npc_${i}`, name:n, score: 500+Math.floor(Math.random()*5000)} as LBRow));
  rows.sort((a,b)=>b.score-a.score); return rows;
}
function weekKey(){ const d=new Date(); const first=new Date(d.getFullYear(),0,1); const diff=(d.getTime()-first.getTime())/86400000+first.getDay(); return `${d.getFullYear()}_${Math.ceil(diff/7)}` }

/* ============================================================
   Utils
============================================================ */
function useInterval(cb:()=>void, ms:number){ const s=useRef(cb); useEffect(()=>{s.current=cb},[cb]); useEffect(()=>{const id=setInterval(()=>s.current(),ms); return()=>clearInterval(id)},[ms]) }
const toast=(m:string)=> window.Telegram?.WebApp?.showPopup? window.Telegram.WebApp.showPopup({message:m,buttons:[{type:"ok",text:"OK"}]}): console.log(m);
const lsn=(k:string,f:number)=>{ try{ const n=Number(localStorage.getItem(k)); return isNaN(n)?f:n }catch{ return f } }
const lsSet=(k:string,v:any)=>{ try{ localStorage.setItem(k,String(v)) }catch{} }
const lsGet=(k:string,f:string)=>{ try{ const v=localStorage.getItem(k); return v??f }catch{ return f } }
const slug=(s:string)=> s.toLowerCase().replace(/[^a-z0-9]+/g,"-");
const fmt=(n:number)=> n.toLocaleString();
const dur=(ms:number)=>{ const s=Math.ceil(ms/1000); const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60; return h>0?`${h}h ${m}m`:`${m}m ${ss}s` }
const friendCode=()=>{ let c=lsGet("ref_code",""); if(!c){ c='U'+Math.random().toString(36).slice(2,8).toUpperCase(); lsSet("ref_code",c) } return c }
const rand=(a:number,b:number)=> a+Math.floor(Math.random()*(b-a+1));
