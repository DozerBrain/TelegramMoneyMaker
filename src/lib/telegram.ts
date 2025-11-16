// src/lib/telegram.ts
import { setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
    TelegramWebviewProxy?: any;
    tgWebAppData?: string;
  }
}

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const debug: any = {
    hasWindow: true,
    hasTelegram:
      !!window.Telegram ||
      !!window.TelegramWebviewProxy ||
      !!window.tgWebAppData,
    href: window.location.href,
  };

  // Try to get WebApp object (Desktop / iOS usually)
  const tg = window.Telegram?.WebApp || (window as any).TelegramWebviewProxy;
  debug.hasWebApp = !!tg;

  try {
    if (tg && typeof tg.ready === "function") {
      tg.ready();
    }
  } catch {
    // ignore
  }

  // 1) Normal WebApp way: tg.initDataUnsafe.user
  if (tg && (tg as any).initDataUnsafe && (tg as any).initDataUnsafe.user) {
    try {
      const user = (tg as any).initDataUnsafe.user;
      debug.source = "WebApp";
      applyUser(user);
      localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
      return;
    } catch (e) {
      debug.webAppError = String(e);
    }
  }

  // 2) Android way: ?tgWebAppData=... in URL
  try {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("tgWebAppData");

    if (encoded) {
      const params = new URLSearchParams(encoded);

      const userId = params.get("user[id]");
      const firstName = params.get("user[first_name]");
      const lastName = params.get("user[last_name]");
      const username = params.get("user[username]");
      const photo = params.get("user[photo_url]");
      const lang = params.get("user[language_code]");

      const user = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username,
        photo_url: photo,
        language_code: lang,
      };

      debug.source = "URL";
      applyUser(user);
    }
  } catch (e) {
    debug.urlError = String(e);
  }

  // Save debug info so we can see what happened
  try {
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
  } catch {
    // ignore
  }
}

function applyUser(user: any) {
  if (!user || !user.id) return;

  // Country guess from language
  let country = "US";
  const lang = (user.language_code || "").toLowerCase();
  if (lang.startsWith("ru")) country = "RU";
  else if (lang.startsWith("tr")) country = "TR";
  else if (lang.startsWith("de")) country = "DE";
  else if (lang.startsWith("pt")) country = "BR";
  else if (lang.startsWith("hi")) country = "IN";

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    "Player";

  setProfile({
    uid: String(user.id),
    userId: String(user.id),
    username: user.username,
    name: fullName,
    country,
    avatarUrl: user.photo_url,
  });
}
