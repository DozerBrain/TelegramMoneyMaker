// src/lib/telegram.ts
import { getProfile, setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const tg = window.Telegram?.WebApp;
  if (!tg) return; // not inside Telegram → do nothing

  try {
    tg.ready();
  } catch {
    // ignore
  }

  try {
    const unsafe = tg.initDataUnsafe || {};
    const user = unsafe.user;

    if (!user || !user.id) {
      // store something so we can see later if it's empty
      localStorage.setItem(
        "mm_tg_debug",
        JSON.stringify({ hasUser: false, unsafe })
      );
      return;
    }

    const existing = getProfile();

    const name =
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      existing.name ||
      "Player";

    const avatarUrl: string | undefined =
      user.photo_url || existing.avatarUrl;

    // Try to guess country from language_code, otherwise keep existing
    let country = existing.country || "US";
    const lang = (user.language_code || "").toLowerCase();
    if (lang.startsWith("ru")) country = "RU";
    else if (lang.startsWith("tr")) country = "TR";
    else if (lang.startsWith("de")) country = "DE";
    else if (lang.startsWith("pt")) country = "BR";
    else if (lang.startsWith("hi")) country = "IN";

    // IMPORTANT: do NOT change uid here, only cosmetic info
    setProfile({
      name,
      country,
      avatarUrl,
      username: user.username || existing.username,
    });

    // Save raw user for debugging (optional)
    localStorage.setItem("mm_tg_debug", JSON.stringify({ hasUser: true, user }));
  } catch (err) {
    console.log("Telegram init failed", err);
  }
}
