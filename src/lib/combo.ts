// Simple global combo tracker with an expiry window.
const COMBO_WINDOW_MS = 1500;

let combo = 0;
let best = 0;
let timer: number | null = null;
let lastTap = 0;

export function comboTap() {
  const now = Date.now();
  const within = now - lastTap <= COMBO_WINDOW_MS;
  combo = within ? combo + 1 : 1;
  lastTap = now;

  if (combo > best) best = combo;

  // announce
  window.dispatchEvent(new CustomEvent("combo:update", { detail: { combo, best } }));

  // reset timer
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    combo = 0;
    window.dispatchEvent(new CustomEvent("combo:update", { detail: { combo, best } }));
  }, COMBO_WINDOW_MS);
}

export function getCombo() { return combo; }
export function getBestCombo() { return best; }
