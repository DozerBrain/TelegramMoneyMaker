// src/lib/telegram.ts
// Safe helpers for Telegram WebApp API. No-ops in normal browsers.

export type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

type TgWebApp = Window & { Telegram?: { WebApp?: any } };

function getWA(): any | null {
  if (typeof window === "undefined") return null;
  return (window as TgWebApp).Telegram?.WebApp ?? null;
}

export function initTelegramUI() {
  const wa = getWA();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
    // wa.disableVerticalSwipes?.();
  } catch {}
}

export function getTelegramUser(): TgUser | null {
  const wa = getWA();
  if (!wa) return null;
  const u = wa.initDataUnsafe?.user;
  if (!u) return null;
  return {
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    username: u.username,
    photo_url: u.photo_url,
  };
}

export function tgDisplayName(u: TgUser | null): string {
  if (!u) return "Player";
  const fn = u.first_name ?? "";
  const ln = u.last_name ?? "";
  if (fn || ln) return `${fn} ${ln}`.trim();
  return u.username ? `@${u.username}` : "Player";
}
