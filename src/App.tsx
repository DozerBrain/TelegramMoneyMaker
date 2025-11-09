import React, { useEffect, useMemo, useRef, useState } from 'react'

type ShopItem = { id: string; name: string; kind: 'upgrade' | 'consumable'; cost: number; apply: () => void }
type Particle = { id: number; x: number; y: number; value: number }

declare global { interface Window { Telegram?: any } }

export default function App() {
  const tg = (typeof window !== 'undefined' && window.Telegram?.WebApp) || null

  const [username, setUsername] = useState('Player')
  const [score, setScore] = useState(() => lsGetNumber('score', 0))
  const [energy, setEnergy] = useState(() => lsGetNumber('energy', 50))
  const [maxEnergy, setMaxEnergy] = useState(() => lsGetNumber('maxEnergy', 50))
  const [tapPower, setTapPower] = useState(() => lsGetNumber('tapPower', 1))
  const [autoRate, setAutoRate] = useState(() => lsGetNumber('autoRate', 0))
  const [regenRate, setRegenRate] = useState(() => lsGetNumber('regenRate', 5))
  const [coins, setCoins] = useState(() => lsGetNumber('coins', 0))
  const [refCode, setRefCode] = useState('')
  const [streak, setStreak] = useState(() => lsGetNumber('streak', 0))
  const [lastLogin, setLastLogin] = useState(() => lsGetNumber('lastLogin', 0))
  const [showShop, setShowShop] = useState(false)
  const [showQuests, setShowQuests] = useState(true)

  const mascotRef = useRef<HTMLImageElement>(null)
  const tapCardRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const nextPid = useRef(1)

  /* --- INIT --- */
  useEffect(() => {
    if (!tg) return
    tg.expand?.(); tg.ready?.()
    tg.setHeaderColor?.('#0f172a'); tg.setBackgroundColor?.('#0b1220')

    const uname = tg.initDataUnsafe?.user?.first_name || tg.initDataUnsafe?.user?.username || 'Player'
    setUsername(uname)

    const ref = (tg.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('ref') || '').replace(/^ref_/i, '')
    if (ref) { setRefCode(ref); once('ref_bonus', () => { setCoins(c => c + 50); toast('Referral bonus +50 🔰') }) }

    const now = Date.now(), last = lastLogin || 0, days = Math.floor((now - last) / 86400000)
    if (last === 0 || days === 0) {} 
    else if (days === 1) { setStreak(s => s + 1); setCoins(c => c + 20 * Math.min(7, (streak || 0) + 1)); toast('Daily streak +1 ⭐') } 
    else if (days > 1) { setStreak(1); toast('Streak reset') }
    setLastLogin(now)
  }, [])

  /* --- Persist state --- */
  useEffect(() => { lsSet('score', score) }, [score])
  useEffect(() => { lsSet('energy', energy) }, [energy])
  useEffect(() => { lsSet('maxEnergy', maxEnergy) }, [maxEnergy])
  useEffect(() => { lsSet('tapPower', tapPower) }, [tapPower])
  useEffect(() => { lsSet('autoRate', autoRate) }, [autoRate])
  useEffect(() => { lsSet('regenRate', regenRate) }, [regenRate])
  useEffect(() => { lsSet('coins', coins) }, [coins])
  useEffect(() => { lsSet('streak', streak) }, [streak])
  useEffect(() => { lsSet('lastLogin', lastLogin) }, [lastLogin])

  useInterval(() => { if (autoRate > 0) setScore(s => s + autoRate) }, 1000)
  useInterval(() => { const p = regenRate / 60; setEnergy(e => Math.min(maxEnergy, e + p)) }, 1000)

  /* --- Tap logic --- */
  const spawnParticle = (clientX?: number, clientY?: number) => {
    const rect = tapCardRef.current?.getBoundingClientRect(); if (!rect) return
    const id = nextPid.current++
    const x = clientX ? ((clientX - rect.left) / rect.width) * 100 : 50
    const y = clientY ? ((clientY - rect.top) / rect.height) * 100 : 55
    setParticles(ps => [...ps, { id, x, y, value: tapPower }])
    setTimeout(() => setParticles(ps => ps.filter(p => p.id !== id)), 800)
  }

  const onTap = (e?: React.MouseEvent) => {
    if (energy < 1) return toast('No energy. Wait ⏳')
    setScore(s => s + tapPower)
    setEnergy(e_ => Math.max(0, e_ - 1))
    const el = mascotRef.current
    if (el) { el.classList.remove('mrT-pop'); void el.offsetWidth; el.classList.add('mrT-pop') }
    spawnParticle(e?.clientX, e?.clientY)
    tg?.HapticFeedback?.impactOccurred?.('medium')
  }

  /* --- Shop --- */
  const shop = useMemo<ShopItem[]>(() => [
    { id: 'tap1', name: '+1 Tap Power', kind: 'upgrade', cost: 100, apply: () => setTapPower(x => x + 1) },
    { id: 'energy10', name: '+10 Max Energy', kind: 'upgrade', cost: 150, apply: () => setMaxEnergy(x => x + 10) },
    { id: 'auto1', name: '+1 Auto/sec', kind: 'upgrade', cost: 300, apply: () => setAutoRate(x => x + 1) },
    { id: 'regen5', name: '+5 Energy/min', kind: 'upgrade', cost: 250, apply: () => setRegenRate(x => x + 5) },
  ], [])

  const buy = (item: ShopItem) => {
    if (coins < item.cost) return toast('Not enough coins 💰')
    setCoins(c => c - item.cost); item.apply(); toast(`Purchased ${item.name} ✅`)
  }

  /* --- UI --- */
  return (
    <div className="min-h-screen w-full text-slate-100 bg-[radial-gradient(1200px_700px_at_80%_-10%,#16202c_0%,#0b111a_55%)]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-5 flex flex-col items-center">

        {/* HEADER */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">MoneyMaker 💸</h1>
            <p className="text-xs text-slate-400">Welcome, {username}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right shadow-inner">
            <div className="text-[10px] uppercase text-slate-400">Total</div>
            <div className="text-lg font-extrabold tabular-nums">{format(score)} pts</div>
            <div className="text-[11px] text-slate-400">Streak {streak}d</div>
          </div>
        </div>

        {/* CHIPS */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          <Chip label="Coins" value={format(coins)} />
          <Chip label="Auto/sec" value={autoRate} />
          <Chip label="Regen/min" value={regenRate} />
        </div>

        {/* ENERGY */}
        <Bar className="mt-4 w-full" label="Energy" percent={(energy/maxEnergy)*100} right={`${Math.floor(energy)}/${maxEnergy}`} />

        {/* MASCOT + TAP */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          <img ref={mascotRef} src="/mr-t.png" alt="Mr.T" draggable={false}
               className="pointer-events-none mx-auto w-56 select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] mrT-idle" />

          {particles.map(p=>(
            <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300/90 drop-shadow"
                  style={{left:`${p.x}%`,top:`${p.y}%`,animation:'floatUp 800ms ease-out forwards'}}>+{p.value}</span>
          ))}

          <button onClick={(e)=>onTap(e)}
            className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 text-3xl font-extrabold shadow-[0_18px_40px_rgba(16,185,129,0.35)] active:scale-[0.98] transition">
            TAP
            <span className="block text-xs font-semibold opacity-80">+{tapPower} / tap</span>
          </button>
        </div>

        {/* TABS */}
        <div className="mt-5 flex gap-2">
          <TabButton active={showQuests} onClick={()=>{setShowQuests(true);setShowShop(false)}}>Quests</TabButton>
          <TabButton active={showShop} onClick={()=>{setShowShop(true);setShowQuests(false)}}>Shop</TabButton>
        </div>

        {/* PANELS */}
        <div className="mt-3 w-full">
          {showQuests && (
            <Card className="divide-y divide-white/10">
              <Quest title="Daily Login" reward={20} onClaim={()=>setCoins(c=>c+20)} />
              <Quest title="Follow Channel" reward={50} onClaim={()=>setCoins(c=>c+50)} />
              <Quest title="Invite a Friend" reward={150} onClaim={()=>setCoins(c=>c+150)} subtitle={`Your code: ${getOrMakeCode()}`} />
              {refCode && <div className="py-3 text-center text-xs text-slate-300">Joined via ref: <span className="font-semibold text-slate-200">{refCode}</span></div>}
            </Card>
          )}

          {showShop && (
            <Card>
              {shop.map(i=>(
                <div key={i.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 mb-2">
                  <div><div className="font-semibold">{i.name}</div><div className="text-xs text-slate-300">Cost: {i.cost}</div></div>
                  <button onClick={()=>buy(i)} className="rounded-xl bg-sky-500 px-3 py-1 text-sm font-semibold text-slate-950">Buy</button>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">Demo build. Replace localStorage with backend ⚠️</div>
      </div>

      <style>{`
        @keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.mrT-idle{animation:breathe 2.4s ease-in-out infinite}
        @keyframes pop{0%{transform:scale(1)}35%{transform:scale(1.06)}100%{transform:scale(1)}}.mrT-pop{animation:pop 220ms ease-out}
        @keyframes floatUp{0%{transform:translate(-50%,-50%) scale(0.9);opacity:0}10%{opacity:1}100%{transform:translate(-50%,-140%) scale(1.1);opacity:0}}
      `}</style>
    </div>
  )
}

/* --- UI Components --- */
const Chip = ({label,value}:{label:string;value:any}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
    <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    <div className="font-bold">{value}</div>
  </div>
)
const Card = ({children,className=''}:{children:any;className?:string}) =>
  <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>{children}</section>

const Bar = ({label,percent,right}:{label:string;percent:number;right?:any})=>(
  <div>
    <div className="mb-1 flex justify-between text-xs text-slate-300"><span>{label}</span><span>{right}</span></div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-400/15">
      <div className="h-full bg-emerald-400 transition-[width]" style={{width:`${percent}%`}}/>
    </div>
  </div>
)

const TabButton = ({active,onClick,children}:{active?:boolean;onClick?:()=>void;children:any})=>(
  <button onClick={onClick}
    className={'rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] '+
      (active?'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shadow-inner':'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/7')}>
    {children}
  </button>
)

function Quest({title,reward,onClaim,subtitle}:{title:string;reward:number;onClaim:()=>void;subtitle?:string}) {
  const [claimed,setClaimed]=useState(()=>getQuestClaimed(title))
  const claim=()=>{if(claimed)return;setClaimed(true);setQuestClaimed(title);onClaim();toast(`Claimed +${reward} ✅`)}
  return(
    <div className="flex items-center justify-between py-3">
      <div><div className="font-semibold">{title}</div>{subtitle&&<div className="text-xs text-slate-300">{subtitle}</div>}<div className="text-xs text-slate-400">Reward: {reward}</div></div>
      <button onClick={claim} disabled={claimed}
        className={`rounded-lg px-3 py-1 text-xs font-semibold ${claimed?'bg-white/10 text-slate-400':'bg-emerald-500/20 text-emerald-200'}`}>
        {claimed?'Claimed':'Claim'}
      </button>
    </div>
  )
}

/* --- Utils --- */
function useInterval(cb:()=>void,ms:number){const s=useRef(cb);useEffect(()=>{s.current=cb},[cb]);useEffect(()=>{const id=setInterval(()=>s.current(),ms);return()=>clearInterval(id)},[ms])}
const toast=(m:string)=>window.Telegram?.WebApp?.showPopup?window.Telegram.WebApp.showPopup({message:m,buttons:[{type:'ok',text:'OK'}]}):console.log(m)
const lsGetNumber=(k:string,f:number)=>{try{const v=Number(localStorage.getItem(k));return isNaN(v)?f:v}catch{return f}}
const lsSet=(k:string,v:any)=>{try{localStorage.setItem(k,String(v))}catch{}}
const getQuestClaimed=(t:string)=>localStorage.getItem(`q_${slug(t)}`)==='1'
const setQuestClaimed=(t:string)=>localStorage.setItem(`q_${slug(t)}`,'1')
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-')
const format=(n:number)=>n.toLocaleString()
const getOrMakeCode=()=>{let c=localStorage.getItem('ref_code');if(!c){c='U'+Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem('ref_code',c)}return c}
const once=(k:string,f:()=>void)=>{if(!localStorage.getItem('once_'+k)){f();localStorage.setItem('once_'+k,'1')}}
