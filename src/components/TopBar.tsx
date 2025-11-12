import { fmt } from "../lib/format";

export default function TopBar(props: {
  taps: number;
  tapValue: number;
  autoPerSec: number;
}) {
  return (
    <header className="sticky top-0 z-10 p-3 bg-black/40 backdrop-blur border-b border-white/5">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        <div className="badge">💸 MoneyMaker</div>
        <div className="flex items-center gap-2">
          <div className="badge">Taps: {fmt(props.taps)}</div>
          <div className="badge">Per Tap: +{fmt(props.tapValue)}</div>
          <div className="badge">Auto/s: +{fmt(props.autoPerSec)}</div>
        </div>
      </div>
    </header>
  );
}
