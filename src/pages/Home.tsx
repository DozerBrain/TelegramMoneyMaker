import { useEffect, useMemo } from "react";
import { fmt } from "../lib/format";
import Card from "../components/Card";
import { SUITS } from "../data/suits";

type Props = {
  balance:number; setBalance:(n:number)=>void;
  totalEarnings:number; setTotalEarnings:(n:number)=>void;
  taps:number; setTaps:(n:number)=>void;
  tapValue:number; multi:number;
  currentSuitName:string; setCurrentSuitName:(s:string)=>void;
};

export default function Home(p:Props){
  const perTap = Math.max(1, Math.floor(p.tapValue * p.multi));
  const currentSuit = useMemo(()=>{
    const best = SUITS.reduce((acc, s)=> p.totalEarnings >= s.unlock ? s : acc);
    if (best.name !== p.currentSuitName) p.setCurrentSuitName(best.name);
    return best;
  }, [p.totalEarnings, p.currentSuitName]);

  function handleTap(){
    const gain = perTap;
    p.setBalance(p.balance + gain);
    p.setTotalEarnings(p.totalEarnings + gain);
    p.setTaps(p.taps + 1);
  }

  const nextSuit = useMemo(()=>{
    const idx = SUITS.findIndex(s => s.name === currentSuit.name);
    return SUITS[idx+1] ?? null;
  }, [currentSuit]);

  useEffect(()=>{ /* simple unlock glow: add CSS pulse once on change */ }, [currentSuit.name]);

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card title="Balance" right={<div className="badge">Total: ${fmt(p.totalEarnings)}</div>}>
        <div className="text-center">
          <div className="text-sm opacity-80">Current</div>
          <div className="text-4xl font-extrabold mt-1">${fmt(p.balance)}</div>
        </div>
      </Card>

      <div className="card flex flex-col items-center gap-3">
        <img
          src={currentSuit.image}
          alt={`Mr.T — ${currentSuit.name}`}
          className="w-56 h-auto rounded-xl select-none"
          draggable={false}
        />
        <div className="text-sm opacity-80">
          Suit: <span className="font-semibold">{currentSuit.name}</span>
          {nextSuit && <span className="opacity-70"> · Next at ${fmt(nextSuit.unlock)}</span>}
        </div>
        <button onClick={handleTap} className="btn-primary text-lg px-8">
          Tap to Earn 💵 (+{fmt(perTap)})
        </button>
      </div>

      <Card title="How to Play">
        <ul className="list-disc pl-6 text-sm opacity-90 space-y-1">
          <li>Tap the button to earn cash.</li>
          <li>Buy upgrades in the Shop to earn faster.</li>
          <li>Unlock new suits automatically as you earn more.</li>
          <li>Spin the wheel for bonuses once the cooldown ends.</li>
        </ul>
      </Card>
    </div>
  );
}
