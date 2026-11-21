"use client";

import { readLocal, writeLocal } from "./pwa-client";
import { LIST_KEY, parseList, withItem, withoutItem, type SavedItem } from "./my-list";

export const readListRaw = () => readLocal(LIST_KEY);

export function saveToList(item: Omit<SavedItem, "savedAt"> & { savedAt?: string }) {
  if (!(item.price > 0)) return;
  const list = parseList(readLocal(LIST_KEY));
  writeLocal(LIST_KEY, JSON.stringify(withItem(list, { ...item, savedAt: item.savedAt ?? new Date().toISOString() })));
}

export function removeFromList(path: string) {
  writeLocal(LIST_KEY, JSON.stringify(withoutItem(parseList(readLocal(LIST_KEY)), path)));
}
