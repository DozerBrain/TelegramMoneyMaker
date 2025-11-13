// src/pages/Profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getProfile, saveProfile, type PlayerProfile } from "../lib/profile";
import { getTelegramUser, tgDisplayName } from "../lib/telegram";

const COUNTRIES = ["US","GB","DE","RU","TR","IN","BR","FR","ES","IT","UA","PL","CA","AU","KZ","AE","UZ","AZ","AM","GE","MX","AR","ID","NG","PK","BD"];

export default function ProfilePage() {
  const base = getProfile();
  const tg = getTelegramUser();

  // start with local profile values
  const [p, setP] = useState<PlayerProfile>(base);
  const [saved, setSaved] = useState(false);

  // suggested Telegram name/photo
  const tgName = tgDisplayName(tg);
  const tgPhoto = tg?.photo_url || "";

  // initials if no photo
  const initials = useMemo(() => {
    const parts = (p.name || "Player").trim().split(/\s+/).slice(0, 2);
    return parts.map(s => s[0]?.toUpperCase() || "").join("") || "P";
  }, [p.name]);

  // If user is inside Telegram and profile has no name yet, suggest it once
  useEffect(() => {
    if (tg && (!base.name || base.name.startsWith("Banker#"))) {
      setP(prev => ({ ...prev, name: tgName }));
    }
    // eslint-disable-next-line
  }, []);

  function useTelegramIdentity() {
    setP(prev => ({
      ...prev,
      name: tgName,
      // store avatarUrl so your app can reuse it outside Telegram too
      avatarUrl: tgPhoto || prev.avatarUrl,
    }));
  }

  async function onSave() {
    const next = { ...p, lastSeen: Date.now() };
    await saveProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="p-4 text-white">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/40">
          {p.avatarUrl || tgPhoto ? (
            <img
              src={p.avatarUrl || tgPhoto}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center bg-white/5 text-emerald-300 font-bold text-lg">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs text-white/60 mb-1">Display name</div>
          <input
            value={p.name}
            onChange={(e) => setP({ ...p, name: e.target.value.slice(0, 24) })}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none"
            placeholder="Your name"
          />
        </div>
      </div>

      {/* Telegram quick-fill */}
      {tg && (
        <button
          onClick={useTelegramIdentity}
          className="mb-4 w-full rounded-xl py-3 bg-white/10 hover:bg-white/20 text-sm font-semibold"
        >
          Use Telegram name/photo ({tgName})
        </button>
      )}

      {/* Country */}
      <div className="mb-4">
        <div className="text-xs text-white/60 mb-1">Country</div>
        <select
          value={p.country}
          onChange={(e) => setP({ ...p, country: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none"
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* UID (readonly) */}
      <div className="mb-4">
        <div className="text-xs text-white/60 mb-1">Player ID</div>
        <div className="font-mono text-xs bg-black/30 border border-white/10 rounded-xl px-3 py-2 break-all">
          {p.uid}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={onSave}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold"
      >
        Save Profile
      </button>
      {saved && <div className="mt-3 text-center text-emerald-300 text-sm">Saved ✓</div>}
    </div>
  );
}
