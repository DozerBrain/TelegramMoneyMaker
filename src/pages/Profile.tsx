// src/pages/Profile.tsx
import React, { useEffect, useState } from "react";
import { getProfile, setProfile } from "../lib/profile";
import { signInWithGoogle } from "../lib/googleAuth";

// ✅ TITLES: use the dedicated storageTitles helpers
import { getTitleState, updateTitleState } from "../lib/storageTitles";
import { TITLES, getTitleDef, type TitleDef } from "../data/titles";

// Tabs
import ProfileStatsTab from "./profile/ProfileStatsTab";
import ProfileAchievementsTab from "./profile/ProfileAchievementsTab";
import ProfileSettingsTab from "./profile/ProfileSettingsTab";

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

type TabKey = "stats" | "achievements" | "settings";

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

  // Titles UI state
  const [equippedTitleId, setEquippedTitleId] = useState<string>("");
  const [unlockedTitleIds, setUnlockedTitleIds] = useState<string[]>([]);
  const [equippedTitle, setEquippedTitle] = useState<TitleDef | null>(null);

  // Right side nav
  const [activeTab, setActiveTab] = useState<TabKey>("stats");

  // ---- PROFILE LOAD (name / country / uid / avatar) ----
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
      }
    } catch {
      // ignore
    }

    setName(nextName);
    setCountry(nextCountry);
    setUid(nextUid);
    setAvatarUrl(nextAvatar);
  }, []);

  // ---- TITLES LOAD + LIVE SYNC ----
  useEffect(() => {
    const syncTitles = () => {
      try {
        const ts = getTitleState();
        const eqId = ts.equippedTitleId ?? null;
        setUnlockedTitleIds(ts.unlockedTitleIds ?? []);
        setEquippedTitleId(eqId ?? "");
        setEquippedTitle(eqId ? getTitleDef(eqId) ?? null : null);
      } catch {
        // ignore
      }
    };

    // initial read
    syncTitles();

    // whenever saveSave() runs (including after claiming achievements),
    // this event is dispatched from storageCore and we refresh titles
    window.addEventListener("mm:save", syncTitles as EventListener);
    return () => {
      window.removeEventListener("mm:save", syncTitles as EventListener);
    };
  }, []);

  function handleSaveProfile() {
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

  // Titles lists for settings tab
  const unlockedTitles: TitleDef[] = TITLES.filter((t) =>
    unlockedTitleIds.includes(t.id)
  );
  const lockedTitles: TitleDef[] = TITLES.filter(
    (t) => !unlockedTitleIds.includes(t.id)
  );

  function handleChangeTitleId(id: string | null) {
    const value = id ?? "";
    setEquippedTitleId(value);
    setEquippedTitle(id ? getTitleDef(id) ?? null : null);

    updateTitleState((prev) => {
      if (id === null) {
        return { ...prev, equippedTitleId: null };
      }
      if (!prev.unlockedTitleIds.includes(id)) {
        // can't equip a title you don't own
        return prev;
      }
      return { ...prev, equippedTitleId: id };
    });
  }

  const tabButtonClass = (tab: TabKey) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border ${
      activeTab === tab
        ? "bg-emerald-600 border-emerald-400 text-black"
        : "bg-zinc-900/60 border-white/10 text-white/60"
    }`;

  return (
    <div className="p-4 pb-24 text-white">
      {/* Header: avatar + name + right-side nav */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
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

            {/* Equipped title */}
            {equippedTitle && (
              <div className="text-[11px] text-emerald-300 mt-0.5">
                Title: {equippedTitle.label}
              </div>
            )}
          </div>
        </div>

        {/* Right-side nav */}
        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="text-[11px] text-white/40 mb-0.5">PROFILE</span>
          <div className="flex flex-col gap-1">
            <button
              className={tabButtonClass("stats")}
              onClick={() => setActiveTab("stats")}
            >
              Stats
            </button>
            <button
              className={tabButtonClass("achievements")}
              onClick={() => setActiveTab("achievements")}
            >
              Achievements
            </button>
            <button
              className={tabButtonClass("settings")}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === "settings" && (
        <ProfileSettingsTab
          name={name}
          country={country}
          uid={uid}
          authLoading={authLoading}
          authError={authError}
          onNameChange={setName}
          onCountryChange={setCountry}
          onSaveProfile={handleSaveProfile}
          onGoogleLogin={handleGoogleLogin}
          unlockedTitles={unlockedTitles}
          lockedTitles={lockedTitles}
          equippedTitleId={equippedTitleId}
          equippedTitle={equippedTitle}
          onChangeTitle={handleChangeTitleId}
        />
      )}

      {activeTab === "stats" && (
        <ProfileStatsTab
          balance={balance}
          totalEarnings={totalEarnings}
          taps={taps}
          tapValue={tapValue}
          autoPerSec={autoPerSec}
          multi={multi}
        />
      )}

      {activeTab === "achievements" && (
        <ProfileAchievementsTab
          achievementsState={achievementsState}
          onClaim={onClaim}
        />
      )}
    </div>
  );
}
