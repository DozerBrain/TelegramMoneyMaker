// src/pages/profile/ProfileSettingsTab.tsx
import React from "react";
import type { TitleDef } from "../../data/titles";

type Props = {
  name: string;
  country: string;
  uid: string;
  authLoading: boolean;
  authError: string | null;
  onNameChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onSaveProfile: () => void;
  onGoogleLogin: () => void;

  unlockedTitles: TitleDef[];
  lockedTitles: TitleDef[];
  equippedTitleId: string;
  equippedTitle: TitleDef | null;
  onChangeTitle: (id: string | null) => void;
};

export default function ProfileSettingsTab({
  name,
  country,
  uid,
  authLoading,
  authError,
  onNameChange,
  onCountryChange,
  onSaveProfile,
  onGoogleLogin,
  unlockedTitles,
  lockedTitles,
  equippedTitleId,
  equippedTitle,
  onChangeTitle,
}: Props) {
  return (
    <>
      {/* Google login button */}
      <button
        onClick={onGoogleLogin}
        disabled={authLoading}
        className="w-full mb-3 rounded-xl bg-white text-black font-semibold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <span className="text-lg">G</span>
        <span>
          {authLoading ? "Connecting Google..." : "Sign in with Google"}
        </span>
      </button>
      {authError && (
        <div className="text-xs text-red-400 mb-3">{authError}</div>
      )}

      {/* Name / country / ID / Save */}
      <label className="block text-sm mb-1 text-white/70">Display name</label>
      <input
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <label className="block text-sm mb-1 text-white/70">Country</label>
      <select
        className="w-full mb-4 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        value={country}
        onChange={(e) => onCountryChange(e.target.value)}
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
        onClick={onSaveProfile}
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold py-3 mb-6"
      >
        Save Profile
      </button>

      {/* TITLE PICKER SECTION */}
      <h2 className="text-sm font-semibold text-white/80 mb-2">Title</h2>
      <div className="mb-6 rounded-xl bg-zinc-900/70 px-3 py-3">
        {unlockedTitles.length === 0 ? (
          <div className="text-xs text-white/50">
            You don&apos;t have any titles unlocked yet.
            <br />
            Conquer countries, earn achievements, and you&apos;ll start
            unlocking rare titles to flex.
          </div>
        ) : (
          <>
            <label className="block text-xs mb-1 text-white/60">
              Equipped title
            </label>
            <select
              className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              value={equippedTitleId}
              onChange={(e) => onChangeTitle(e.target.value || null)}
            >
              <option value="">None</option>
              {unlockedTitles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.rarity})
                </option>
              ))}
            </select>
            {equippedTitle && equippedTitle.description && (
              <div className="mt-1 text-[11px] text-white/45">
                {equippedTitle.description}
              </div>
            )}
          </>
        )}

        {/* Locked titles list */}
        {lockedTitles.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/5">
            <div className="text-[11px] text-white/45 mb-1">
              Locked titles ({lockedTitles.length})
            </div>
            <div className="max-h-24 overflow-y-auto space-y-0.5">
              {lockedTitles.map((t) => (
                <div
                  key={t.id}
                  className="text-[11px] text-white/30 flex items-center justify-between"
                >
                  <span>{t.label}</span>
                  <span className="uppercase text-[10px] text-white/25">
                    {t.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
