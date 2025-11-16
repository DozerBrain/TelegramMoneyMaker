// src/lib/telegram.ts
import { getProfile, setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  try {
    const anyWin = window as any;
    const tg = anyWin.Telegram?.WebApp;

    // 🔍 Always write some debug so we know what Telegram looks like
    const debug: any = {
      hasWindow: true,
      hasTelegram: !!anyWin.Telegram,
      hasWebApp: !!tg,
    };

    if (!tg) {
      // ❌ Not running as Telegram WebApp – just a normal browser
      localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
      return;
    }

    // ✅ We are inside Telegram WebApp
    tg.ready();

    const unsafe = tg.initDataUnsafe || {};
    debug.initDataKeys = Object.keys(unsafe || {});

    const user = unsafe.user;
    if (!user || !user.id) {
      // We are in WebApp, but Telegram didn’t give user data
      debug.hasUser = false;
      debug.user = user || null;
      localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
      return;
    }

    // 🎯 We have real Telegram user!
    debug.hasUser = true;
    debug.user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      language_code: user.language_code,
    };

    const existing = getProfile();

    const uid = String(user.id); // stable Telegram numeric id
    const name =
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      existing.name ||
      "Player";

    const avatarUrl: string | undefined =
      user.photo_url || existing.avatarUrl;

    // Guess country by language, keep existing if set
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

    // Save final debug
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
  } catch (err) {
    localStorage.setItem(
      "mm_tg_debug",
      JSON.stringify({ error: String(err) })
    );
  }
}
