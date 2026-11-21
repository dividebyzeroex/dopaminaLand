"use client";

import { readLocal, writeLocal } from "./pwa-client";

/** Buscas recentes: ficam só neste aparelho (localStorage), nunca vão ao servidor. */
const KEY = "dopamina:buscas-recentes";
const MAX = 8;

export function parseRecent(raw: string | null): string[] {
  try {
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch { return []; }
}

export const readRecentRaw = () => readLocal(KEY);

export function addRecent(query: string) {
  const clean = query.trim().slice(0, 80);
  if (clean.length < 2 || /^https?:\/\//i.test(clean)) return;
  const list = parseRecent(readLocal(KEY)).filter(q => q.toLowerCase() !== clean.toLowerCase());
  writeLocal(KEY, JSON.stringify([clean, ...list].slice(0, MAX)));
}

export function clearRecent() {
  writeLocal(KEY, "[]");
}
