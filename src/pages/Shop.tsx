import Card from "../components/Card";
import { fmt } from "../lib/format";

type Props = {
  balance:number; setBalance:(n:number)=>void;
  tapValue:number; setTapValue:(n:number)=>void;
  autoPerSec:number; setAutoPerSec:(n:number)=>void;
  multi:number; setMulti:(n:number)=>void;
};

export default function Shop(p:Props){
  const items = [
    { id:"tap+1",  name:"+1 per tap",     desc:"Increase tap value by 1",   price: 100,     onBuy:()=>p.setTapValue(p.tapValue+1)},
    { id:"tap+5",  name:"+5 per tap",     desc:"Increase tap value by 5",   price: 1_000,   onBuy:()=>p.setTapValue(p.tapValue+5)},
    { id:"auto+1", name:"+1 auto / sec",  desc:"Earn passively each second",price: 5_000,   onBuy:()=>p.setAutoPerSec(p.autoPerSec+1)},
    { id:"x1.5",   name:"x1.5 multiplier",desc:"Multiply all earnings",     price: 25_000,  onBuy:()=>p.setMulti(parseFloat((p.multi*1.5).toFixed(2)))},
    { id:"x2",     name:"x2 multiplier",  desc:"Big boost to all earnings", price: 250_000, onBuy:()=>p.setMulti(parseFloat((p.multi*2).toFixed(2)))},
  ];

  function tryBuy(price:number, onBuy:()=>void){
    if (p.balance < price) return;
    p.setBalance(p.balance - price);
    onBuy();
  }

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col gap-4">
      <Card title="Upgrades" right={<div className="badge">Balance: ${fmt(p.balance)}</div>}>
        <div className="grid grid-cols-1 gap-3">
          {items.map(it=>(
            <div key={it.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
              <div>
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm opacity-70">{it.desc}</div>
              </div>
              <button
                className="btn-ghost"
                onClick={()=>tryBuy(it.price, it.onBuy)}
                disabled={p.balance < it.price}
              >
                ${fmt(it.price)}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Tips">
        <p className="opacity-90 text-sm">Stack multipliers and auto income, then tap to rocket into the Millionaire and Crypto King suits.</p>
      </Card>
    </div>
  );
}
