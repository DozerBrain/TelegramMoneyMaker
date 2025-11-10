import React, { useEffect, useMemo, useRef, useState } from "react";
import CardsModal from "./cards/CardsModal";

/* ========= Version tag ========= */
const MM_VERSION = "ALLPACK v1.0";

/* Types */
type Particle = { id: number; x: number; y: number; value: number };
type Ripple   = { id: number };

/* LocalStorage helpers */
const lsSet = (k:string,v:any)=> localStorage.setItem(k, typeof v==="string"? v: JSON.stringify(v));
const lsGet = (k:string, d:string)=> localStorage.getItem(k) ?? d;
const lsn   = (k:string, d:number)=> { const v = localStorage.getItem(k); return v? Number(v) : d; };

/* Simple intervals */
function useInterval(fn:()=>void, ms:number){ useEffect(()=>{const id=setInterval(fn,ms); return ()=>clearInterval(id)},[fn,ms]) }

/* UI bits */
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
function TabButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const { active, className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition
        ${active ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-slate-200 hover:bg-white/15"}
        ${className}`}
    />
  );
}
const fmt=(n:number)=> n.toLocaleString();

/* ============================================================
   App
============================================================ */
export default function App() {
  /* Telegram (optional) */
  const tg = (typeof window !== "undefined" && (window as any).Telegram?.WebApp) || null;

  /* Core state (minimal to run) */
  const [username, setUsername] = useState(()=> lsGet("username","Player"));
  const [score, setScore]       = useState(()=> lsn("score", 0));
  const [taps, setTaps]         = useState(()=> lsn("taps", 0));
  const [energy, setEnergy]     = useState(()=> lsn("energy", 50));
  const [maxEnergy, setMaxEnergy] = useState(()=> lsn("maxEnergy", 50));
  const [tapPower, setTapPower] = useState(()=> lsn("tapPower", 1));
  const [streak, setStreak]     = useState(()=> lsn("streak", 0));
  const [lastLogin, setLastLogin] = useState(()=> lsn("lastLogin", 0));

  /* Cards modal */
  const [cardsOpen, setCardsOpen] = useState(false);

  /* FX/UI */
  const mascotRef = useRef<HTMLImageElement>(null);
  const tapCardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples]     = useState<Ripple[]>([]);
  const pid = useRef(1); const rid = useRef(1);

  /* Init */
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
      else if (days===1) { setStreak(s=>s+1); }
      else { setStreak(1) }
      setLastLogin(now);
    }catch{}
    // eslint-disable-next-line
  },[]);

  /* Persist */
  useEffect(()=>{
    lsSet("score",score); lsSet("taps",taps); lsSet("energy",energy); lsSet("maxEnergy",maxEnergy);
    lsSet("tapPower",tapPower); lsSet("streak",streak); lsSet("lastLogin",lastLogin);
  },[score,taps,energy,maxEnergy,tapPower,streak,lastLogin]);

  /* Loops */
  useInterval(()=>{ const p = 5/60; setEnergy(e=>Math.min(maxEnergy, e+p)) },1000); // regenRate=5/min baseline

  /* Tap helpers */
  const spawnParticle = (cx?:number, cy?:number)=>{
    const rect = tapCardRef.current?.getBoundingClientRect(); if(!rect) return;
    const id = pid.current++; const x = cx?((cx-rect.left)/rect.width)*100:50; const y = cy?((cy-rect.top)/rect.height)*100:58;
    const shown = Math.max(1, Math.floor(tapPower));
    setParticles(ps=>[...ps,{id,x,y,value:shown}]); setTimeout(()=> setParticles(ps=>ps.filter(p=>p.id!==id)), 850);
  };
  const spawnRipple = ()=>{ const id=rid.current++; setRipples(rs=>[...rs,{id}]); setTimeout(()=>setRipples(rs=>rs.filter(r=>r.id!==id)),450) };

  const onTap = (e?:React.MouseEvent)=>{
    if (energy<1) return;
    setScore(s=>s+tapPower); setTaps(t=>t+1); setEnergy(e_=>Math.max(0,e_-1));
    mascotRef.current?.classList.remove("mrT-pop"); void mascotRef.current?.offsetWidth; mascotRef.current?.classList.add("mrT-pop");
    spawnParticle(e?.clientX,e?.clientY); spawnRipple();
    tg?.HapticFeedback?.impactOccurred?.("medium");
  };

  /* UI states for tabs (minimal) */
  const [showQuests, setShowQuests] = useState(true);
  const [showShop, setShowShop]     = useState(false);
  const [showMore, setShowMore]     = useState(false);

  return (
    <div className="min-h-screen w-full text-slate-100 relative overflow-hidden">
      {/* emerald bg blobs */}
      <div className="absolute inset-0 -z-10 bg-[#0b1220]">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[90px]" />
        <div className="absolute top-1/2 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[90px]" />
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

        {/* play card */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          {/* soft glow */}
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/15 blur-2xl"></div>

          {/* NEW: Cards button (top-right) */}
          <button
            onClick={() => setCardsOpen(true)}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/15 active:scale-[0.98]"
          >
            <span className="text-lg">🃏</span>
            <span>Cards</span>
          </button>

          {/* mascot */}
          <img ref={mascotRef} src="/mr-t.png" alt="Mr.T" draggable={false}
               className="pointer-events-none mx-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
               style={{maxHeight:"42vh", height:"42vh", width:"auto", objectFit:"contain"}} />

          {/* tap floaters */}
          {particles.map(p=>(
            <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300 drop-shadow"
                  style={{left:`${p.x}%`, top:`${p.y}%`, animation:"floatUp 850ms ease-out forwards"}}>+{p.value}</span>
          ))}

          {/* ripple + button */}
          <div className="relative flex justify-center mt-4">
            {ripples.map(r=> <span key={r.id} className="absolute h-44 w-44 rounded-full bg-emerald-400/20 blur-[2px]" style={{animation:"ripple 450ms ease-out forwards"}}/>)}
            <button onClick={(e)=>onTap(e)}
              className="relative z-[1] grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 text-3xl font-extrabold shadow-[0_18px_40px_rgba(16,185,129,0.35)] active:scale-[0.98] transition">
              TAP
              <span className="block text-xs font-semibold opacity-80">+{tapPower} / tap</span>
            </button>
          </div>
        </div>

        {/* main tabs (stub so app runs; you can expand with your original panels) */}
        <div className="mt-5 flex gap-2">
          <TabButton active={showQuests} onClick={()=>{setShowQuests(true); setShowShop(false); setShowMore(false);}}>Quests</TabButton>
          <TabButton active={showShop} onClick={()=>{setShowShop(true); setShowQuests(false); setShowMore(false);}}>Shop</TabButton>
          <TabButton active={showMore} onClick={()=>{setShowMore(true); setShowShop(false); setShowQuests(false);}}>More</TabButton>
        </div>

        {/* panels (placeholder content) */}
        <div className="mt-3 w-full">
          {showQuests && (<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Your Quests panel goes here.</div>)}
          {showShop &&   (<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Your Shop panel goes here.</div>)}
          {showMore &&   (<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Your More panel goes here.</div>)}
        </div>
      </div>

      {/* Cards modal (global) */}
      <CardsModal open={cardsOpen} onClose={()=>setCardsOpen(false)} />
    </div>
  );
}
