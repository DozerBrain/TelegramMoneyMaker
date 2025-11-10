import React, { useRef, useState } from "react"
import "./BanknoteButton.css"

type Props = {
  onTap?: () => void
  size?: number
  className?: string
  /** Text that floats on tap, e.g. "+1 💵" */
  floatText?: string
}

export default function BanknoteButton(props: Props) {
  const {
    onTap,
    size = 220,
    className = "",
    floatText = "+1 💵",
  } = props

  const [boomKey, setBoomKey] = useState(0)
  const [burstKey, setBurstKey] = useState(0)
  const [textKey, setTextKey] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)

  const handlePress = () => {
    setBoomKey((k) => k + 1)
    setBurstKey((k) => k + 1)
    setTextKey((k) => k + 1)
    if (btnRef.current) {
      btnRef.current.setAttribute("data-pressed", "1")
      setTimeout(() => btnRef.current?.removeAttribute("data-pressed"), 130)
    }
    onTap?.()
  }

  const S = size
  const W = S * 1.7
  const H = S
  const R = Math.max(12, S * 0.07)

  return (
    <div
      className={
        "relative inline-flex flex-col items-center justify-center select-none " +
        className
      }
      style={{
        width: W,
        height: H + S * 0.18,
        perspective: 1000,
      }}
    >
      {/* Emerald ambient glow behind the note */}
      <div
        className="absolute inset-x-0 top-0 rounded-2xl blur-xl opacity-70 pointer-events-none"
        style={{
          height: H,
          boxShadow:
            "0 0 0.5rem rgba(16,255,176,.7), 0 0 2.2rem rgba(16,255,176,.35), 0 0 4rem rgba(16,255,176,.25)",
        }}
      />

      {/* Tap surface (the banknote itself) */}
      <button
        ref={btnRef}
        onClick={handlePress}
        className="group absolute left-1/2 top-0 -translate-x-1/2 h-full rounded-2xl bg-transparent outline-none transition-transform"
        aria-label="Tap the futuristic banknote"
        style={{
          width: W,
          height: H,
          transformStyle: "preserve-3d",
          animation: "noteFloat 4s ease-in-out infinite",
        }}
      >
        {/* Edge ripple */}
        <span
          key={boomKey}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            border: "2px solid rgba(16,255,176,.35)",
            transformOrigin: "center",
            animation: "banknoteRipple 450ms ease-out",
          }}
        />

        {/* Center pulse ring */}
        <span
          key={"burst-" + burstKey}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: S * 0.6,
            height: S * 0.6,
            border: "2px solid rgba(16,255,176,.55)",
            boxShadow: "0 0 18px rgba(16,255,176,.45)",
            animation: "pulseOut 520ms ease-out",
          }}
        />

        {/* Floating gain text */}
        <span
          key={"txt-" + textKey}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-300 font-extrabold"
          style={{
            fontSize: Math.max(14, S * 0.12),
            textShadow: "0 0 10px rgba(16,255,176,.7)",
            animation: "floatText 700ms ease-out",
          }}
        >
          {floatText}
        </span>

        {/* SVG Note */}
        <div
          className="relative h-full w-full rounded-2xl"
          style={{
            transform: "translateZ(0)",
            transition: "transform 120ms cubic-bezier(.2,.9,.2,1)",
          }}
        >
          <svg
            width={W}
            height={H}
            viewBox={"0 0 " + W + " " + H}
            xmlns="http://www.w3.org/2000/svg"
            className="relative block"
          >
            <defs>
              <linearGradient id="g-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7CFFC4" />
                <stop offset="50%" stopColor="#10FFB0" />
                <stop offset="100%" stopColor="#00D39A" />
              </linearGradient>
              <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="6"
                  floodColor="#10FFB0"
                  floodOpacity="0.6"
                />
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="18"
                  floodColor="#10FFB0"
                  floodOpacity="0.25"
                />
              </filter>
            </defs>

            <rect
              x={4}
              y={4}
              width={W - 8}
              height={H - 8}
              rx={R}
              ry={R}
              fill="#061A14"
              stroke="url(#g-emerald)"
              strokeWidth={2.5}
              filter="url(#f-glow)"
            />
            <rect
              x={S * 0.1}
              y={S * 0.12}
              width={W - S * 0.2}
              height={H - S * 0.24}
              rx={R * 0.6}
              fill="rgba(0,0,0,0.25)"
              stroke="rgba(16,255,176,.55)"
              strokeWidth={1}
            />

            <g
              transform={
                "translate(" +
                (W / 2 - S * 0.14) +
                ", " +
                (H / 2 - S * 0.14) +
                ")"
              }
            >
              <circle
                r={S * 0.14}
                cx={S * 0.14}
                cy={S * 0.14}
                fill="rgba(16,255,176,.08)"
                stroke="rgba(16,255,176,.6)"
                strokeWidth={1}
              />
              <text
                x={S * 0.14}
                y={S * 0.175}
                textAnchor="middle"
                fontSize={S * 0.21}
                fontWeight={800}
                fill="#10FFB0"
              >
                100
              </text>
            </g>

            <text
              x={S * 0.16}
              y={S * 0.2}
              fontSize={S * 0.12}
              fill="#10FFB0"
              fontWeight={700}
            >
              $
            </text>
            <text
              x={W - S * 0.16}
              y={H - S * 0.12}
              fontSize={S * 0.12}
              fill="#10FFB0"
              fontWeight={700}
              textAnchor="end"
            >
              $
            </text>
          </svg>
        </div>
      </button>

      {/* Gentle neon reflection under the note */}
      <div
        className="bn-reflection animate"
        style={{
          width: W * 0.9,
          height: Math.max(10, H * 0.12),
          top: H - 2 + H * 0.05,
        }}
      />
    </div>
  )
}
