import React, { useEffect, useMemo, useRef, useState } from "react";
import BanknoteButton from "./components/BanknoteButton";

/* ========= Version tag ========= */
const MM_VERSION = "ALLPACK v1.0";

/* ---------------- Types ---------------- */
type ShopItem = { id: string; name: string; kind: "upgrade" | "consumable"; cost: number; apply: () => void };
type Particle = { id: number; x: number; y: number; value: number };
type LBRow = { id: string; name: string; score: number; you?: boolean };

type Reward =
  | { kind: "coins"; amount: number }
  | { kind: "energy"; amount: number }
  | { kind: "tap"; amount: number }
  | { kind: "auto"; amount: number }
  | { kind: "booster"; minutes: number };

type Achievement = { id: string; title: string; desc: string; goal: number; key: "score" | "taps" | "streak" | "upgrades"; reward: number };

/* -------------- Telegram global -------------- */
declare global {
  interface Window {
    Telegram?: any;
  }
}

/* ============================================================
   App
============================================================ */
export default function App() {
  const tg = (typeof window !== "undefined" && window.Telegram?.WebApp) || null;

  /* -------- core state -------- */
  const [username, setUsername] = useState(() => lsGet("username", "Player"));
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
  const [prestigeCount, setPrestigeCount] = useState(() => lsn("prestigeCount", 0));
  const globalMultiplier = useMemo(() => 1 + shards * 0.1, [shards]); // +10% each shard

  // skins & pets
  type SkinId = "default" | "emeraldSuit" | "goldSuit";
  type PetId = "none" | "miniCoin" | "owl";
  const [skin, setSkin] = useState<SkinId>(() => lsGet("skin", "default") as SkinId);
  const [pet, setPet] = useState<PetId>(() => lsGet("pet", "none") as PetId);
  const skinBonus = skin === "emeraldSuit" ? 1.05 : skin === "goldSuit" ? 1.08 : 1; // affects tap
  const petAuto = pet === "miniCoin" ? 1 : pet === "owl" ? 2 : 0; // +auto/sec

  // sounds
  const [sfxOn, setSfxOn] = useState(() => lsGet("sfxOn", "1") === "1");
  const audioRef = useRef<AudioContext | null>(null);
  const vibe = (type: "tap" | "fever") => {
    if (!sfxOn) return;
    audioRef.current ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioRef.current,
      o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = "triangle";
    if (type === "tap") {
      o.frequency.value = 600;
      g.gain.value = 0.05;
    } else {
      o.frequency.value = 220;
      g.gain.value = 0.08;
    }
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (type === "tap" ? 0.08 : 0.4));
    o.stop(ctx.currentTime + (type === "tap" ? 0.09 : 0.42));
  };

  /* -------- fx/ui -------- */
  const mascotRef = useRef<HTMLImageElement>(null);
  const tapCardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const pid = useRef(1);

  // combo/fever
  const lastTapAt = useRef(0);
  const [combo, setCombo] = useState(0); // 0..100
  const [mult, setMult] = useState(1); // 1..3
  const [feverUntil, setFeverUntil] = useState(0);
  const feverActive = Date.now() < feverUntil;

  // spin & chest
  const [nextSpinAt, setNextSpinAt] = useState<number>(() => lsn("nextSpinAt", 0));
  const [spinCountdown, setSpinCountdown] = useState("");
  const [nextChestAt, setNextChestAt] = useState<number>(() => lsn("nextChestAt", 0));
  const [chestCountdown, setChestCountdown] = useState("");

  // achievements
  const ACH: Achievement[] = useMemo(
    () => [
      { id: "sc1", title: "1k Earner", desc: "Reach 1,000 total", goal: 1000, key: "score", reward: 100 },
      { id: "sc2", title: "10k Earner", desc: "Reach 10,000", goal: 10000, key: "score", reward: 400 },
      { id: "sc3", title: "100k Earner", desc: "Reach 100,000", goal: 100000, key: "score", reward: 2000 },
      { id: "tap1", title: "Tap Novice", desc: "500 taps", goal: 500, key: "taps", reward: 150 },
      { id: "tap2", title: "Tap Pro", desc: "2,000 taps", goal: 2000, key: "taps", reward: 500 },
      { id: "tap3", title: "Tap GOD", desc: "10,000 taps", goal: 10000, key: "taps", reward: 3000 },
      { id: "up1", title: "First Upgrade", desc: "Buy 1 upgrade", goal: 1, key: "upgrades", reward: 50 },
      { id: "up2", title: "Investor", desc: "Buy 10 upgrades", goal: 10, key: "upgrades", reward: 400 },
      { id: "up3", title: "Tycoon", desc: "Buy 30 upgrades", goal: 30, key: "upgrades", reward: 1500 },
      { id: "st1", title: "Streaker", desc: "3-day streak", goal: 3, key: "streak", reward: 200 },
      { id: "st2", title: "Hot Streak", desc: "7-day streak", goal: 7, key: "streak", reward: 600 },
      { id: "st3", title: "Unstoppable", desc: "14-day streak", goal: 14, key: "streak", reward: 1500 },
      { id: "sc4", title: "Millionaire", desc: "Reach 1,000,000", goal: 1_000_000, key: "score", reward: 10000 },
      { id: "tap4", title: "Storm Fingers", desc: "50,000 taps", goal: 50_000, key: "taps", reward: 8000 },
      { id: "up4", title: "Architect", desc: "60 upgrades", goal: 60, key: "upgrades", reward: 4000 },
    ],
    []
  );

  /* -------- init -------- */
  useEffect(() => {
    try {
      if (tg) {
        tg.expand?.();
        tg.ready?.();
        tg.setHeaderColor?.("#0b1220");
        tg.setBackgroundColor?.("#0b1220");
        const uname = tg.initDataUnsafe?.user?.first_name || tg.initDataUnsafe?.user?.username || username || "Player";
        setUsername(uname);
        lsSet("username", uname);
      }
      const now = Date.now(),
        last = lastLogin || 0,
        days = Math.floor((now - last) / 86400000);
      if (last === 0 || days === 0) {
        // first day or same day
      } else if (days === 1) {
        setStreak((s) => s + 1);
        setCoins((c) => c + 20 * Math.min(7, (streak || 0) + 1));
        toast("Daily streak +1 ⭐");
      } else {
        setStreak(1);
        toast("Streak reset");
      }
      setLastLogin(now);
    } catch {}
  }, []);

  /* -------- persist -------- */
  useEffect(() => {
    lsSet("score", score);
    lsSet("taps", taps);
    lsSet("energy", energy);
    lsSet("maxEnergy", maxEnergy);
    lsSet("tapPower", tapPower);
    lsSet("autoRate", autoRate);
    lsSet("regenRate", regenRate);
    lsSet("coins", coins);
    lsSet("streak", streak);
    lsSet("lastLogin", lastLogin);
    lsSet("upgradesBought", upgradesBought);
    lsSet("shards", shards);
    lsSet("prestigeCount", prestigeCount);
    lsSet("skin", skin);
    lsSet("pet", pet);
    lsSet("sfxOn", sfxOn ? "1" : "0");
  }, [score, taps, energy, maxEnergy, tapPower, autoRate, regenRate, coins, streak, lastLogin, upgradesBought, shards, prestigeCount, skin, pet, sfxOn]);

  /* -------- loops -------- */
  useInterval(() => {
    const p = regenRate / 60;
    setEnergy((e) => Math.min(maxEnergy, e + p));
  }, 1000);
  useInterval(() => {
    const extra = petAuto;
    if (autoRate + extra > 0) setScore((s) => s + Math.round((autoRate + extra) * globalMultiplier));
  }, 1000);
  useInterval(() => {
    const left = Math.max(0, nextSpinAt - Date.now());
    setSpinCountdown(left > 0 ? dur(left) : "");
    const left2 = Math.max(0, nextChestAt - Date.now());
    setChestCountdown(left2 > 0 ? dur(left2) : "");
  }, 1000);

  /* -------- tap -------- */
  const spawnParticle = (cx?: number, cy?: number) => {
    const rect = tapCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = pid.current++;
    const x = cx ? ((cx - rect.left) / rect.width) * 100 : 50;
    const y = cy ? ((cy - rect.top) / rect.height) * 100 : 58;
    const shown = Math.max(1, Math.floor(tapPower * skinBonus * globalMultiplier * (feverActive ? 2 : 1) * mult));
    setParticles((ps) => [...ps, { id, x, y, value: shown }]);
    setTimeout(() => setParticles((ps) => ps.filter((p) => p.id !== id)), 850);
  };

  const onTap = (e?: React.MouseEvent) => {
    if (energy < 1) return toast("No energy. Wait ⏳");
    const now = Date.now();
    const within = now - (lastTapAt.current || 0) <= 1000;
    const nextCombo = Math.min(100, within ? combo + 7 : 7);
    const nextMult = Math.min(3, 1 + nextCombo / 50);
    setCombo(feverActive ? 0 : nextCombo);
    setMult(Number(nextMult.toFixed(2)));
    if (nextCombo === 100 && !feverActive) {
      setFeverUntil(now + 5000);
      vibe("fever");
    }
    const gain = Math.floor(tapPower * skinBonus * globalMultiplier * (feverActive ? 2 : 1) * nextMult);
    setScore((s) => s + gain);
    setTaps((t) => t + 1);
    setEnergy((e_) => Math.max(0, e_ - 1));
    mascotRef.current?.classList.remove("mrT-pop");
    void mascotRef.current?.offsetWidth;
    mascotRef.current?.classList.add("mrT-pop");
    spawnParticle(e?.clientX, e?.clientY);
    vibe("tap");
    lastTapAt.current = now;
    tg?.HapticFeedback?.impactOccurred?.("medium");
  };

  /* -------- shop -------- */
  const shop = useMemo<ShopItem[]>(
    () => [
      { id: "tap1", name: "+1 Tap Power", kind: "upgrade", cost: 100, apply: () => { setTapPower((x) => x + 1); setUpgradesBought((u) => u + 1); } },
      { id: "energy10", name: "+10 Max Energy", kind: "upgrade", cost: 150, apply: () => { setMaxEnergy((x) => x + 10); setUpgradesBought((u) => u + 1); } },
      { id: "auto1", name: "+1 Auto/sec", kind: "upgrade", cost: 300, apply: () => { setAutoRate((x) => x + 1); setUpgradesBought((u) => u + 1); } },
      { id: "regen5", name: "+5 Energy/min", kind: "upgrade", cost: 250, apply: () => { setRegenRate((x) => x + 5); setUpgradesBought((u) => u + 1); } },
    ],
    []
  );
  const buy = (item: ShopItem) => {
    if (coins < item.cost) return toast("Not enough coins 💰");
    setCoins((c) => c - item.cost);
    item.apply();
    toast(`Purchased ${item.name} ✅`);
  };

  /* -------- leaderboard -------- */
  const [leaderboard, setLeaderboard] = useState<LBRow[]>(() => ensureWeekBoard(username, score));
  useEffect(() => {
    setLeaderboard(ensureWeekBoard(username, score));
  }, [score, username]);

  /* -------- spin & chest handlers -------- */
  const onReward = (r: Reward) => {
    switch (r.kind) {
      case "coins":
        setCoins((c) => c + r.amount);
        toast(`+${r.amount} coins 💰`);
        break;
      case "energy":
        setEnergy((e) => Math.min(maxEnergy, e + r.amount));
        toast(`+${r.amount} energy ⚡`);
        break;
      case "tap":
        setTapPower((p) => p + r.amount);
        toast(`Tap Power +${r.amount} 💥`);
        break;
      case "auto":
        setAutoRate((a) => a + r.amount);
        toast(`Auto/sec +${r.amount} 🤖`);
        break;
      case "booster":
        toast("Booster x2 (5m) activated!");
        const oldTap = tapPower,
          oldAuto = autoRate;
        setTapPower((p) => p * 2);
        setAutoRate((a) => a * 2);
        setTimeout(() => {
          setTapPower(oldTap);
          setAutoRate(oldAuto);
          toast("Booster ended");
        }, r.minutes * 60 * 1000);
        break;
    }
  };
  const openChest = () => {
    if (Date.now() < nextChestAt) return;
    const pool: Reward[] = [
      { kind: "coins", amount: 200 + rand(0, 300) },
      { kind: "energy", amount: 30 },
      { kind: "tap", amount: 1 },
      { kind: "auto", amount: 1 },
      { kind: "booster", minutes: 5 },
    ];
    const r = pool[Math.floor(Math.random() * pool.length)];
    onReward(r);
    const next = Date.now() + 24 * 60 * 60 * 1000;
    setNextChestAt(next);
    lsSet("nextChestAt", next);
  };

  /* -------- prestige -------- */
  const shardGain = useMemo(() => Math.floor(score / 10000), [score]); // 1 per 10k total
  const doPrestige = () => {
    if (shardGain <= 0) return toast("Earn at least 10k to prestige.");
    setShards((s) => s + shardGain);
    setPrestigeCount((p) => p + 1);
    setScore(0);
    setTaps(0);
    setEnergy(50);
    setMaxEnergy(50);
    setTapPower(1);
    setAutoRate(0);
    setRegenRate(5);
    setCoins(0);
    setUpgradesBought(0);
    toast(`Prestiged! +${shardGain} shards ✨ Permanent x${(1 + (shards + shardGain) * 0.1).toFixed(2)} boost`);
  };

  /* ---------------- UI ---------------- */
  const liveGain = Math.max(1, Math.floor(tapPower * skinBonus * globalMultiplier * (feverActive ? 2 : 1) * mult));

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
        <Bar className="mt-4 w-full" label="Energy" percent={(energy / maxEnergy) * 100} right={`${Math.floor(energy)}/${maxEnergy}`} color="emerald" />
        <Bar className="mt-2 w-full" label={feverActive ? "Fever" : "Combo"} percent={feverActive ? 100 : combo} right={feverActive ? "x2 BOOST" : `x${mult.toFixed(2)} • x${globalMultiplier.toFixed(2)} global`} color={feverActive ? "amber" : "sky"} />

        {/* play card */}
        <div ref={tapCardRef} className="relative mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-400/15 blur-2xl"></div>

          <img
            ref={mascotRef}
            src="/mr-t.png"
            alt="Mr.T"
            draggable={false}
            className="pointer-events-none mx-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] mrT-idle"
            style={{ maxHeight: "42vh", height: "42vh", width: "auto", objectFit: "contain" }}
          />

          {particles.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-300 drop-shadow"
              style={{ left: `${p.x}%`, top: `${p.y}%`, animation: "floatUp 850ms ease-out forwards" }}
            >
              +{p.value}
            </span>
          ))}

          <div className="relative flex justify-center mt-4">
            <BanknoteButton onTap={() => onTap()} size={240} floatText={`+${liveGain} 💵`} />
          </div>
        </div>

        {/* main tabs */}
        <div className="mt-5 flex gap-2">
          <TabButton
            active={showQuests}
            onClick={() => {
              setShowQuests(true);
              setShowShop(false);
              setShowMore(false);
            }}
          >
            Quests
          </TabButton>
          <TabButton
            active={showShop}
            onClick={() => {
              setShowShop(true);
              setShowQuests(false);
              setShowMore(false);
            }}
          >
            Shop
          </TabButton>
          <TabButton
            active={showMore}
            onClick={() => {
              setShowMore(true);
              setShowShop(false);
              setShowQuests(false);
            }}
          >
            More
          </TabButton>
        </div>

        {/* panels */}
        <div className="mt-3 w-full">
          {showQuests && (
            <Card className="divide-y divide-white/10">
              <Quest title="Daily Login" reward={20} onClaim={() => setCoins((c) => c + 20)} />
              <Quest title="Follow Channel" reward={50} onClaim={() => setCoins((c) => c + 50)} />
              <Quest title="Invite a Friend" reward={150} onClaim={() => setCoins((c) => c + 150)} />
              <LuckySpin nextSpinAt={nextSpinAt} setNextSpinAt={(v) => { setNextSpinAt(v); lsSet("nextSpinAt", v); }} onReward={onReward} countdown={spinCountdown} />
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

          {showMore && (
            <div className="space-y-3">
              {/* Achievements */}
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Achievements 🏅</h3>
                  <span className="text-xs text-slate-400">Rewards on claim</span>
                </div>
                <div className="space-y-2">
                  {ACH.map((a) => {
                    const cur = a.key === "score" ? score : a.key === "taps" ? taps : a.key === "streak" ? streak : upgradesBought;
                    const done = cur >= a.goal;
                    const claimed = lsGet(`ach_${a.id}`, "0") === "1";
                    const pct = Math.min(100, Math.round((cur / a.goal) * 100));
                    return (
                      <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{a.title}</div>
                            <div className="text-xs text-slate-400">{a.desc}</div>
                          </div>
                          <div className="text-xs text-slate-300">Reward: {a.reward} coins</div>
                        </div>
                        <Bar className="mt-2" label="" percent={pct} right={`${pct}%`} color={done ? "emerald" : "sky"} />
                        <button
                          onClick={() => {
                            if (!done || claimed) return;
                            setCoins((c) => c + a.reward);
                            lsSet(`ach_${a.id}`, "1");
                            toast(`Achievement: ${a.title} ✅ +${a.reward}`);
                          }}
                          disabled={!done || claimed}
                          className={`mt-2 w-full rounded-lg px-3 py-1 text-sm font-semibold ${
                            !done || claimed ? "bg-white/10 text-slate-400 cursor-not-allowed" : "bg-emerald-500 text-emerald-950"
                          }`}
                        >
                          {claimed ? "Claimed" : done ? "Claim" : "In progress"}
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
                  <span className="text-xs text-slate-400">{Date.now() < nextChestAt ? `Next in ${chestCountdown}` : "Ready!"}</span>
                </div>
                <button
                  onClick={openChest}
                  disabled={Date.now() < nextChestAt}
                  className={`w-full rounded-xl px-3 py-2 font-semibold ${
                    Date.now() < nextChestAt ? "bg-white/10 text-slate-400 cursor-not-allowed" : "bg-amber-400 text-amber-950"
                  }`}
                >
                  {Date.now() < nextChestAt ? "Come back later" : "Open Chest"}
                </button>
              </Card>

              {/* Prestige */}
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold">Prestige ✨</h3>
                  <span className="text-xs text-slate-400">Get shards to boost all income</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <div className="text-sm">
                      You’ll gain <b>{shardGain}</b> shard(s)
                    </div>
                    <div className="text-xs text-slate-400">
                      Current boost: x{globalMultiplier.toFixed(2)} • Times prestiged: {prestigeCount}
                    </div>
                  </div>
                  <button onClick={doPrestige} className="rounded-xl bg-fuchsia-400 px-3 py-1 text-sm font-semibold text-fuchsia-950">
                    Prestige
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <Card className="mt-4 w-full">
          <h3 className="font-bold mb-2">This Week 🏆</h3>
          <div className="space-y-1">
            {leaderboard.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${r.you ? "bg-emerald-400/10" : "bg-white/5"}`}>
                <div className="text-sm">
                  {i + 1}. {r.name}
                  {r.you ? " (you)" : ""}
                </div>
                <div className="text-sm font-semibold">{fmt(r.score)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* footer toggles */}
        <div className="mt-6 text-xs text-slate-400 flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sfxOn} onChange={(e) => setSfxOn(e.target.checked)} />
            SFX
          </label>
          <span>Skin:</span>
          <select value={skin} onChange={(e) => setSkin(e.target.value as any)} className="bg-white/10 rounded px-2 py-1">
            <option value="default">Default</option>
            <option value="emeraldSuit">Emerald Suit (+5%)</option>
            <option value="goldSuit">Gold Suit (+8%)</option>
          </select>
          <span>Pet:</span>
          <select value={pet} onChange={(e) => setPet(e.target.value as any)} className="bg-white/10 rounded px-2 py-1">
            <option value="none">None</option>
            <option value="miniCoin">Mini Coin (+1 auto)</option>
            <option value="owl">Owl (+2 auto)</option>
          </select>
        </div>
      </div>

      {/* Local styles for animations used in this file */}
      <style>{`
        @keyframes floatUp { 0%{ transform: translate(-50%,-50%) translateY(6px); opacity:.95 } 100%{ transform: translate(-50%,-50%) translateY(-30px); opacity:0 } }
        @keyframes bgMove { 0%{ transform: translateY(0)} 100%{ transform: translateY(30px)} }
        @keyframes bgMove2 { 0%{ transform: translateY(0)} 100%{ transform: translateY(-30px)} }
        .animate-bgMove { animation: bgMove 6s ease-in-out infinite alternate; }
        .animate-bgMove2 { animation: bgMove2 6s ease-in-out infinite alternate; }
        .mrT-idle { animation: mrTFloat 3.5s ease-in-out infinite; }
        .mrT-pop { animation: mrTPop .18s ease-out; }
        @keyframes mrTFloat { 0%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } 100%{ transform: translateY(0) } }
        @keyframes mrTPop { from{ transform: scale(1) } to{ transform: scale(1.03) } }
      `}</style>
    </div>
  );
}

/* ============================================================
   Tiny UI components
============================================================ */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}>{children}</div>;
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${active ? "bg-emerald-500 text-emerald-950" : "bg-white/10 text-white"}`}>
      {children}
    </button>
  );
}

function Bar({ label, right, percent, color = "emerald", className = "" }: { label: string; right: string | number; percent: number; color?: "emerald" | "sky" | "amber"; className?: string }) {
  const bar = color === "emerald" ? "bg-emerald-500" : color === "sky" ? "bg-sky-400" : "bg-amber-400";
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-2 ${className}`}>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{right}</span>
      </div>
      <div className="h-2 w-full rounded-lg bg-white/10 overflow-hidden">
        <div className={`h-2 ${bar}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}

function Quest({ title, reward, onClaim }: { title: string; reward: number; onClaim: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-400">Reward: {reward} coins</div>
      </div>
      <button
        onClick={() => {
          onClaim();
          toast(`+${reward} coins for ${title}`);
        }}
        className="rounded-xl bg-emerald-500 text-emerald-950 px-3 py-1 text-sm font-semibold"
      >
        Claim
      </button>
    </div>
  );
}

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
  const ready = Date.now() >= nextSpinAt;
  const doSpin = () => {
    if (!ready) return;
    const pool: Reward[] = [
      { kind: "coins", amount: 80 + rand(0, 120) },
      { kind: "energy", amount: 20 },
      { kind: "tap", amount: 1 },
      { kind: "auto", amount: 1 },
    ];
    const r = pool[Math.floor(Math.random() * pool.length)];
    onReward(r);
    const next = Date.now() + 3 * 60 * 60 * 1000; // every 3h
    setNextSpinAt(next);
    lsSet("nextSpinAt", next);
  };
  return (
    <div className="pt-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">Lucky Spin 🎡</div>
        <div className="text-xs text-slate-400">{ready ? "Ready!" : `Next in ${countdown}`}</div>
      </div>
      <button
        onClick={doSpin}
        disabled={!ready}
        className={`w-full rounded-xl px-3 py-2 font-semibold ${ready ? "bg-sky-400 text-sky-950" : "bg-white/10 text-slate-400 cursor-not-allowed"}`}
      >
        {ready ? "Spin Now" : "Come back later"}
      </button>
    </div>
  );
}

/* ============================================================
   Helpers
============================================================ */
function lsGet(k: string, def: string) {
  try {
    const v = localStorage.getItem(k);
    return v === null ? def : v;
  } catch {
    return def;
  }
}
function lsSet(k: string, v: any) {
  try {
    localStorage.setItem(k, String(v));
  } catch {}
}
function lsn(k: string, def: number) {
  try {
    const v = localStorage.getItem(k);
    return v === null ? def : Number(v);
  } catch {
    return def;
  }
}

function useInterval(cb: () => void, ms: number) {
  useEffect(() => {
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }, [cb, ms]);
}

function fmt(n: number) {
  return n.toLocaleString();
}
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function dur(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    ss = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}
function toast(msg: string) {
  try {
    (window as any).Telegram?.WebApp?.showAlert?.(msg);
  } catch {}
  console.log("TOAST:", msg);
}

function ensureWeekBoard(username: string, score: number): LBRow[] {
  const key = "lb_week";
  let data: LBRow[];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      data = JSON.parse(raw) as LBRow[];
    } else {
      data = [
        { id: "a", name: "Alice", score: 12000 },
        { id: "b", name: "Bob", score: 9200 },
        { id: "c", name: "Carol", score: 6100 },
      ];
    }
  } catch {
    data = [];
  }
  const youIdx = data.findIndex((r) => r.you);
  if (youIdx >= 0) {
    data[youIdx].name = username;
    data[youIdx].score = score;
  } else {
    data.push({ id: "you", name: username, score, you: true });
  }
  data.sort((x, y) => y.score - x.score);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
  return data;
}
