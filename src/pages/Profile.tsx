// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";
import { loadSave } from "../lib/storage";
import { formatMoneyShort } from "../lib/format";
import { achievements, type Achievement } from "../data/achievements";

type Stats = {
  taps: number;
  balance: number;
  totalEarnings: number;
  bestSuitName: string;
};

type AchState = Record<string, { done: boolean; claimed: boolean }>;

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [uid, setUid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [tgDebug, setTgDebug] = useState("no mm_tg_debug key");

  const [stats, setStats] = useState<Stats>({
    taps: 0,
    balance: 0,
    totalEarnings: 0,
    bestSuitName: "Starter",
  });

  const [achState, setAchState] = useState<AchState>({});

  // Load profile + stats + achievements from save
  useEffect(() => {
    const p = getProfile();

    let nextName = p.name || "Player";
    let nextCountry = p.country || "US";
    let nextUid = p.uid || "";
    let nextAvatar = p.avatarUrl as string | undefined;

    // Load stats + achievements from save
    try {
      const save = (loadSave() as any) ?? {};
      setStats({
        taps: save.taps ?? save.tap ?? 0,
        balance: save.balance ?? save.score ?? 0,
        totalEarnings: save.totalEarnings ?? save.score ?? 0,
        bestSuitName: save.bestSuitName ?? "Starter",
      });
      setAchState(save.achievements ?? {});
    } catch {
      // ignore
    }

    // Try to override with Telegram debug info (finalUid, finalName, etc.)
    try {
      const raw = localStorage.getItem("mm_tg_debug");
      if (raw) {
        setTgDebug(raw);

        try {
          const dbg = JSON.parse(raw);

          if (dbg.finalUid) nextUid = String(dbg.finalUid);
          if (dbg.finalName) nextName = String(dbg.finalName);
          if (dbg.finalCountry) nextCountry = String(dbg.finalCountry);

          // if we don't already have avatar in profile, try extract from userJson
          if (!nextAvatar && dbg.userJson) {
            try {
              const u = JSON.parse(dbg.userJson);
              if (u.photo_url) nextAvatar = u.photo_url;
            } catch {
              // ignore JSON error
            }
          }
        } catch {
          // ignore parse error
        }
      }
    } catch {
      // ignore storage error
    }

    setName(nextName);
    setCountry(nextCountry);
    setUid(nextUid);
    setAvatarUrl(nextAvatar);
  }, []);

  function handleSave() {
    // Only allow editing name + country manually
    setProfile({ name, country });

    // Re-read profile after save (in case something else changed)
    const p = getProfile();
    setUid(p.uid);
    setAvatarUrl(p.avatarUrl);

    try {
      const raw = localStorage.getItem("mm_tg_debug");
      if (raw) setTgDebug(raw);
    } catch {
      // ignore
    }
  }

  const initials =
    (name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() as string) || "P";

  return (
    <div className="p-4 text-white pb-28">
      {/* Avatar + basic info */}
      <div className="flex items-center gap-4 mb-6">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
        )}

        <div className="text-sm text-white/70">
          <div className="font-semibold text-base">{name}</div>
          <div className="text-xs text-white/50">ID: {uid}</div>
          <div className="text-xs text-white/40 mt-1">
            Best suit: {stats.bestSuitName}
          </div>
        </div>
      </div>

      {/* Editable profile fields */}
      <label className="block text-sm mb-1 text-white/70">Display name</label>
      <input
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="block text-sm mb-1 text-white/70">Country</label>
      <select
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="US">US</option>
        <option value="RU">Russia</option>
        <option value="DE">Germany</option>
        <option value="TR">Turkey</option>
        <option value="BR">Brazil</option>
        <option value="IN">India</option>
      </select>

      <label className="block text-sm mb-1 text-white/70">Player ID</label>
      <input
        className="w-full mb-4 rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-sm text-white/60"
        value={uid}
        readOnly
      />

      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold py-3 mt-1 mb-6"
      >
        Save Profile
      </button>

      {/* --- Stats section --- */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-white/80 mb-2">
          Player stats
        </h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2">
            <div className="text-white/50">Total taps</div>
            <div className="text-emerald-400 font-semibold text-sm">
              {stats.taps.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2">
            <div className="text-white/50">Best balance</div>
            <div className="text-emerald-400 font-semibold text-sm">
              ${formatMoneyShort(stats.balance)}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-2 col-span-2">
            <div className="text-white/50">Total earnings</div>
            <div className="text-emerald-400 font-semibold text-sm">
              ${formatMoneyShort(stats.totalEarnings)}
            </div>
          </div>
        </div>
      </section>

      {/* --- Achievements summary (read-only) --- */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-white/80 mb-2">
          Achievements
        </h2>

        <div className="max-h-52 overflow-y-auto rounded-2xl bg-zinc-950/60 border border-white/10 px-3 py-2 space-y-2">
          {achievements.map((a: Achievement) => {
            const st = achState[a.id];
            const done = st?.done ?? false;
            const claimed = st?.claimed ?? false;

            return (
              <div
                key={a.id}
                className="flex items-start gap-2 rounded-xl px-2 py-2 bg-zinc-900/60"
              >
                <div className="mt-0.5">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      done
                        ? claimed
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                        : "bg-zinc-700"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white/90">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-white/55">{a.desc}</div>
                  <div className="text-[11px] text-emerald-400/80 mt-0.5">
                    Reward: ${a.reward.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-1 text-[10px] text-white/35">
          Green = claimed, yellow = completed (claim in Inventory), grey =
          locked.
        </p>
      </section>

      {/* Telegram debug info (unchanged) */}
      <div className="mt-4 text-xs text-white/40 break-all">
        <div className="font-semibold mb-1">Telegram debug:</div>
        <pre className="whitespace-pre-wrap break-all text-[10px]">
          {tgDebug}
        </pre>
      </div>
    </div>
  );
}
