// src/lib/telegram.ts
import { getProfile, setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

/**
 * Strong Telegram detection:
 * 1) Use window.Telegram.WebApp.initDataUnsafe.user when available
 * 2) Fallback: parse #tgWebAppData=... from URL on Android
 * 3) Save everything into mm_tg_debug for inspection
 */
export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const debug: any = {
    hasWindow: true,
    hasTelegram: !!window.Telegram,
    hasWebApp: !!window.Telegram?.WebApp,
    href: window.location.href,
  };

  let user: any | null = null;

  // ---------- 1) Normal Mini App path ----------
  const tg = window.Telegram?.WebApp;
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    try {
      user = { ...tg.initDataUnsafe.user, _source: "WebApp" };
      debug.used = "WebApp";
      debug.hasTelegram = true;
      debug.hasWebApp = true;
    } catch (e) {
      debug.webAppError = String(e);
    }
  }

  // ---------- 2) Fallback: parse #tgWebAppData=... ----------
  if (!user) {
    try {
      const url = new URL(window.location.href);
      const hash = url.hash || "";

      debug.hash = hash;

      // Example: #tgWebAppData=ENCODED_STRING&tgWebAppThemeParams=...
      const match = hash.match(/tgWebAppData=([^&]+)/);
      if (match && match[1]) {
        const encoded = match[1];
        const decoded = decodeURIComponent(encoded); // 1st decode
        debug.decodedTgWebAppData = decoded;

        const params = new URLSearchParams(decoded);
        const rawUser = params.get("user");

        if (rawUser) {
          // rawUser is JSON encoded again (%7B%22id%22...)
          const userJson = decodeURIComponent(rawUser);
          debug.userJson = userJson;

          const parsed = JSON.parse(userJson);
          user = { ...parsed, _source: "URL_HASH" };

          // If we successfully parsed this, we KNOW it's Telegram
          debug.used = "URL_HASH";
          debug.hasTelegram = true;
          debug.hasWebApp = true;
        }
      }
    } catch (e) {
      debug.hashError = String(e);
    }
  }

  // ---------- 3) Apply user or keep existing profile ----------
  if (user && user.id) {
    debug.hasUser = true;
    debug.userId = user.id;
    applyUser(user, debug);
  } else {
    debug.hasUser = false;
  }

  // Save debug for Profile page
  try {
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
  } catch {
    // ignore
  }
}

/**
 * Merge Telegram user info into our profile model.
 */
function applyUser(user: any, debug: any) {
  const existing = getProfile();

  // Country by language, fallback to existing / US
  let country = existing.country || "US";
  const lang = (user.language_code || "").toLowerCase();
  if (lang.startsWith("ru")) country = "RU";
  else if (lang.startsWith("tr")) country = "TR";
  else if (lang.startsWith("de")) country = "DE";
  else if (lang.startsWith("pt")) country = "BR";
  else if (lang.startsWith("hi")) country = "IN";

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    existing.name ||
    user.username ||
    "Player";

  const avatarUrl = user.photo_url || existing.avatarUrl;
  const uid = String(user.id);

  debug.finalCountry = country;
  debug.finalName = fullName;
  debug.finalUid = uid;
  debug.finalAvatar = avatarUrl;

  setProfile({
    uid,
    userId: uid,
    username: user.username || existing.username,
    name: fullName,
    country,
    avatarUrl,
  });
}
