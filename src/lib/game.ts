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
  type SaveData,
} from "./storage";

// --- pass-through re-exports ---
export const getTap = _getTap;
export const setTap = _setTap;
export const getCollection = _getCollection;
export const setCollection = _setCollection;
export const getLastDrop = _getLastDrop;
export const setLastDrop = _setLastDrop;

// --- custom stat helpers (adds new optional fields safely) ---
export function getTotalEarnings(): number {
  const data = loadSave() as SaveData & { totalEarnings?: number };
  return data.totalEarnings ?? 0;
}

export function setTotalEarnings(v: number) {
  const data = loadSave() as SaveData & { totalEarnings?: number };
  data.totalEarnings = Math.max(0, Math.floor(v));
  saveSave(data);
}

export function getAutoPerSec(): number {
  const data = loadSave() as SaveData & { autoPerSec?: number };
  return data.autoPerSec ?? 0;
}

export function setAutoPerSec(v: number) {
  const data = loadSave() as SaveData & { autoPerSec?: number };
  data.autoPerSec = Math.max(0, Math.floor(v));
  saveSave(data);
}
