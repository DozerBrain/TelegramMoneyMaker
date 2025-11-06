import React, { useEffect, useMemo, useRef, useState } from 'react'

// Telegram Mini App: Idle Tapper Starter
// - Works inside Telegram WebApp
// - Tailwind styling
// - LocalStorage persistence (replace with your backend later)
// - Referral support via ?startapp=ref_<code> or ?ref=<code>
// - TON payment placeholder

type ShopItem = {
  id: string
  name: string
  kind: 'upgrade' | 'consumable'
  cost: number
  apply: () => void
}

declare global {
  interface Window {
    Telegram?: any
  }
}

export default function App() {
  const tg = (typeof window !== 'undefined' && window.Telegram?.WebApp) || null

  const [username, setUsername] = useState<string>('Player')
  const [score, setScore] = useState<number>(() => lsGetNumber('score', 0))
  const [energy, setEnergy] = useState<number>(() => lsGetNumber('energy', 50))
  const [maxEnergy, setMaxEnergy] = useState<number>(() => lsGetNumber('maxEnergy', 50))
  const [tapPower, setTapPower] = useState<number>(() => lsGetNumber('tapPower', 1))
  const [autoRate, setAutoRate] = useState<number>(() => lsGetNumber('autoRate', 0)) // points/sec
  const [regenRate, setRegenRate] = useState<number>(() => lsGetNumber('regenRate', 5)) // energy per minute
  const [coins, setCoins] = useState<number>(() => lsGetNumber('coins', 0)) // soft currency
  const [refCode, setRefCode] = useState<string>('')
  const [streak, setStreak] = useState<number>(() => lsGetNumber('streak', 0))
  const [lastLogin, setLastLogin] = useState<number>(() => lsGetNumber('lastLogin', 0))
  const [showShop, setShowShop] = useState<boolean>(false)
  const [showQuests, setShowQuests] = useState<boolean>(true)

  // INIT
  useEffect(() => {
    try {
      if (tg) {
        tg.expand?.()
        tg.ready?.()
        tg.setHeaderColor('#0f172a');
tg.setBackgroundColor('#0b1220');
        const uname =
          tg.initDataUnsafe?.user?.first_name ||
          tg.initDataUnsafe?.user?.username ||
          'Player'
        setUsername(uname)

        // Referral param
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

        // Streak logic
        const now = Date.now()
        const last = lastLogin || 0
        const days = Math.floor((now - last) / 86400000)
        if (last === 0 || days === 0) {
          // same-day login
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Ticks
  useInterval(() => {
    if (autoRate > 0) setScore((s) => s + autoRate)
  }, 1000)

  useInterval(() => {
    const perSec = regenRate / 60
    setEnergy((e) => Math.min(maxEnergy, e + perSec))
  }, 1000)

  const onTap = () => {
    if (energy >= 1) {
      setScore((s) => s + tapPower)
      setEnergy((e) => Math.max(0, e - 1))
    } else {
      toast('No energy. Wait a bit ⏳')
    }
  }

  // Shop items
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

  // Booster (client-side demo)
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

  const buyWithTON = async () => {
    toast('TON payment coming soon. Use coins for now.')
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HyperTap 🐹</h1>
          <p className="text-slate-300 text-sm">Welcome, {username}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">{format(score)} pts</div>
          <div className="text-xs text-slate-400">Streak: {streak} days</div>
        </div>
      </div>

      <div className="w-full max-w-md mt-4">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Energy</span>
          <span>{Math.floor(energy)}/{maxEnergy}</span>
        </div>
        <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
          <div className="h-3 rounded-full bg-sky-400 transition-all" style={{ width: `${(energy / maxEnergy) * 100}%` }} />
        </div>
      </div>

      <button onClick={onTap} className="mt-6 w-56 h-56 rounded-full shadow-xl bg-sky-500 active:scale-95 transition grid place-items-center text-3xl font-extrabold">
        TAP
        <span className="block text-xs font-normal opacity-80">+{tapPower} / tap</span>
      </button>

      <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md">
        <Stat label="Coins" value={format(coins)} />
        <Stat label="Auto/sec" value={autoRate} />
        <Stat label="Regen/min" value={regenRate} />
      </div>

      <div className="mt-6 flex gap-2">
        <TabButton active={showQuests} onClick={() => { setShowQuests(true); setShowShop(false) }}>Quests</TabButton>
        <TabButton active={showShop} onClick={() => { setShowShop(true); setShowQuests(false) }}>Shop</TabButton>
      </div>

      <div className="w-full max-w-md mt-3">
        {showQuests && (
          <div className="space-y-2">
            <Quest title="Daily Login" reward={20} onClaim={() => setCoins((c) => c + 20)} />
            <Quest title="Follow Channel" reward={50} onClaim={() => setCoins((c) => c + 50)} />
            <Quest title="Invite a Friend" reward={150} onClaim={() => setCoins((c) => c + 150)} subtitle={`Your code: ${getOrMakeCode()}`} />
            {refCode && <div className="text-xs text-slate-300">Joined via ref: {refCode}</div>}
          </div>
        )}
        {showShop && (
          <div className="space-y-2">
            {shop.map((item) => (
              <div key={item.id} className="bg-slate-700/60 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-300">Cost: {item.cost} coins</div>
                </div>
                <button className="px-3 py-1 rounded-xl bg-sky-500 text-sm" onClick={() => buy(item)}>Buy</button>
              </div>
            ))}
            <button className="w-full mt-2 px-3 py-2 rounded-xl bg-emerald-500" onClick={buyWithTON}>Buy Coins with TON (coming soon)</button>
          </div>
        )}
      </div>

      <div className="opacity-60 text-xs mt-8 mb-4 text-center max-w-md">
        Demo build. Replace localStorage with a secure backend and validate Telegram initData on the server. ⚠️
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-700/60 rounded-2xl p-3 text-center">
      <div className="text-xs text-slate-300">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-2xl text-sm ${active ? 'bg-slate-100 text-slate-900' : 'bg-slate-700/60 text-slate-100'}`}>{children}</button>
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
    <div className="bg-slate-700/60 rounded-2xl p-3 flex items-center justify-between">
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-slate-300">{subtitle}</div>}
        <div className="text-xs text-slate-300">Reward: {reward} coins</div>
      </div>
      <button onClick={claim} disabled={claimed} className={`px-3 py-1 rounded-xl text-sm ${claimed ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-500'}`}>{claimed ? 'Claimed' : 'Claim'}</button>
    </div>
  )
}

// Utils
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
    // eslint-disable-next-line no-console
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
