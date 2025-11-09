import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Types ---------- */
type ShopItem = {
  id: string;
  name: string;
  kind: "upgrade" | "consumable";
  cost: number;
  apply: () => void;
};
type Particle = { id: number; x: number; y: number; value: number };
type Ripple = { id: number };
type LBRow = { id: string; name: string; score: number; you?: boolean };

/* ---------- Telegram global ---------- */
declare global { interface Window { Telegram?: any } }

/* ============================================================
   App
============================================================ */
export default function App() {
  const tg = (typeof window !== "undefined" && window.Telegram?.WebApp) || null;

  // Core state
  const [username, setUsername] = useState("Player");
  const [score, setScore] = useState(() => lsGetNumber("score", 0));
  const [energy, setEnergy] = useState(() => lsGetNumber("energy", 50));
  const [maxEnergy, setMaxEnergy] = useState(() => lsGetNumber("maxEnergy", 50));
  const [tapPower, setTapPower] = useState(() => lsGetNumber("tapPower", 1));
  const [autoRate, setAutoRate] = useState(() => lsGetNumber("autoRate", 0));
  const [regenRate, setRegenRate] = useState(() => lsGetNumber("regenRate", 5));
  const [coins, setCoins] = useState(() => lsGetNumber("coins", 0));
  const [streak, setStreak] = useState(() => lsGetNumber("streak", 0));
  const [lastLogin, setLastLogin] = useState(() => lsGetNumber("lastLogin", 0));
  const [showShop, setShowShop] = useState(false);
  const [showQuests, setShowQuests] = useState(true);

  // FX / UI
  const mascotRef = useRef<HTMLImageElement>(null);
  const tapCardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const pid = useRef(1);
  const rid = useRef(1);

  // Combo / Fever
  const lastTapAt = useRef(0);
  const [combo, setCombo] = useState(0);          // 0..100
  const [multiplier, setMultiplier] = useState(1); // 1..3
  const [feverUntil, setFeverUntil] = useState(0); // timestamp ms
  const feverActive = Date.now() < feverUntil;

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!tg) return;
    tg.expand?.(); tg.ready?.();
    tg.setHeaderColor?.("#0b1220");
    tg.setBackgroundColor?.("#0b1220");
    const uname = tg.initDataUnsafe?.user?.first_name || tg.initDataUnsafe?.user?.username || "Player";
    setUsername(uname);

    const now = Date.now();
    const last = lastLogin || 0;
    const days = Math.floor((now - last) / 86400000);
    if (last === 0 || days === 0) {
      // first or same day
    } else if (days === 1) {
      setStreak((s) => s + 1);
      setCoins((c) => c + 20 * Math.min(7, (streak || 0) + 1));
      toast("Daily streak +1 ⭐");
    } else {
      setStreak(1);
      toast("Streak reset");
    }
    setLastLogin(now);
  }, []);

  /* ---------- Persist ---------- */
  useEffect(() => {
    lsSet("score", score);
    lsSet("energy", energy);
    lsSet("maxEnergy", maxEnergy);
    lsSet("tapPower", tapPower);
    lsSet("autoRate", autoRate);
    lsSet("regenRate", regenRate);
    lsSet("coins", coins);
    lsSet("streak", streak);
    lsSet("lastLogin", lastLogin);
  }, [score, energy, maxEnergy, tapPower, autoRate, regenRate, coins, streak, lastLogin]);

  /* ---------- Loops ---------- */
  useInterval(() => { if (autoRate > 0) setScore((s) => s + autoRate) }, 1000);
  useInterval(() => {
    const perSec = regenRate / 60;
    setEnergy((e) => Math.min(maxEnergy, e + perSec));
  }, 1000);

  /* ---------- Tap ---------- */
  const spawnParticle = (clientX?: number, clientY?: number) => {
    const rect = tapCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = pid.current++;
    const x = clientX ? ((clientX - rect.left) / rect.width) * 100 : 50;
    const y = clientY ? ((clientY - rect.top) / rect.height) * 100 : 58;
    setParticles((ps) => [...ps, { id, x, y, value: Math.max(1, Math.floor(tapPower * (feverActive ? 2 : 1) * multiplier)) }]);
    setTimeout(() => setParticles((ps) => ps.filter((p) => p.id !== id)), 850);
  };

  const spawnRipple = () => {
    const id = rid.current++;
    setRipples((rs) => [...rs, { id }]);
    setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 450);
  };

  const onTap = (e?: React.MouseEvent) => {
    if (energy < 1) return toast("No energy. Wait ⏳");

    // Combo logic
    const now = Date.now();
    const within = now - (lastTapAt.current || 0) <= 1000; // 1s window
    const nextCombo = Math.min(100, within ? combo + 7 : 7);
    const nextMult = Math.min(3, 1 + nextCombo / 50); // 1..3
    setCombo(feverActive ? 0 : nextCombo);
    setMultiplier(Number(nextMult.toFixed(2)));
    if (nextCombo === 100 && !feverActive) setFeverUntil(now + 5000); // 5s fever

    // Gain
    const gain = Math.floor(tapPower * (feverActive ? 2 : 1) * nextMult);
    setScore((s) => s + gain);
    setEnergy((e_) => Math.max(0, e_ - 1));

    // FX
    const el = mascotRef.current;
    if (el) { el.classList.remove("mrT-pop"); void el.offsetWidth; el.classList.add("mrT-pop"); }
    spawnParticle(e?.clientX, e?.clientY);
    spawnRipple();
    lastTapAt.current = now;
    tg?.HapticFeedback?.impactOccurred?.("medium");
  };

  /* ---------- Shop ---------- */
  const shop = useMemo<ShopItem[]>(
    () => [
      { id: "tap1", name: "+1 Tap Power", kind: "upgrade", cost: 100, apply: () => setTapPower((x) => x + 1) },
      { id: "energy10", name: "+10 Max Energy", kind: "upgrade", cost: 150, apply: () => setMaxEnergy((x) => x + 10) },
      { id: "auto1", name: "+1 Auto/sec", kind: "upgrade", cost: 300, apply: () => setAutoRate((x) => x + 1) },
      { id: "regen5", name: "+5 Energy/min", kind: "upgrade", cost: 250, apply: () => setRegenRate((x) => x + 5) },
    ],
    []
  );

  const buy = (item: ShopItem) => {
    if (coins < item.cost) return toast("Not enough coins 💰");
    setCoins((c) => c - item.cost);
    item.apply();
    toast(`Purchased ${item.name} ✅`);
  };

  /* ---------- Leaderboard data ---------- */
  const [leaderboard, setLeaderboard] = useState<LBRow[]>(() => ensureWeekBoard(username, score));
  // keep your row updated when score changes
  useEffect(() => { setLeaderboard(ensureWeekBoard(username, score)) }, [score, username]);

  /* ---------- Lucky Spin cooldown ---------- */
  const [nextSpinAt, setNextSpinAt] = useState<number>(() => lsGetNumber("nextSpinAt", 0));
  const [spinCountdown, setSpinCountdown] = useState<string>("");
  useInterval(() => {
    const left = Math.max(0, nextSpinAt - Date.now());
    setSpinCountdown(left > 0 ? formatDuration(left) : "");
  }, 1000);

  const applyReward = (r: Reward) => {
    switch (r.kind) {
      case "coins": setCoins((c) => c + r.amount); toast(`+${r.amount} coins 💰`); break;
      case "energy": setEnergy((e) => Math.min(maxEnergy, e + r.amount)); toast(`+${r.amount} energy ⚡`); break;
      case "tap": setTapPower((p) => p + r.amount); toast(`Tap Power +${r.amount} 💥`); break;
      case "auto": setAutoRate((a) => a + r.amount); toast(`Auto/sec +${r.amount} 🤖`); break;
      case "booster":
        toast("Booster x2 (5m) activated!");
        const oldTap = tapPower, oldAuto = autoRate;
        setTapPower((p) => p * 2); setAutoRate((a) => a * 2);
        setTimeout(() => { setTapPower(oldTap); setAutoRate(oldAuto); toast("Booster ended"); }, r.minutes * 60 * 1000);
        break;
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen w-full text-slate-100 relative overflow-hidden">
      {/* Emerald animated background */}
      <div className="absolute inset-0 -z-10 bg-[#0b1220]">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[90px] animate-bgMove"></div>
        <div className="absolute top-1/2 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[90px] animate-bgMove2"></div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-24 pt-5 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">MoneyMaker 💸</h1>
            <p className="text-xs text-slate-400">Welcome, {username}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right shadow-inner backdrop-blur-sm">
            <div className="text-[10px] uppercase text-slate-400">TOTAL</div>
            <div className="text-lg font-extrabold tabular-nums">{format(score)} pts</div>
            <div className="text-[11px] text-slate-400">Streak {streak}d</div>
          </div>
        </div>

        {/* Energy + Combo */}
        <Bar className="mt-4 w-full" label="Energy" percent={(energy / maxEnergy) * 100} right={`${Math.floor(energy)}/${maxEnergy}`} color="emerald" />
        <Bar className="mt-2 w-full" label={feverActive ? "Fever" : "Combo"} percent={feverActive ? 100 : combo} right={feverActive ? "x2 BOOST" : `x${multiplier.toFixed(2)}`} color={feverActive ? "amber" : "sky"} />

        {/* Mascot + Tap card */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          {/* soft mascot glow */}
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/15 blur-2xl"></div>

          <img
            ref={mascotRef}
            src="/mr-t.png"
            alt="Mr.T"
            draggable={false}
            className="pointer-events-none mx-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] mrT-idle"
            style={{ maxHeight: "42vh", height: "42vh", width: "auto", objectFit: "contain" }}
          />

          {/* floating +cash */}
          {particles.map((p) => (
            <span key={p.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300 drop-shadow" style={{ left: `${p.x}%`, top: `${p.y}%`, animation: "floatUp 850ms ease-out forwards" }}>
              +{p.value}
            </span>
          ))}

          {/* TAP Button + ripples */}
          <div className="relative flex justify-center mt-4">
            {ripples.map((r) => (
              <span key={r.id} className="absolute h-44 w-44 rounded-full bg-emerald-400/20 blur-[2px]" style={{ animation: "ripple 450ms ease-out forwards" }} />
            ))}
            <button onClick={(e) => onTap(e)} className="relative z-[1] grid h-44 w-44 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 text-3xl font-extrabold shadow-[0_18px_40px_rgba(16,185,129,0.35)] active:scale-[0.98] transition">
              TAP
              <span className="block text-xs font-semibold opacity-80">
                +{tapPower} / tap {multiplier > 1 ? `• x${multiplier.toFixed(2)}` : ""}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <TabButton active={showQuests} onClick={() => { setShowQuests(true); setShowShop(false); }}>Quests</TabButton>
          <TabButton active={showShop} onClick={() => { setShowShop(true); setShowQuests(false); }}>Shop</TabButton>
        </div>

        {/* Panels */}
        <div className="mt-3 w-full">
          {showQuests && (
            <Card className="divide-y divide-white/10">
              <Quest title="Daily Login" reward={20} onClaim={() => setCoins((c) => c + 20)} />
              <Quest title="Follow Channel" reward={50} onClaim={() => setCoins((c) => c + 50)} />
              <Quest title="Invite a Friend" reward={150} onClaim={() => setCoins((c) => c + 150)} />
              {/* Lucky Spin */}
              <LuckySpin nextSpinAt={nextSpinAt} setNextSpinAt={setNextSpinAt} onReward={applyReward} countdown={spinCountdown} />
            </Card>
          )}

          {showShop && (
            <Card>
              <div className="space-y-3">
                {shop.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <div className="font-semibold">{i.name}</div>
                      <div className="text-xs text-slate-300">Cost: {i.cost}</div>
                    </div>
                    <button onClick={() => buy(i)} className="rounded-xl bg-sky-500 px-3 py-1 text-sm font-semibold text-slate-950">
                      Buy
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Weekly Leaderboard */}
        <Card className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold">Weekly Leaderboard 🏆</h3>
            <span className="text-xs text-slate-400">Resets Monday 00:00</span>
          </div>
          <ol className="divide-y divide-white/10">
            {leaderboard.slice(0, 10).map((row, i) => (
              <li key={row.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className={"w-6 text-center font-semibold " + (i < 3 ? "text-amber-300" : "text-slate-400")}>{i + 1}</span>
                  <span className={"font-medium " + (row.you ? "text-emerald-300" : "")}>{row.name}</span>
                </div>
                <span className="tabular-nums">{format(row.score)}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">
          Demo build. Replace localStorage with backend ⚠️
        </div>
      </div>

      {/* Animations */}
      <style>{`
        /* Animated emerald background */
        @keyframes bgMove { 0%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(30px) translateX(10px) scale(1.05)} 100%{transform:translateY(0) translateX(0) scale(1)} }
        @keyframes bgMove2 { 0%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-30px) translateX(-10px) scale(1.05)} 100%{transform:translateY(0) translateX(0) scale(1)} }
        .animate-bgMove { animation: bgMove 9s ease-in-out infinite; }
        .animate-bgMove2 { animation: bgMove2 12s ease-in-out infinite; }

        /* Mascot idle + pop */
        @keyframes breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .mrT-idle { animation: breathe 2.4s ease-in-out infinite; }
        @keyframes pop { 0%{transform:scale(1)} 35%{transform:scale(1.06)} 100%{transform:scale(1)} }
        .mrT-pop { animation: pop 220ms ease-out; }

        /* Particles & ripple */
        @keyframes floatUp { 0%{transform: translate(-50%,-50%) scale(0.9); opacity:0} 10%{opacity:1} 100%{transform: translate(-50%,-140%) scale(1.1); opacity:0} }
        @keyframes ripple { 0% { transform: scale(0.7); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
    </div>
  );
}

/* ============================================================
   Lucky Spin
============================================================ */
type Reward =
  | { kind: "coins"; amount: number }
  | { kind: "energy"; amount: number }
  | { kind: "tap"; amount: number }
  | { kind: "auto"; amount: number }
  | { kind: "booster"; minutes: number };

function LuckySpin({
  nextSpinAt,
  setNextSpinAt,
  onReward,
  countdown,
}: {
  nextSpinAt: number;
  setNextSpinAt: (v: number) => void;
  onReward: (r: Reward) => void;
  countdown: string;
}) {
  const segments: Reward[] = [
    { kind: "coins", amount: 100 },
    { kind: "tap", amount: 1 },
    { kind: "coins", amount: 250 },
    { kind: "energy", amount: 20 },
    { kind: "booster", minutes: 5 },
    { kind: "coins", amount: 500 },
    { kind: "auto", amount: 1 },
    { kind: "coins", amount: 150 },
  ];
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const canSpin = Date.now() >= nextSpinAt;
  const spin = () => {
    if (!canSpin || spinning) return;
    const seg = segments.length;
    // choose target index with slight bias to coins (simplify by selecting random angle)
    const rndIndex = Math.floor(Math.random() * seg);
    const slice = 360 / seg;
    const offsetToIndexCenter = slice * rndIndex + slice / 2;
    const spins = 5; // full rotations
    const final = spins * 360 + (360 - offsetToIndexCenter); // pointer at 0deg (top)
    setSpinning(true);
    setAngle(final);
    setTimeout(() => {
      const reward = segments[rndIndex];
      onReward(reward);
      setSpinning(false);
      const next = Date.now() + 24 * 60 * 60 * 1000; // 24h
      setNextSpinAt(next);
      lsSet("nextSpinAt", next);
    }, 2600);
  };

  return (
    <div className="py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Lucky Spin 🎰</div>
        {!canSpin ? (
          <span className="text-xs text-slate-400">Next in {countdown}</span>
        ) : (
          <span className="text-xs text-emerald-300">Free spin ready!</span>
        )}
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="relative">
          {/* pointer */}
          <div className="absolute left-1/2 top-[-10px] h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-emerald-300 drop-shadow" />
          {/* wheel */}
          <div
            className="h-40 w-40 rounded-full border border-white/10 shadow-inner"
            style={{
              background:
                "conic-gradient(#10b981 0 45deg,#0ea5e9 45deg 90deg,#10b981 90deg 135deg,#f59e0b 135deg 180deg,#10b981 180deg 225deg,#0ea5e9 225deg 270deg,#10b981 270deg 315deg,#f59e0b 315deg 360deg)",
              transform: `rotate(${angle}deg)`,
              transition: spinning ? "transform 2.6s cubic-bezier(0.12, 0.68, 0, 1.02)" : "none",
            }}
          />
        </div>
      </div>

      <button
        onClick={spin}
        disabled={!canSpin || spinning}
        className={`mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold ${canSpin && !spinning ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-slate-400 cursor-not-allowed"}`}
      >
        {canSpin ? (spinning ? "Spinning..." : "Spin (Free)") : `Come back in ${countdown}`}
      </button>
    </div>
  );
}

/* ============================================================
   Leaderboard helpers
============================================================ */
function ensureWeekBoard(name: string, myScore: number): LBRow[] {
  const key = `lb_week_${weekKey()}`;
  let rows: LBRow[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) rows = JSON.parse(raw);
  } catch {}
  if (!rows || rows.length === 0) rows = seedBoard(); // new week -> seed

  // ensure your row exists and update score
  const youId = "you";
  const idx = rows.findIndex((r) => r.id === youId);
  if (idx === -1) rows.push({ id: youId, name, score: myScore, you: true });
  else rows[idx] = { ...rows[idx], name, score: myScore, you: true };

  rows.sort((a, b) => b.score - a.score);
  try { localStorage.setItem(key, JSON.stringify(rows)); } catch {}
  return rows;
}

function seedBoard(): LBRow[] {
  const names = ["CryptoPrince", "TapMaster", "LuckyLuna", "TONWhale", "GreenStack", "CoinWolf", "Minty", "Blade", "Jet", "Kira"];
  const rows: LBRow[] = names.map((n, i) => ({ id: `npc_${i}`, name: n, score: 500 + Math.floor(Math.random() * 5000) }));
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

function weekKey() {
  const d = new Date();
  const first = new Date(d.getFullYear(), 0, 1);
  const diff = (d.getTime() - first.getTime()) / 86400000 + first.getDay();
  const week = Math.ceil(diff / 7);
  return `${d.getFullYear()}_${week}`;
}

/* ============================================================
   Small UI components
============================================================ */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>{children}</section>;
}

function TabButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] " +
        (active
          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shadow-inner"
          : "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/7")
      }
    >
      {children}
    </button>
  );
}

function Bar({
  label, percent, right, color = "emerald", className = "",
}: { label: string; percent: number; right?: React.ReactNode; color?: "emerald"|"sky"|"amber"; className?: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-400",
    sky: "bg-sky-400",
    amber: "bg-amber-400",
  };
  const trailMap: Record<string, string> = {
    emerald: "bg-emerald-400/15",
    sky: "bg-sky-400/15",
    amber: "bg-amber-400/15",
  };
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
  );
}

function Quest({ title, reward, onClaim }: { title: string; reward: number; onClaim: () => void }) {
  const [claimed, setClaimed] = useState(() => getQuestClaimed(title));
  const claim = () => {
    if (claimed) return;
    setClaimed(true);
    setQuestClaimed(title);
    onClaim();
    toast(`Claimed +${reward} ✅`);
  };
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-400">Reward: {reward}</div>
      </div>
      <button
        onClick={claim}
        disabled={claimed}
        className={`rounded-lg px-3 py-1 text-xs font-semibold ${claimed ? "bg-white/10 text-slate-400" : "bg-emerald-500/20 text-emerald-200"}`}
      >
        {claimed ? "Claimed" : "Claim"}
      </button>
    </div>
  );
}

/* ============================================================
   Utils
============================================================ */
function useInterval(cb: () => void, ms: number) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb }, [cb]);
  useEffect(() => { const id = setInterval(() => saved.current(), ms); return () => clearInterval(id) }, [ms]);
}

const toast = (m: string) =>
  window.Telegram?.WebApp?.showPopup
    ? window.Telegram.WebApp.showPopup({ message: m, buttons: [{ type: "ok", text: "OK" }] })
    : console.log(m);

function lsGetNumber(key: string, fallback: number) {
  try { const n = Number(localStorage.getItem(key)); return isNaN(n) ? fallback : n } catch { return fallback }
}
function lsSet(key: string, v: any) { try { localStorage.setItem(key, String(v)) } catch {} }
function getQuestClaimed(title: string) { try { return localStorage.getItem(`q_${slug(title)}`) === "1" } catch { return false } }
function setQuestClaimed(title: string) { try { localStorage.setItem(`q_${slug(title)}`, "1") } catch {} }
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const format = (n: number) => n.toLocaleString();
function formatDuration(ms: number) {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${ss}s`;
}
