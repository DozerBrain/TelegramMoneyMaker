// src/lib/titles.ts
import {
  TITLES,
  type TitleDef,
  type TitleId,
  type TitleSource,
  getTitleDef,
  getWorldTitles,
} from "../data/titles";

// Simple helpers / re-exports around the central title data

export { TITLES, getTitleDef, getWorldTitles };
export type { TitleDef, TitleId, TitleSource };
