import Card from "../components/Card";
import { formatMoneyShort } from "../lib/format";

type Props = {
  balance:number; setBalance:(n:number)=>void;
  tapValue:number; setTapValue:(n:number)=>void;
  autoPerSec:number; setAutoPerSec:(n:number)=>void;
  multi:number; setMulti:(n:number)=>void;
  spinCooldownEndsAt:number|null; setSpinCooldownEndsAt:(t:number|null)=>void;
};

const COOLDOWN_MS = 1000 * 60 * 60 * 8; // 8 hours

export default function Spin(p:Props){
  const now = Date.now();
  const remaining = p.spinCooldownEndsAt ? Math.max(0, p.spinCooldownEndsAt - now) : 0;
  const canSpin = remaining === 0;

  function spinOnce(){
    if (!canSpin) return;
    // simple weighted rewards
    const r = Math.random();
    if (r < 0.4) { const a = 1000 + Math.floor(Math.random()*4000); p.setBalance(p.balance + a); }
    else if (r < 0.7) { p.setTapValue(p.tapValue + 2); }
    else if (r < 0.9) { p.setAutoPerSec(p.autoPerSec + 2); }
    else { p.setMulti(parseFloat((p.multi * 1.25).toFixed(2))); }
    p.setSpinCooldownEndsAt(Date.now() + COOLDOWN_MS);
  }

  function fmtTime(ms:number){
    const s = Math.ceil(ms/1000);
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const ss = s%60;
    return `${h}h ${m}m ${ss}s`;
  }

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card title="Daily Spin" right={<div className="badge">Balance: ${fmt(p.balance)}</div>}>
        <p className="opacity-80 mb-3 text-sm">Spin for rewards. Cooldown 8h.</p>
        <button onClick={spinOnce} className="btn-primary w-full text-lg" disabled={!canSpin}>
          {canSpin ? "Spin the Wheel 🎡" : `Cooldown: ${fmtTime(remaining)}`}
        </button>
        <ul className="list-disc pl-6 mt-4 text-sm opacity-80 space-y-1">
          <li>💵 Bonus cash</li>
          <li>👆 +Tap value</li>
          <li>⚙️ Auto income</li>
          <li>✨ Global multiplier</li>
        </ul>
      </Card>
    </div>
  );
}
