import React, { useRef, useState } from "react"
import "./BanknoteButton.css"

type Props = {
  onTap?: () => void
  size?: number
  className?: string
  floatText?: string
}

export default function BanknoteButton({
  onTap,
  size = 120,
  className = "",
  floatText = "+1 💵",
}: Props) {
  const [boomKey, setBoomKey] = useState(0)
  const [textKey, setTextKey] = useState(0)
  const [fastSpin, setFastSpin] = useState(false)
  const [flashKey, setFlashKey] = useState(0)
  const btnRef = useRef<HTMLButtonElement>(null)

  const handlePress = () => {
    setBoomKey(k => k + 1)
    setTextKey(k => k + 1)

    setFastSpin(true)
    setFlashKey(k => k + 1)
    // the visual speed is controlled by CSS; this just gates the flash elements
    setTimeout(() => setFastSpin(false), 420)

    // tiny press tilt
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

  // 3D chip dimensions
  const chipW = S * 0.56
  const chipH = S * 0.34
  const chipT = Math.max(8, Math.round(S * 0.06)) // thickness in px

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: W,
        height: H + S * 0.14,
        perspective: 900, // stronger perspective for clearer 3D
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ambient glow behind */}
      <div
        className="absolute rounded-2xl blur-xl opacity-70 pointer-events-none"
        style={{
          left: 0,
          right: 0,
          margin: "auto",
          height: H * 0.9,
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow:
            "0 0 0.5rem rgba(16,255,176,.7), 0 0 2.2rem rgba(16,255,176,.35), 0 0 4rem rgba(16,255,176,.25)",
        }}
      />

      <button
        ref={btnRef}
        onClick={handlePress}
        className="group rounded-2xl bg-transparent outline-none transition-transform"
        aria-label="Tap the futuristic banknote"
        style={{
          width: W,
          height: H,
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "noteFloat 4s ease-in-out infinite",
        }}
      >
        {/* Edge ripple (per tap) */}
        <span
          key={boomKey}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            border: "2px solid rgba(16,255,176,.35)",
            transformOrigin: "center",
            animation: "banknoteRipple 450ms ease-out",
          }}
        />

        {/* Floating +1 text (per tap) */}
        <span
          key={"txt-" + textKey}
          className="pointer-events-none absolute text-emerald-300 font-extrabold"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: Math.max(14, S * 0.12),
            textShadow: "0 0 10px rgba(16,255,176,.7)",
            animation: "floatText 700ms ease-out",
          }}
        >
          {floatText}
        </span>

        {/* banknote body */}
        <div
          className="relative h-full w-full rounded-2xl"
          style={{ transform: "translateZ(0)", transition: "transform 120ms cubic-bezier(.2,.9,.2,1)" }}
        >
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
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
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10FFB0" floodOpacity="0.6" />
                <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#10FFB0" floodOpacity="0.25" />
              </filter>
            </defs>

            <rect x={4} y={4} width={W - 8} height={H - 8} rx={R} ry={R} fill="#061A14" stroke="url(#g-emerald)" strokeWidth={2.5} filter="url(#f-glow)" />
            <rect x={S * 0.1} y={S * 0.12} width={W - S * 0.2} height={H - S * 0.24} rx={R * 0.6} fill="rgba(0,0,0,0.25)" stroke="rgba(16,255,176,.55)" strokeWidth={1} />
          </svg>

          {/* === 3D 💸 chip === */}
          <div
            className={fastSpin ? "bill3d fast" : "bill3d"}
            style={{
              left: "50%",
              top: "50%",
              width: chipW,
              height: chipH,
              // pass custom CSS vars
              // @ts-ignore
              "--thick": `${chipT}px`,
              "--faceFS": `${S * 0.26}px`,
            } as React.CSSProperties}
          >
            {/* Edge/rim */}
            <div className="rim" />

            {/* Faces */}
            <div className="face front">💸</div>
            <div className="face back">💸</div>

          </div>

          {/* flash glow on tap (only while fastSpin true) */}
          {fastSpin && (
            <>
              <span
                key={"flash-" + flashKey}
                className="flash-ring"
                style={{ left: "50%", top: "50%", width: S * 0.92, height: S * 0.92 }}
              />
              <span
                key={"flash-2-" + flashKey}
                className="flash-core"
                style={{ left: "50%", top: "50%", width: S * 0.46, height: S * 0.46 }}
              />
            </>
          )}

          {/* corners */}
          <div
            style={{
              position: "absolute",
              left: S * 0.16,
              top: S * 0.12,
              fontSize: S * 0.12,
              color: "#10FFB0",
              textShadow: "0 0 6px rgba(16,255,176,.8)",
              fontWeight: "700",
            }}
          >
            $
          </div>
          <div
            style={{
              position: "absolute",
              right: S * 0.16,
              bottom: S * 0.12,
              fontSize: S * 0.12,
              color: "#10FFB0",
              textShadow: "0 0 6px rgba(16,255,176,.8)",
              fontWeight: "700",
            }}
          >
            $
          </div>
        </div>
      </button>

      {/* reflection */}
      <div
        className="bn-reflection animate"
        style={{ position: "absolute", width: W * 0.9, height: Math.max(10, H * 0.1), bottom: S * 0.02 }}
      />
    </div>
  )
}
