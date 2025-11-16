// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";

export default function ProfilePage() {
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
    <div className="p-4 text-white">
      {/* Avatar */}
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
        </div>
      </div>

      {/* Name */}
      <label className="block text-sm mb-1 text-white/70">Display name</label>
      <input
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Country */}
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

      {/* Player ID */}
      <label className="block text-sm mb-1 text-white/70">Player ID</label>
      <input
        className="w-full mb-6 rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-sm text-white/60"
        value={uid}
        readOnly
      />

      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold py-3 mt-1"
      >
        Save Profile
      </button>

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
