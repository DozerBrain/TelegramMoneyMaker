// src/lib/storageTitles.ts
import { loadSave, saveSave } from "./storageCore";
import { DEFAULT_TITLE_STATE, type TitleState } from "./titleLogic";

// 🔥 TITLES (helpers)
export function getTitleState(): TitleState {
  const s = loadSave();
  return s.titleState ?? DEFAULT_TITLE_STATE;
}

export function updateTitleState(updater: (prev: TitleState) => TitleState) {
  const prevSave = loadSave();
  const nextTitleState = updater(prevSave.titleState ?? DEFAULT_TITLE_STATE);
  saveSave({ titleState: nextTitleState });
}
