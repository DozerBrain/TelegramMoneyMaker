// src/lib/game.ts
import {
  loadSave,
  saveSave,
  getTap as _getTap,
  setTap as _setTap,
  getCollection as _getCollection,
  setCollection as _setCollection,
  getLastDrop as _getLastDrop,
  setLastDrop as _setLastDrop,
} from "./storage";

// direct pass-through for existing calls in pages/components
export const getTap = _getTap;
export const setTap = _setTap;
export const getCollection = _getCollection;
export const setCollection = _setCollection;
export const getLastDrop = _getLastDrop;
export const setLastDrop = _setLastDrop;

// these were missing but some code references them:
export function getTotalEarnings(): number {
  return loadSave().totalEarnings ?? 0;
}
export function setTotalEarnings(v: number) {
  const s = loadSave();
  s.totalEarnings = Math.max(0, v | 0);
  saveSave(s);
}

export function getAutoPerSec(): number {
  return loadSave().autoPerSec ?? 0;
}
export function setAutoPerSec(v: number) {
  const s = loadSave();
  s.autoPerSec = Math.max(0, v | 0);
  saveSave(s);
}
