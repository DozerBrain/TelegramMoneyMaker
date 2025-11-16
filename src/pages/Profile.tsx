// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";
import { getScore } from "../lib/storage";
import { submitScore } from "../lib/leaderboard";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [uid, setUid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    const p = getProfile();
    setName(p.name || "Player");
    setCountry(p.country || "US");
    setUid(p.uid);
    setAvatarUrl(p.avatarUrl);
  }, []);

  async function handleSave() {
    // save profile locally
    setProfile({ name, country });

    const p = getProfile();
    setUid(p.uid);
    setAvatarUrl(p.avatarUrl);

    // ALSO push score to Firebase leaderboard
    try {
      const score = Number(getScore() || 0);
      await submitScore(score, p);
    } catch (e) {
      console.log("submitScore failed", e);
    }
  }

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P";

  return (
    <div className="p-4 text-white">
      {/* Avatar + summary */}
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
      <label className="block text-sm mb-1 text-white/70">
        Display name
      </label>
      <input
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Country */}
      <label className="block text-sm mb-1 text-white/70">
        Country
      </label>
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
        {/* add more later */}
      </select>

      {/* Player ID (read-only) */}
      <label className="block text-sm mb-1 text-white/70">
        Player ID
      </label>
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
    </div>
  );
}
