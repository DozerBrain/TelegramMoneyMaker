// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";
import { achievements } from "../data/achievements";
import { formatMoneyShort } from "../lib/format";

type AchState = Record<string, { done: boolean; claimed: boolean }>;

type Props = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;
  achievementsState: AchState;
  onClaim: (id: string, reward: number) => void;
};

export default function ProfilePage({
  balance,
  totalEarnings,
  taps,
  tapValue,
  autoPerSec,
  multi,
  achievementsState,
  onClaim,
}: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [uid, setUid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [tgDebug, setTgDebug] = useState("no mm_tg_debug key");

  useEffect(() => {
    const p = getProfile();

    let nextName = p.name || "Player";
    let nextCountry = p.country || "US";
    let nextUid = p.uid || "";
    let nextAvatar = p.avatarUrl as string | undefined;

    // Try to override with Telegram debug info
    try {
      const raw = localStorage.getItem("mm_tg_debug");
      if (raw) {
        setTgDebug(raw);

        try {
          const dbg = JSON.parse(raw);

          if (dbg.finalUid) nextUid = String(dbg.finalUid);
          if (dbg.finalName) nextName = String(dbg.finalName);
          if (dbg.finalCountry) nextCountry = String(dbg.finalCountry);

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
    setProfile({ name, country });

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
    <div className="p-4 pb-24 text-white">
      {/* ===== TOP: PROFILE INFO ===== */}
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
          <div className="text-xs text-white/50">Country: {country}</div>
        </div>
      </div>

      {/* Editable fields */}
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

      {/* ===== MIDDLE: CORE STATS ===== */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white/80 mb-2">Stats</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-3">
            <div className="text-white/50 mb-1">Balance</div>
            <div className="text-emerald-400 font-semibold">
              ${formatMoneyShort(balance)}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 border border.white/10 p-3">
            <div className="text-white/50 mb-1">Total earned</div>
            <div className="text-emerald-300 font-semibold">
              ${formatMoneyShort(totalEarnings)}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-3">
            <div className="text-white/50 mb-1">Total taps</div>
            <div className="text-emerald-200 font-semibold">{taps}</div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-3">
            <div className="text-white/50 mb-1">Tap power</div>
            <div className="text-emerald-200 font-semibold">
              +{tapValue} / tap
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-3">
            <div className="text-white/50 mb-1">Auto income</div>
            <div className="text-emerald-200 font-semibold">{autoPerSec}/s</div>
          </div>

          <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-3">
            <div className="text-white/50 mb-1">Multiplier</div>
            <div className="text-emerald-200 font-semibold">
              x{multi.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: ACHIEVEMENTS ===== */}
      <div className="mt-4">
        <h2 className="text-sm font-semibold text-white/80 mb-2">
          Achievements
        </h2>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {achievements.map((a) => {
            const st = achievementsState[a.id] || {
              done: false,
              claimed: false,
            };
            const isDone = st.done;
            const isClaimed = st.claimed;
            const canClaim = isDone && !isClaimed;

            return (
              <div
                key={a.id}
                className="rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white/90">
                    {a.title}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {a.description}
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">
                    Reward: ${a.reward}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isClaimed
                        ? "bg-emerald-700/60 text-emerald-100"
                        : isDone
                        ? "bg-amber-500/80 text-black"
                        : "bg-zinc-800 text-white/50"
                    }`}
                  >
                    {isClaimed ? "CLAIMED" : isDone ? "READY" : "LOCKED"}
                  </span>

                  <button
                    disabled={!canClaim}
                    onClick={() => canClaim && onClaim(a.id, a.reward)}
                    className={`text-[11px] px-2 py-1 rounded-lg border text-xs font-semibold ${
                      canClaim
                        ? "border-emerald-500 text-emerald-300"
                        : "border-zinc-700 text-zinc-500 opacity-60"
                    }`}
                  >
                    Claim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telegram debug info */}
      <div className="mt-6 text-xs text-white/40 break-all">
        <div className="font-semibold mb-1">Telegram debug:</div>
        <pre className="whitespace-pre-wrap break-all text-[10px]">
          {tgDebug}
        </pre>
      </div>
    </div>
  );
}
