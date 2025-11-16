// src/lib/telegram.ts
import { getProfile, setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
  }
}

/**
 * We retry a few times because on some devices Telegram.WebApp
 * appears a bit later after the page loads.
 */
let alreadyInitialized = false;

export function initTelegramUI() {
  if (typeof window === "undefined") return;
  if (alreadyInitialized) return;
  alreadyInitialized = true;

  const maxTries = 20; // 20 * 500ms = 10 seconds
  const delayMs = 500;

  const tryOnce = (attempt: number) => {
    const hasWindow = typeof window !== "undefined";
    const hasTelegram = !!(window as any).Telegram;
    const hasWebApp = !!(window as any).Telegram?.WebApp;

    // Save debug so we can see what happens on your phone
    try {
      localStorage.setItem(
        "mm_tg_debug",
        JSON.stringify({
          attempt,
          hasWindow,
          hasTelegram,
          hasWebApp,
          href: window.location.href,
          search: window.location.search,
        })
      );
    } catch {
      // ignore
    }

    if (!hasTelegram || !hasWebApp) {
      // If not ready yet, try again
      if (attempt < maxTries) {
        setTimeout(() => tryOnce(attempt + 1), delayMs);
      }
      return;
    }

    const tg = window.Telegram.WebApp;

    try {
      tg.ready();
    } catch {
      // ignore
    }

    try {
      const unsafe = tg.initDataUnsafe || {};
      const user = unsafe.user;

      if (!user || !user.id) {
        // no user data from Telegram – keep debug
        try {
          localStorage.setItem(
            "mm_tg_debug",
            JSON.stringify({
              attempt,
              hasWindow,
              hasTelegram,
              hasWebApp,
              hasUser: false,
              unsafe,
            })
          );
        } catch {
          //
        }
        return;
      }

      const existing = getProfile();

      const uid = String(user.id); // Telegram numeric id
      const name =
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        user.username ||
        existing.name ||
        "Player";

      const avatarUrl: string | undefined =
        (user.photo_url as string | undefined) || existing.avatarUrl;

      // Try to guess country from language_code, otherwise keep existing
      let country = existing.country || "US";
      const lang = (user.language_code || "").toLowerCase();
      if (lang.startsWith("ru")) country = "RU";
      else if (lang.startsWith("tr")) country = "TR";
      else if (lang.startsWith("de")) country = "DE";
      else if (lang.startsWith("pt")) country = "BR";
      else if (lang.startsWith("hi")) country = "IN";

      setProfile({
        uid,
        userId: uid,
        username: user.username || existing.username,
        name,
        country,
        avatarUrl,
      });

      // Save raw user + attempt for debugging
      try {
        localStorage.setItem(
          "mm_tg_debug",
          JSON.stringify({
            attempt,
            hasWindow,
            hasTelegram,
            hasWebApp,
            hasUser: true,
            user,
          })
        );
      } catch {
        //
      }
    } catch (err) {
      console.log("Telegram init failed", err);
    }
  };

  // start first attempt
  tryOnce(1);
}
