"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { subscribePwa } from "@/lib/pwa-client";
import { parseList } from "@/lib/my-list";
import { readListRaw, removeFromList, saveToList } from "@/lib/my-list-client";
import { trackEvent } from "@/lib/tracking";
import styles from "./list.module.css";

type Props = { path: string; name: string; price: number | null; image?: string };

/** Salvar na Minha lista: um toque, sem cadastro e sem pedir permissão. */
export default function SaveButton({ path, name, price, image }: Props) {
  const raw = useSyncExternalStore(subscribePwa, readListRaw, () => null);
  const saved = useMemo(() => parseList(raw).some(x => x.path === path), [raw, path]);
  if (!price) return null;

  function toggle() {
    if (saved) removeFromList(path);
    else saveToList({ path, name, price: price!, image });
    trackEvent("tracking_update", name, price ?? undefined, { action: saved ? "list_remove" : "list_save", path });
  }

  return <button type="button" className={saved ? styles.saveOn : styles.save} onClick={toggle} aria-pressed={saved}>
    <Heart size={18} aria-hidden="true" fill={saved ? "currentColor" : "none"} />
    {saved ? "Na sua lista" : "Salvar"}
  </button>;
}
