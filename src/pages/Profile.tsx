// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { getProfile, setProfile, Profile } from "../lib/profile";

export default function ProfilePage() {
  const [profile, setState] = useState<Profile>(() => getProfile());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  useEffect(() => {
    setState(getProfile());
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f13] text-white flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-4 text-emerald-400">Your Profile</h1>

      <label className="mb-3">
        <div className="text-sm mb-1 opacity-80">Username</div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          value={profile.username}
          onChange={(e) => setState({ ...profile, username: e.target.value })}
          placeholder="Your nickname"
        />
      </label>

      <label className="mb-3">
        <div className="text-sm mb-1 opacity-80">Country (2 letters)</div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 uppercase"
          maxLength={2}
          value={profile.country}
          onChange={(e) => setState({ ...profile, country: e.target.value.toUpperCase() })}
          placeholder="US"
        />
      </label>

      <label className="mb-6">
        <div className="text-sm mb-1 opacity-80">Region / State (optional)</div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 uppercase"
          maxLength={24}
          value={profile.region || ""}
          onChange={(e) => setState({ ...profile, region: e.target.value.toUpperCase() })}
          placeholder="CA"
        />
      </label>

      <button
        onClick={handleSave}
        className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold"
      >
        Save
      </button>

      {saved && (
        <div className="text-emerald-400 text-center mt-3 animate-pulse">
          ✓ Saved successfully
        </div>
      )}
    </div>
  );
}
