// src/pages/profile/ProfileAchievementsTab.tsx
import React from "react";
import { achievements } from "../../data/achievements";
import { getTitleDef } from "../../data/titles";

type Props = {
  achievementsState: Record<string, { done: boolean; claimed: boolean }>;
  onClaim: (id: string, reward: number) => void;
};

export default function ProfileAchievementsTab({
  achievementsState,
  onClaim,
}: Props) {
  return (
    <>
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
          const titleReward = a.unlockTitleId
            ? getTitleDef(a.unlockTitleId)
            : undefined;

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
                  {titleReward && (
                    <span className="block text-[11px] text-white/70">
                      + Title: {titleReward.label}
                    </span>
                  )}
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
    </>
  );
}
