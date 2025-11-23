// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";
import { achievements } from "../data/achievements";
import { formatMoneyShort } from "../lib/format";
import { signInWithGoogle } from "../lib/googleAuth";

type ProfileProps = {
  balance: number;
  totalEarnings: number;
  taps: number;
  tapValue: number;
  autoPerSec: number;
  multi: number;
  achievementsState: Record<string, { done: boolean; claimed: boolean }>;
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
}: ProfileProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [uid, setUid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile();

    let nextName = p.name || "Player";
    let nextCountry = p.country || "US";
    let nextUid = p.uid || "";
    let nextAvatar = p.avatarUrl as string | undefined;

    // Try to enrich from Telegram debug blob (for avatar / id / name)
    try {
      const raw = localStorage.getItem("mm_tg_debug");
      if (raw) {
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
              // ignore
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
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
  }

  async function handleGoogleLogin() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const profile = await signInWithGoogle();
      setName(profile.name);
      setCountry(profile.country);
      setUid(profile.uid);
      setAvatarUrl(profile.avatarUrl);
    } catch (err) {
      console.error(err);
      setAuthError("Google sign-in failed. Try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  const initials =
    (name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() as string) || "P";

  // ---- format helpers ----
  const fmtMoney = (n: number) => `$${formatMoneyShort(Math.floor(n))}`;
  const fmtAps = (n: number) => `$${formatMoneyShort(Math.floor(n))}/s`;
  const fmtInt = (n: number) => n.toLocaleString("en-US");
  const fmtMultiplier = (m: number) => `x${formatMoneyShort(m)}`;

  return (
    <div className="p-4 pb-24 text-white">
      {/* Avatar + name */}
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

      {/* Google login button */}
      <button
        onClick={handleGoogleLogin}
        disabled={authLoading}
        className="w-full mb-3 rounded-xl bg-white text-black font-semibold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <span className="text-lg">G</span>
        <span>{authLoading ? "Connecting Google..." : "Sign in with Google"}</span>
      </button>
      {authError && (
        <div className="text-xs text-red-400 mb-3">{authError}</div>
      )}

      {/* Name / country editing */}
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
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold py-3 mb-6"
      >
        Save Profile
      </button>

      {/* STATS */}
      <h2 className="text-sm font-semibold text-white/80 mb-2">Stats</h2>
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Balance</div>
          <div className="font-semibold">{fmtMoney(balance)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Total earned</div>
          <div className="font-semibold">{fmtMoney(totalEarnings)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Taps</div>
          <div className="font-semibold">{fmtInt(taps)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Tap value</div>
          <div className="font-semibold">{fmtMoney(tapValue)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">APS</div>
          <div className="font-semibold">{fmtAps(autoPerSec)}</div>
        </div>
        <div className="rounded-xl bg-zinc-900/70 px-3 py-2">
          <div className="text-xs text-white/50">Multiplier</div>
          <div className="font-semibold">{fmtMultiplier(multi)}</div>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <h2 className="text-sm font-semibold text-white/80 mb-2">
        Achievements
      </h2>
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {achievements.map((a) => {
          const st = achievementsState[a.id] || {
            done: false,
            claimed: false,
          };

          const canClaim = st.done && !st.claimed;

          return (
            <div
              key={a.id}
              className="rounded-xl bg-zinc-900/80 border border-white/5 px-3 py-2.5 flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-white/90">
                  {a.name}
                </div>
                <div className="text-xs text-white/55">{a.desc}</div>
                <div className="text-xs text-emerald-400 mt-0.5">
                  Reward: +${a.reward.toLocaleString()}
                </div>
              </div>

              <button
                disabled={!canClaim}
                onClick={() => onClaim(a.id, a.reward)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                  canClaim
                    ? "bg-emerald-600 hover:bg-emerald-500 text-black"
                    : st.claimed
                    ? "bg-emerald-900/60 text-emerald-300"
                    : "bg-zinc-800 text-white/50"
                }`}
              >
                {st.claimed ? "Claimed" : st.done ? "Claim" : "Locked"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
