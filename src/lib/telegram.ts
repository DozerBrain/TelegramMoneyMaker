// src/lib/telegram.ts
import { setProfile, getProfile } from "./profile";

export function initTelegramUI() {
  const w = window as any;
  const tg = w.Telegram?.WebApp;
  if (!tg) return; // not inside Telegram → no-op

  try {
    tg.ready();
    tg.expand();
  } catch {
    // ignore errors
  }

  // Try to sync Telegram user into our profile once
  try {
    const user = tg.initDataUnsafe?.user;
    if (!user) return;

    const fullUid = String(user.id);
    const fullName =
      (user.first_name || "") +
        (user.last_name ? ` ${user.last_name}` : "") || "";
    const displayName =
      fullName || user.username || getProfile().name || "Player";

    setProfile({
      uid: fullUid,
      userId: fullUid,
      name: displayName,
      username: user.username ?? undefined,
      avatarUrl: user.photo_url ?? undefined,
    });
  } catch {
    // ignore
  }
}
