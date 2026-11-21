"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Clock, X } from "lucide-react";
import { subscribePwa } from "@/lib/pwa-client";
import { clearRecent, parseRecent, readRecentRaw } from "@/lib/recent-searches";
import styles from "../bf.module.css";

/** Buscas recentes deste aparelho, para repetir com um toque. */
export default function RecentSearches() {
  const raw = useSyncExternalStore(subscribePwa, readRecentRaw, () => null);
  const list = useMemo(() => parseRecent(raw), [raw]);
  if (!list.length) return null;
  return <section className={styles.recent} aria-labelledby="recentes-title">
    <div className={styles.recentHead}>
      <h2 id="recentes-title">Buscas recentes</h2>
      <button type="button" onClick={clearRecent}><X size={15} aria-hidden="true" /> Limpar</button>
    </div>
    <ul>
      {list.map(q => <li key={q}><Link href={`/busca?q=${encodeURIComponent(q)}`}><Clock size={16} aria-hidden="true" />{q}</Link></li>)}
    </ul>
    <p className={styles.recentNote}>Guardadas só neste aparelho.</p>
  </section>;
}
