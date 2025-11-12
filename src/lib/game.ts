import { CARDS, weightedPick, Card } from "../data/cards";
import { StorageAPI } from "./storage";

/**
 * Called from the main tap button.
 * Increments counter and opens a pack automatically on 5.
 * Emits CustomEvents for UI: 'pack:update' and 'pack:opened'
 */
export function handleMainTapForPacks() {
  const current = StorageAPI.getTap();
  const next = current + 1;
  if (next < 5) {
    StorageAPI.setTap(next);
    window.dispatchEvent(new CustomEvent("pack:update", { detail: { tap: next } }));
    return { opened: false as const };
  }

  // open pack
  const card: Card = weightedPick(CARDS);
  // update collection
  const col = StorageAPI.getCollection();
  col[card.rarity] = (col[card.rarity] ?? 0) + 1;
  StorageAPI.setCollection(col);
  // reset counter + remember last drop
  StorageAPI.setTap(0);
  StorageAPI.setLastDrop(card);

  // notify UI
  window.dispatchEvent(new CustomEvent("pack:update", { detail: { tap: 0 } }));
  window.dispatchEvent(new CustomEvent("pack:opened", { detail: { card } }));

  return { opened: true as const, card };
}
