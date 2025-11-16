// src/lib/telegram.ts

// Safe Telegram WebApp init helper.
// - If we're inside Telegram: use the real WebApp object.
// - If we're in a normal browser: do NOTHING (no fake user in production).

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const w = window as any;
  const tg = w.Telegram?.WebApp;

  // ✅ Real Telegram WebApp present
  if (tg) {
    try {
      // Tell Telegram we're ready and expand the app
      if (typeof tg.ready === "function") tg.ready();
      if (typeof tg.expand === "function") tg.expand();

      // Optional: make the app match our dark theme if supported
      if (typeof tg.setBackgroundColor === "function") {
        tg.setBackgroundColor("#000000");
      }
      if (typeof tg.setHeaderColor === "function") {
        tg.setHeaderColor("#000000");
      }
    } catch (e) {
      console.warn("Telegram WebApp init error:", e);
    }
    return;
  }

  // ❗ IMPORTANT:
  // Do NOT create / override window.Telegram here.
  // In production we want to fully rely on the real Telegram context.
  // For local dev you can add a dev-only stub, but keep it disabled in build.
}
