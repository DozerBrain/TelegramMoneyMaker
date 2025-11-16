import { getProfile, setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const debug: any = {
    hasWindow: true,
    hasTelegram: !!window.Telegram,
    href: window.location.href,
  };

  const tg = window.Telegram?.WebApp;
  debug.hasWebApp = !!tg;

  // 1️⃣ Try Telegram.WebApp normally
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    applyUser(user);
    debug.source = "WebApp";
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
    return;
  }

  // 2️⃣ If not available, try reading from URL (Android injects ?tgWebAppData=...)
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get("tgWebAppData");

  if (encoded) {
    try {
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

      applyUser(user);
      debug.source = "URL";
    } catch (e) {
      debug.error = String(e);
    }
  }

  localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
}

function applyUser(user: any) {
  if (!user || !user.id) return;

  let country = "US";
  const lang = (user.language_code || "").toLowerCase();
  if (lang.startsWith("ru")) country = "RU";
  else if (lang.startsWith("tr")) country = "TR";
  else if (lang.startsWith("de")) country = "DE";
  else if (lang.startsWith("pt")) country = "BR";
  else if (lang.startsWith("hi")) country = "IN";

  const fullname =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    "Player";

  setProfile({
    uid: String(user.id),
    userId: String(user.id),
    username: user.username,
    name: fullname,
    country,
    avatarUrl: user.photo_url,
  });
}
