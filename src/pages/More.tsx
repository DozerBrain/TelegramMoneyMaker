// src/pages/More.tsx
import Card from "../components/Card";
import { fmt } from "../lib/format";
import { resetSave } from "../lib/storage";
import { achievements } from "../data/achievements";

type Props = {
  balance:number; totalEarnings:number; taps:number;
  tapValue:number; autoPerSec:number; multi:number;
  achievementsState: Record<string, {done:boolean; claimed:boolean}>;
  onClaim:(id:string, reward:number)=>void;

  onReset:()=>void;
  onExport:()=>void; onImport:(raw:string)=>void;
};

export default function More(p:Props){
  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card title="Stats">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="badge">Balance: ${fmt(p.balance)}</div>
          <div className="badge">Total: ${fmt(p.totalEarnings)}</div>
          <div className="badge">Taps: {fmt(p.taps)}</div>
          <div className="badge">Per Tap: +{fmt(p.tapValue)}</div>
          <div className="badge">Auto/s: +{fmt(p.autoPerSec)}</div>
          <div className="badge">Multi: x{p.multi.toFixed(2)}</div>
        </div>
      </Card>

      <Card title="Achievements">
        <div className="grid grid-cols-1 gap-3">
          {achievements.map(a=>{
            const st = p.achievementsState[a.id];
            const done = !!st?.done;
            const claimed = !!st?.claimed;
            return (
              <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <div className="font-semibold">{a.name} {done && "✅"}</div>
                  <div className="text-sm opacity-70">{a.desc}</div>
                  <div className="text-xs opacity-60 mt-1">Reward: ${fmt(a.reward)}</div>
                </div>
                <button
                  className="btn-ghost"
                  disabled={!done || claimed}
                  onClick={()=>p.onClaim(a.id, a.reward)}
                >
                  {claimed ? "Claimed" : done ? "Claim" : "Locked"}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Data">
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={p.onExport}>Export Save</button>
          <button className="btn-ghost" onClick={()=>{
            const raw = prompt("Paste save JSON:");
            if (raw) p.onImport(raw);
          }}>Import Save</button>
          <button className="btn-ghost" onClick={()=>{
            if (confirm("Reset all progress?")) { resetSave(); p.onReset(); }
          }}>Reset</button>
        </div>
      </Card>

      <Card title="Coming Next">
        <ul className="list-disc pl-6 text-sm opacity-80 space-y-1">
          <li>Prestige/Rebirth for exponential scaling</li>
          <li>Leaderboards & referrals</li>
          <li>Tutorial overlay for new players</li>
        </ul>
      </Card>
    </div>
  );
}
