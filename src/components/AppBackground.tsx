import React, { useEffect, useState } from "react";

type BgMode = "day" | "night";
type Season = "none" | "christmas";

function getBgState(): { mode: BgMode; season: Season } {
  const now = new Date();
  const hour = now.getHours();

  const mode: BgMode = hour >= 8 && hour < 20 ? "day" : "night";

  const month = now.getMonth(); // 0 = Jan, 11 = Dec
  const day = now.getDate();
  let season: Season = "none";

  // Christmas season: Dec 10 – Jan 5
  if ((month === 11 && day >= 10) || (month === 0 && day <= 5)) {
    season = "christmas";
  }

  return { mode, season };
}

export default function AppBackground() {
  const [state, setState] = useState(getBgState);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState(getBgState());
    }, 60_000); // update every minute
    return () => window.clearInterval(id);
  }, []);

  const { mode, season } = state;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base dark emerald gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021712] via-[#02070b] to-black" />

      {/* Soft center glow behind mascot area */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full blur-3xl opacity-70 transition-colors duration-1000 ${
          mode === "day"
            ? "bg-emerald-500/40"
            : "bg-cyan-400/30"
        }`}
      />

      {/* Large subtle emerald cloud on bottom */}
      <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[600px] h-[260px] rounded-[999px] bg-emerald-400/15 blur-3xl opacity-70" />

      {/* Dark vignette on edges for premium depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(0,0,0,0.85)_100%)]" />

      {/* Optional: day vs night subtle overlay */}
      {mode === "day" ? (
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/2 mix-blend-screen opacity-40" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
      )}

      {/* Seasonal snow (Christmas) */}
      {season === "christmas" && <SnowOverlay />}

      {/* Premium slow floating notes/coins */}
      <FloatingMoneyParticles />
    </div>
  );
}

function SnowOverlay() {
  const flakes = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="absolute inset-0 mm-snow-layer">
      {flakes.map((i) => {
        const size = 3 + (i % 3); // 3–5px
        const duration = 12 + (i % 7) * 2; // 12–24s
        const delay = -Math.random() * 20;
        const left = Math.random() * 100;

        return (
          <div
            key={i}
            className="mm-snowflake"
            style={{
              left: `${left}vw`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

function FloatingMoneyParticles() {
  const items = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="absolute inset-0">
      {items.map((i) => {
        const delay = -Math.random() * 25;
        const duration = 18 + i * 4;
        const left = 15 + i * 17; // spread across screen
        const size = 60 + i * 12;

        return (
          <div
            key={i}
            className="mm-money-particle bg-emerald-400/6 border border-emerald-300/10"
            style={{
              left: `${left}vw`,
              width: `${size}px`,
              height: `${size / 2}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}