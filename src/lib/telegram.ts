// src/lib/telegram.ts
import { setProfile } from "./profile";

declare global {
  interface Window {
    Telegram?: any;
  }
}

type SimpleUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

function applyUserProfile(user: SimpleUser) {
  const lang = (user.language_code || "").toLowerCase();

  let country = "US";
  if (lang.startsWith("ru")) country = "RU";
  else if (lang.startsWith("tr")) country = "TR";
  else if (lang.startsWith("de")) country = "DE";
  else if (lang.startsWith("pt")) country = "BR";
  else if (lang.startsWith("hi")) country = "IN";

  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    "Player";

  const uid = String(user.id);

  // 🔥 Write everything into our saved profile
  setProfile({
    uid,
    name,
    country,
    avatarUrl: user.photo_url,
  });

  return { uid, name, country };
}

export function initTelegramUI() {
  if (typeof window === "undefined") return;

  const debug: any = {
    hasWindow: true,
    hasTelegram: !!window.Telegram,
    hasWebApp: false,
    href: window.location.href,
  };

  let used: "NONE" | "WEBAPP" | "URL" | "URL_HASH" = "NONE";
  let user: SimpleUser | undefined;

  // --- 1) Try native Telegram WebApp object ---
  const tg = window.Telegram?.WebApp;

  if (tg) {
    debug.hasWebApp = true;
    try {
      tg.ready?.();
      tg.expand?.();
    } catch {
      // ignore UI errors
    }

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const u = tg.initDataUnsafe.user;
      user = {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        username: u.username,
        language_code: u.language_code,
        photo_url: u.photo_url,
      };
      used = "WEBAPP";
    }
  }

  // Helper: decode tgWebAppData from a string (search or hash)
  const decodeFromPart = (part: string | null | undefined, source: "URL" | "URL_HASH") => {
    if (!part) return;

    const idx = part.indexOf("tgWebAppData=");
    if (idx === -1) return;

    const q = part.slice(idx + "tgWebAppData=".length);
    const encoded = q.split("&")[0]; // up to next &

    try {
      const decoded = decodeURIComponent(encoded);
      debug.decodedTgWebAppData = decoded;

      const params = new URLSearchParams(decoded);
      const id = params.get("user[id]");
      if (!id) return;

      const u: SimpleUser = {
        id,
        first_name: params.get("user[first_name]") || undefined,
        last_name: params.get("user[last_name]") || undefined,
        username: params.get("user[username]") || undefined,
        language_code: params.get("user[language_code]") || undefined,
        photo_url: params.get("user[photo_url]") || undefined,
      };

      user = u;
      used = source;
    } catch (e: any) {
      debug.decodeError = String(e);
    }
  };

  // --- 2) Try query string (?tgWebAppData=...) ---
  if (!user && window.location.search.includes("tgWebAppData=")) {
    decodeFromPart(window.location.search, "URL");
  }

  // --- 3) Try hash (#tgWebAppData=...) ---
  if (!user && window.location.hash.includes("tgWebAppData=")) {
    decodeFromPart(window.location.hash, "URL_HASH");
  }

  if (user && user.id) {
    debug.hasUser = true;
    debug.userId = String(user.id);
    debug.userJson = JSON.stringify(user);

    const applied = applyUserProfile(user);
    debug.finalUid = applied.uid;
    debug.finalName = applied.name;
    debug.finalCountry = applied.country;
  } else {
    debug.hasUser = false;
  }

  debug.used = used;

  try {
    localStorage.setItem("mm_tg_debug", JSON.stringify(debug));
  } catch {
    // ignore
  }
}
