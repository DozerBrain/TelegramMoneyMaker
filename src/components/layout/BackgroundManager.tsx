// src/components/layout/BackgroundManager.tsx
import React, { useMemo } from "react";

type BackgroundVariant = "home" | "secondary";

type BackgroundManagerProps = {
  variant: BackgroundVariant; // "home" for main tap screen, "secondary" for all other tabs
  children: React.ReactNode;
};

/**
 * Wraps the whole page and picks the correct background image based on:
 * - player local time (day vs night)
 * - which part of the app ("home" vs "secondary")
 */
export function BackgroundManager({
  variant,
  children,
}: BackgroundManagerProps) {
  // Player local time – we only need hour 0–23
  const isNight = useMemo(() => {
    const hour = new Date().getHours(); // player's local timezone
    // Night: 20:00–07:59, Day: 08:00–19:59
    return hour < 8 || hour >= 20;
  }, []);

  const bgUrl = useMemo(() => {
    if (variant === "home") {
      return isNight ? "/bg/home_night.png" : "/bg/home_day.png";
    } else {
      return isNight ? "/bg/secondary_night.png" : "/bg/secondary_day.png";
    }
  }, [variant, isNight]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 -z-10 bg-black bg-cover bg-center"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* Optional dark overlay tweak if you want UI to pop more at night */}
      {isNight && (
        <div className="absolute inset-0 -z-0 bg-black/40 pointer-events-none" />
      )}

      {/* Foreground content */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}
