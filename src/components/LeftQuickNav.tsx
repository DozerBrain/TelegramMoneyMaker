import React from "react";

type Dest = "cards" | "suits" | "pets";

function go(dest: Dest) {
  // Broadcast a global navigation event your App.tsx will listen to.
  window.dispatchEvent(new CustomEvent("MM_GOTO", { detail: dest }));
}

const Btn: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-28 select-none rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-left text-sm font-medium text-emerald-200 shadow-sm hover:bg-emerald-500/15 active:scale-[0.98]"
  >
    {label}
  </button>
);

const LeftQuickNav: React.FC = () => {
  return (
    <div className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
      <Btn label="🃏 Cards" onClick={() => go("cards")} />
      <Btn label="🧥 Suits" onClick={() => go("suits")} />
      <Btn label="🐉 Pets" onClick={() => go("pets")} />
    </div>
  );
};

export default LeftQuickNav;
