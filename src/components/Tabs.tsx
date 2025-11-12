type Tab = "home" | "shop" | "spin" | "more";

export default function Tabs({active, onChange}:{active:Tab, onChange:(t:Tab)=>void}) {
  const btn = (id:Tab, label:string, icon:string) => (
    <button
      onClick={()=>onChange(id)}
      className={`tab ${active===id ? "tab-active" : "bg-white/0 hover:bg-white/5"}`}
    >
      <span className="opacity-80">{icon}</span>
      <span className="ml-1">{label}</span>
    </button>
  );
  return (
    <nav className="sticky bottom-0 p-3 bg-black/40 backdrop-blur border-t border-white/5">
      <div className="max-w-xl mx-auto grid grid-cols-4 gap-2">
        {btn("home","Home","🏠")}
        {btn("shop","Shop","🛒")}
        {btn("spin","Spin","🎡")}
        {btn("more","More","⋯")}
      </div>
    </nav>
  );
}
