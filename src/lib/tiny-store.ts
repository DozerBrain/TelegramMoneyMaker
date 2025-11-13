// src/lib/tiny-store.ts
// Lightweight wrapper for localStorage
export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function set<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed:", key);
  }
}
