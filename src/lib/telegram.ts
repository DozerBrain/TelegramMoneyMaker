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

  // ---- 1) Normal Telegram MiniApp ----
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    applyUser(user);
    debug.source = "WebApp";
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
    return;
  }

  // ---- 2) Android “URL payload” mode ----
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get("tgWebAppData");

  if (encoded) {
    try {
      const params = new URLSearchParams(encoded);

      const id = params.get("user[id]");
      const first = params.get("user[first_name]");
      const last = params.get("user[last_name]");
      const username = params.get("user[username]");
      const lang = params.get("user[language_code]");
      const photo = params.get("user[photo_url]");

      const user = {
        id,
        first_name: first,
        last_name: last,
        username,
        language_code: lang,
        photo_url: photo,
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

  // Country detection
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
