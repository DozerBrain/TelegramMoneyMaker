import React, { useEffect, useMemo, useRef, useState } from 'react'

type ShopItem = {
  id: string
  name: string
  kind: 'upgrade' | 'consumable'
  cost: number
  apply: () => void
}

type Particle = { id: number; x: number; y: number; value: number }

declare global {
  interface Window { Telegram?: any }
}

export default function App() {
  const tg = (typeof window !== 'undefined' && window.Telegram?.WebApp) || null

  const [username, setUsername] = useState<string>('Player')
  const [score, setScore] = useState<number>(() => lsGetNumber('score', 0))
  const [energy, setEnergy] = useState<number>(() => lsGetNumber('energy', 50))
  const [maxEnergy, setMaxEnergy] = useState<number>(() => lsGetNumber('maxEnergy', 50))
  const [tapPower, setTapPower] = useState<number>(() => lsGetNumber('tapPower', 1))
  const [autoRate, setAutoRate] = useState<number>(() => lsGetNumber('autoRate', 0))
  const [regenRate, setRegenRate] = useState<number>(() => lsGetNumber('regenRate', 5))
  const [coins, setCoins] = useState<number>(() => lsGetNumber('coins', 0))
  const [refCode, setRefCode] = useState<string>('')
  const [streak, setStreak] = useState<number>(() => lsGetNumber('streak', 0))
  const [lastLogin, setLastLogin] = useState<number>(() => lsGetNumber('lastLogin', 0))
  const [showShop, setShowShop] = useState<boolean>(false)
  const [showQuests, setShowQuests] = useState<boolean>(true)

  const mascotRef = useRef<HTMLImageElement | null>(null)
  const tapCardRef = useRef<HTMLDivElement | null>(null)

  // particles
  const [particles, setParticles] = useState<Particle[]>([])
  const nextPid = useRef(1)

  // INIT
  useEffect(() => {
    try {
      if (tg) {
        tg.expand?.()
        tg.ready?.()
        tg.setHeaderColor?.('#0f172a')
        tg.setBackgroundColor?.('#0b1220')

        const uname =
          tg.initDataUnsafe?.user?.first_name ||
          tg.initDataUnsafe?.user?.username ||
          'Player'
        setUsername(uname)

        const startParam: string | undefined = tg.initDataUnsafe?.start_param
        const urlParam: string | null = new URLSearchParams(window.location.search).get('ref')
        const ref = (startParam || urlParam || '').replace(/^ref_/i, '')
        if (ref) {
          setRefCode(ref)
          once('ref_bonus', () => {
            setCoins((c) => c + 50)
            toast('Referral bonus +50 🔰')
          })
        }

        const now = Date.now()
        const last = lastLogin || 0
        const days = Math.floor((now - last) / 86400000)
        if (last === 0 || days === 0) {
          // no change
        } else if (days === 1) {
          setStreak((s) => s + 1)
          setCoins((c) => c + 20 * Math.min(7, (streak || 0) + 1))
          toast('Daily streak +1 ⭐')
        } else if (days > 1) {
          setStreak(1)
          toast('Streak reset')
        }
        setLastLogin(now)
      }
    } catch {}
  }, [])

  // Persist state
  useEffect(() => { lsSet('score', score) }, [score])
  useEffect(() => { lsSet('energy', energy) }, [energy])
  useEffect(() => { lsSet('maxEnergy', maxEnergy) }, [maxEnergy])
  useEffect(() => { lsSet('tapPower', tapPower) }, [tapPower])
  useEffect(() => { lsSet('autoRate', autoRate) }, [autoRate])
  useEffect(() => { lsSet('regenRate', regenRate) }, [regenRate])
  useEffect(() => { lsSet('coins', coins) }, [coins])
  useEffect(() => { lsSet('refCode', refCode) }, [refCode])
  useEffect(() => { lsSet('streak', streak) }, [streak])
  useEffect(() => { lsSet('lastLogin', lastLogin) }, [lastLogin])

  useInterval(() => { if (autoRate > 0) setScore((s) => s + autoRate) }, 1000)
  useInterval(() => {
    const perSec = regenRate / 60
    setEnergy((e) => Math.min(maxEnergy, e + perSec))
  }, 1000)

  const spawnParticle = (clientX?: number, clientY?: number) => {
    const card = tapCardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    // default to center
    let x = 50, y = 55
    if (clientX !== undefined && clientY !== undefined) {
      x = ((clientX - rect.left) / rect.width) * 100
      y = ((clientY - rect.top) / rect.height) * 100
    }
    const id = nextPid.current++
    setParticles(ps => [...ps, { id, x, y, value: tapPower }])
    setTimeout(() => setParticles(ps => ps.filter(p => p.id !== id)), 800)
  }

  const onTap = (e?: React.MouseEvent) => {
    if (energy >= 1) {
      setScore((s) => s + tapPower)
      setEnergy((e_) => Math.max(0, e_ - 1))

      const el = mascotRef.current
      if (el) {
        el.classList.remove('mrT-pop')
        void el.offsetWidth
        el.classList.add('mrT-pop')
      }
      spawnParticle(e?.clientX, e?.clientY)
      tg?.HapticFeedback?.impactOccurred?.('medium')
    } else toast('No energy. Wait a bit ⏳')
  }

  useEffect(() => {
    if (score > 0 && score % 1000 === 0) {
      const el = mascotRef.current
      if (el) {
        el.classList.add('mrT-shake')
        setTimeout(() => el.classList.remove('mrT-shake'), 900)
      }
      tg?.HapticFeedback?.notificationOccurred?.('success')
    }
  }, [score])

  const shop = useMemo<ShopItem[]>(() => [
    { id: 'tap1', name: '+1 Tap Power', kind: 'upgrade', cost: 100, apply: () => setTapPower((x) => x + 1) },
    { id: 'energy10', name: '+10 Max Energy', kind: 'upgrade', cost: 150, apply: () => setMaxEnergy((x) => x + 10) },
    { id: 'auto1', name: '+1 Auto/sec', kind: 'upgrade', cost: 300, apply: () => setAutoRate((x) => x + 1) },
    { id: 'regen5', name: '+5 Energy/min', kind: 'upgrade', cost: 250, apply: () => setRegenRate((x) => x + 5) },
    { id: 'booster', name: 'Booster x2 (5m)', kind: 'consumable', cost: 200, apply: () => booster(5) },
  ], [])

  const buy = (item: ShopItem) => {
    if (coins < item.cost) return toast('Not enough coins 💰')
    setCoins((c) => c - item.cost)
    item.apply()
    toast(`Purchased ${item.name} ✅`)
  }

  const booster = (minutes: number) => {
    const oldTap = tapPower
    const oldAuto = autoRate
    setTapPower((p) => p * 2)
    setAutoRate((a) => a * 2)
    setTimeout(() => {
      setTapPower(oldTap)
      setAutoRate(oldAuto)
      toast('Booster ended')
    }, minutes * 60 * 1000)
  }

  const buyWithTON = async () => toast('TON payment coming soon. Use coins for now.')

  return (
    <div className="min-h-screen w-full text-slate-100 bg-[radial-gradient(1200px_700px_at_80%_-10%,#16202c_0%,#0b111a_55%)]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-5 flex flex-col items-center">

        {/* Header */}
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

        {/* Stat chips */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          <Chip label="Coins" value={format(coins)} />
          <Chip label="Auto/sec" value={autoRate} />
          <Chip label="Regen/min" value={regenRate} />
        </div>

        {/* Energy bar */}
        <Bar
          className="mt-4 w-full"
          label="Energy"
          percent={Math.round((energy / maxEnergy) * 100)}
          right={`${Math.floor(energy)}/${maxEnergy}`}
          color="emerald"
        />

        {/* Mascot + Tap + Particles */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          <img
            ref={mascotRef}
            src="/mr-t.png"
            alt="Mr.T"
            draggable={false}
            className="pointer-events-none mx-auto w-56 select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] mrT-idle"
          />

          {/* floating +cash */}
          {particles.map(p => (
            <span
              key={p.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300/90 drop-shadow"
              style={{ left: `${p.x}%`, top: `${p.y}%`, animation: 'floatUp 800ms ease-out forwards' }}
            >
              +{p.value}
            </span>
          ))}

          <button
            onClick={(e) => onTap(e)}
            className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 text-3xl font-extrabold shadow-[0_18px_40px_rgba(16,185,129,0.35)] active:scale-[0.98] transition"
          >
            TAP
            <span className="block text-xs font-semibold opacity-80">+{tapPower} / tap</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <TabButton active={showQuests} onClick={() => { setShowQuests(true); setShowShop(false) }}>Quests</TabButton>
          <TabButton active={showShop} onClick={() => { setShowShop(true); setShowQuests(false) }}>Shop</TabButton>
        </div>

        {/* Panels */}
        <div className="mt-3 w-full">
          {showQuests && (
            <Card className="divide-y divide-white/10">
              <Quest title="Daily Login" reward={20} onClaim={() => setCoins((c) => c + 20)} />
              <Quest title="Follow Channel" reward={50} onClaim={() => setCoins((c) => c + 50)} />
              <Quest title="Invite a Friend" reward={150} onClaim={() => setCoins((c) => c + 150)} subtitle={`Your code: ${getOrMakeCode()}`} />
              {refCode && (
                <div className="py-3 text-center text-xs text-slate-300">
                  Joined via ref: <span className="font-semibold text-slate-200">{refCode}</span>
                </div>
              )}
            </Card>
          )}

          {showShop && (
            <Card>
              <div className="space-y-2">
                {shop.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-slate-300">Cost: {item.cost} coins</div>
                    </div>
                    <button className="rounded-xl bg-sky-500 px-3 py-1 text-sm font-semibold text-slate-950" onClick={() => buy(item)}>
                      Buy
                    </button>
                  </div>
                ))}
                <button className="mt-2 w-full rounded-xl bg-emerald-500 px-3 py-2 font-semibold text-emerald-950" onClick={buyWithTON}>
                  Buy Coins with TON (coming soon)
                </button>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-6 max-w-md text-center text-xs text-slate-400">
          Demo build. Replace localStorage with a secure backend and validate Telegram initData on the server. ⚠️
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .mrT-idle { animation: breathe 2.4s ease-in-out infinite; }
        @keyframes pop { 0%{transform:scale(1)} 35%{transform:scale(1.06)} 100%{transform:scale(1)} }
        .mrT-pop { animation: pop 220ms ease-out; }
        @keyframes shake { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
        .mrT-shake { animation: shake 0.6s ease-in-out; }
        @keyframes floatUp {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(-50%, -140%) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ---------- UI atoms ---------- */
function Chip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>{children}</section>
}

function Bar({
  label, percent, right, color = 'emerald', className = '',
}: { label: string; percent: number; right?: React.ReactNode; color?: 'emerald'|'sky'|'amber'; className?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-400',
    sky: 'bg-sky-400',
    amber: 'bg-amber-400',
  }
  const trailMap: Record<string, string> = {
    emerald: 'bg-emerald-400/15',
    sky: 'bg-sky-400/15',
    amber: 'bg-amber-400/15',
  }
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums">{right}</span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${trailMap[color]}`}>
        <div className={`h-full ${colorMap[color]} transition-[width]`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] ' +
        (active
          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shadow-inner'
          : 'border border-white/10 bg-white/5 text-slate-100 hover:bg-white/7')
      }
    >
      {children}
    </button>
  )
}

function Quest({ title, reward, onClaim, subtitle }: { title: string; reward: number; onClaim: () => void; subtitle?: string }) {
  const [claimed, setClaimed] = useState<boolean>(() => getQuestClaimed(title))
  const claim = () => {
    if (claimed) return
    setClaimed(true)
    setQuestClaimed(title)
    onClaim()
    toast(`Claimed +${reward} coins ✅`)
  }
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-slate-300">{subtitle}</div>}
        <div className="text-xs text-slate-400">Reward: {reward} coins</div>
      </div>
      <button
        onClick={claim}
        disabled={claimed}
        className={`rounded-lg px-3 py-1 text-xs font-semibold ${claimed ? 'bg-white/10 text-slate-400 cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-200'}`}
      >
        {claimed ? 'Claimed' : 'Claim'}
      </button>
    </div>
  )
}

/* ---------- Utils ---------- */
function useInterval(cb: () => void, ms: number) {
  const saved = useRef(cb)
  useEffect(() => { saved.current = cb }, [cb])
  useEffect(() => {
    if (ms === null) return
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

function toast(msg: string) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showPopup) {
    window.Telegram.WebApp.showPopup({ title: '', message: msg, buttons: [{ type: 'ok', text: 'OK' }] })
  } else {
    console.log('[toast]', msg)
  }
}

function lsGetNumber(key: string, fallback: number) {
  try {
    const v = localStorage.getItem(key)
    if (!v) return fallback
    const n = Number(v)
    return isNaN(n) ? fallback : n
  } catch {
    return fallback
  }
}
function lsSet(key: string, v: any) {
  try { localStorage.setItem(key, String(v)) } catch {}
}

function once(key: string, fn: () => void) {
  try {
    const k = `once_${key}`
    if (!localStorage.getItem(k)) { fn(); localStorage.setItem(k, '1') }
  } catch { fn() }
}

function getQuestClaimed(title: string): boolean {
  try { return localStorage.getItem(`q_${slug(title)}`) === '1' } catch { return false }
}
function setQuestClaimed(title: string) {
  try { localStorage.setItem(`q_${slug(title)}`, '1') } catch {}
}

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
function format(n: number) { return n.toLocaleString() }
function getOrMakeCode(): string {
  try {
    let code = localStorage.getItem('ref_code')
    if (!code) { code = `U${Math.random().toString(36).slice(2,8).toUpperCase()}`; localStorage.setItem('ref_code', code) }
    return code
  } catch { return 'YOURCODE' }
}
