import React, { useRef, useState } from "react";

/**

Futuristic Banknote Tap Button

Pure SVG (no image assets)


Emerald neon glow, animated holo stripe & microtext


Press ripple + haptic-like bounce


Usage:

<BanknoteButton onTap={handleTap} size={256} />
*/ export default function BanknoteButton({ onTap, size = 220, className = "", }: { onTap?: () => void size?: number className?: string }) { const [boomKey, setBoomKey] = useState(0) const btnRef = useRef<HTMLButtonElement>(null)

const handlePress = () => { // Trigger ripple animation by changing key setBoomKey((k) => k + 1) // Tiny tap bounce via CSS data attr btnRef.current?.setAttribute("data-pressed", "1") setTimeout(() => btnRef.current?.removeAttribute("data-pressed"), 110) onTap?.() }

const S = size const W = S * 1.7 const H = S const R = Math.max(12, S * 0.07)

return ( <div className={relative inline-flex select-none ${className}} style={{ width: W, height: H }}> {/* Glow backdrop */} <div className="absolute inset-0 rounded-2xl blur-xl opacity-70 pointer-events-none" style={{ boxShadow: "0 0 0.5rem rgba(16,255,176,.7), 0 0 2.2rem rgba(16,255,176,.35), 0 0 4rem rgba(16,255,176,.25)" }} />

{/* Tap surface */}
  <button
    ref={btnRef}
    onClick={handlePress}
    className="group relative h-full w-full rounded-2xl bg-transparent outline-none active:scale-[0.985] transition-transform"
    aria-label="Tap the futuristic banknote"
  >
    {/* Ripple */}
    <span
      key={boomKey}
      className="pointer-events-none absolute inset-0 rounded-2xl animate-[banknote-ripple_450ms_ease-out]"
      style={{
        border: "2px solid rgba(16,255,176,.35)",
        transformOrigin: "center",
      }}
    />

    {/* SVG banknote */}
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="relative block">
      <defs>
        {/* Emerald gradient */}
        <linearGradient id="g-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7CFFC4" />
          <stop offset="50%" stopColor="#10FFB0" />
          <stop offset="100%" stopColor="#00D39A" />
        </linearGradient>

        {/* Hologram scanning gradient (animated via CSS) */}
        <linearGradient id="g-holo" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7CFFC4" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#E3FFF5" stopOpacity="0.9">
            <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#7CFFC4" stopOpacity="0.1" />
        </linearGradient>

        {/* Microtext pattern */}
        <pattern id="p-micro" width="8" height="8" patternUnits="userSpaceOnUse">
          <text x="0" y="7" fontSize="7" fontFamily="monospace" fill="rgba(0,255,170,.55)">
            1010
          </text>
        </pattern>

        {/* Soft glow */}
        <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10FFB0" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#10FFB0" floodOpacity="0.25" />
        </filter>

        {/* Circuit mask */}
        <pattern id="p-circuit" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 H20 M10 0 V20" stroke="rgba(0,255,160,.35)" strokeWidth="1" />
          <circle cx="10" cy="10" r="2" fill="rgba(0,255,160,.35)" />
        </pattern>
      </defs>

      {/* Note Base */}
      <rect x={4} y={4} width={W - 8} height={H - 8} rx={R} ry={R}
        fill="#061A14"
        stroke="url(#g-emerald)"
        strokeWidth={2.5}
        filter="url(#f-glow)"
      />

      {/* Inner frame */}
      <rect x={S*0.1} y={S*0.12} width={W - S*0.2} height={H - S*0.24} rx={R * 0.6}
        fill="rgba(0,0,0,0.25)"
        stroke="rgba(16,255,176,.55)"
        strokeWidth={1}
      />

      {/* Microtext strip top & bottom */}
      <rect x={S*0.1} y={S*0.08} width={W - S*0.2} height={S*0.04} fill="url(#p-micro)" opacity={0.75} />
      <rect x={S*0.1} y={H - S*0.12} width={W - S*0.2} height={S*0.04} fill="url(#p-micro)" opacity={0.75} />

      {/* Hologram stripe */}
      <rect x={W - S*0.38} y={S*0.12} width={S*0.18} height={H - S*0.24} rx={S*0.02}
        fill="url(#g-holo)"
        stroke="rgba(255,255,255,.4)"
        strokeWidth={0.75}
      />

      {/* Security chip */}
      <rect x={S*0.12} y={S*0.25} width={S*0.22} height={S*0.22} rx={8}
        fill="rgba(16,255,176,.15)"
        stroke="rgba(16,255,176,.7)"
        strokeWidth={1}
      />
      <g opacity={0.9} transform={`translate(${S*0.12 + S*0.03}, ${S*0.25 + S*0.03})`}>
        <rect width={S*0.05} height={S*0.16} rx={4} fill="rgba(16,255,176,.5)" />
        <rect x={S*0.06} width={S*0.05} height={S*0.16} rx={4} fill="rgba(16,255,176,.35)" />
        <rect x={S*0.12} width={S*0.05} height={S*0.16} rx={4} fill="rgba(16,255,176,.25)" />
      </g>

      {/* Denomination circle */}
      <g transform={`translate(${W/2 - S*0.14}, ${H/2 - S*0.14})`}>
        <circle r={S*0.14} cx={S*0.14} cy={S*0.14} fill="rgba(16,255,176,.08)" stroke="rgba(16,255,176,.6)" strokeWidth={1} />
        <text x={S*0.14} y={S*0.175} textAnchor="middle" fontSize={S*0.21} fontWeight={800} fill="#10FFB0" style={{ filter: "drop-shadow(0 0 6px rgba(16,255,176,.8))" }}>
          100
        </text>
      </g>

      {/* Subtle circuit overlay */}
      <rect x={S*0.1} y={S*0.12} width={W - S*0.2} height={H - S*0.24} fill="url(#p-circuit)" opacity={0.25} />

      {/* Corner glyphs */}
      <text x={S*0.16} y={S*0.2} fontSize={S*0.12} fill="#10FFB0" fontWeight={700}>$</text>
      <text x={W - S*0.16} y={H - S*0.12} fontSize={S*0.12} fill="#10FFB0" fontWeight={700} textAnchor="end">$</text>
    </svg>
  </button>

  {/* Local styles for animations */}
  <style jsx>{`
    @keyframes banknote-ripple { from { transform: scale(0.96); opacity: .6 } to { transform: scale(1.06); opacity: 0 } }
    button[data-pressed="1"] { transition: transform 110ms cubic-bezier(.2,.9,.2,1); transform: scale(.985); }
  `}</style>
</div>

) }
