// simple localStorage helpers
const K = {
  TAP: "mm.tapCounter",
  COLLECTION: "mm.collection",
  LAST_DROP: "mm.lastDrop",
};

export type Collection = Record<import("../data/cards").Rarity, number>;

function getJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "") as T; }
  catch { return fallback; }
}

export const StorageAPI = {
  getTap(): number { return Number(localStorage.getItem(K.TAP) || "0"); },
  setTap(v: number) { localStorage.setItem(K.TAP, String(v)); },

  getCollection(): Collection {
    return getJSON<Collection>(K.COLLECTION, {
      common:0, uncommon:0, rare:0, epic:0, legendary:0, mythic:0, ultimate:0,
    });
  },
  setCollection(c: Collection) { localStorage.setItem(K.COLLECTION, JSON.stringify(c)); },

  setLastDrop(card: any | null) { localStorage.setItem(K.LAST_DROP, JSON.stringify(card)); },
  getLastDrop<T = any>(): T | null { return getJSON<T | null>(K.LAST_DROP, null); },
};
