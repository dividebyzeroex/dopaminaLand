"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BellRing, Heart, X } from "lucide-react";
import { listLocalWatches, removeLocalWatch, subscribePwa, watchedPaths, type LocalWatch } from "@/lib/pwa-client";
import { changeSinceSaved, parseList, type SavedItem } from "@/lib/my-list";
import { readListRaw, removeFromList } from "@/lib/my-list-client";
import styles from "./list.module.css";

type Live = { price: number; image: string | null; verdict: { kind: string; tone: "good" | "neutral" | "warn" | "bad"; label: string; decision: string } };

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number) => `${Math.abs(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

/** Junta salvos e alertas (alerta sem item salvo entra com o preço de quando foi criado). */
function merge(saved: SavedItem[], watches: LocalWatch[]): SavedItem[] {
  const byPath = new Map(saved.map(x => [x.path, x]));
  for (const w of watches) if (!byPath.has(w.path)) byPath.set(w.path, { path: w.path, name: w.name, price: w.basePrice, savedAt: w.createdAt });
  return [...byPath.values()].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

async function fetchLive(paths: string[], onItem: (path: string, live: Live | null) => void) {
  let next = 0;
  async function worker() {
    while (next < paths.length) {
      const path = paths[next++];
      try {
        const r = await fetch(`/api/preco?path=${encodeURIComponent(path)}`);
        const data = r.ok ? await r.json() : null;
        onItem(path, data?.ok ? { price: data.price, image: data.image, verdict: data.verdict } : null);
      } catch { onItem(path, null); }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
}

/**
 * Minha lista: o que a pessoa salvou ou acompanha, com o que mudou desde então.
 * compact: versão curta para o Início (só aparece se houver itens).
 */
export default function MyList({ compact = false }: { compact?: boolean }) {
  const raw = useSyncExternalStore(subscribePwa, readListRaw, () => null);
  const alerts = useSyncExternalStore(subscribePwa, () => watchedPaths().join("|"), () => "");
  const saved = useMemo(() => parseList(raw), [raw]);
  const [watches, setWatches] = useState<LocalWatch[] | null>(null);
  const [live, setLive] = useState<Record<string, Live | null>>({});

  useEffect(() => {
    let alive = true;
    // Sem service worker pronto em 4 s, segue só com os salvos.
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("sem resposta")), 4000));
    Promise.race([listLocalWatches(), timeout]).then(d => { if (alive) setWatches(d.watches); }).catch(() => { if (alive) setWatches([]); });
    return () => { alive = false; };
  }, []);

  const items = useMemo(() => merge(saved, watches ?? []), [saved, watches]);
  const key = items.map(x => x.path).join("|");

  useEffect(() => {
    if (!key) return;
    let alive = true;
    void fetchLive(key.split("|"), (path, value) => { if (alive) setLive(prev => ({ ...prev, [path]: value })); });
    return () => { alive = false; };
  }, [key]);

  async function remove(path: string) {
    removeFromList(path);
    if (watches?.some(w => w.path === path)) {
      await removeLocalWatch(path).catch(() => undefined);
      setWatches(list => list?.filter(w => w.path !== path) ?? null);
    }
  }

  if (watches === null && !saved.length) return compact ? null : <p className={styles.status} role="status">Carregando sua lista…</p>;

  if (!items.length) {
    if (compact) return null;
    return <div className={styles.empty}>
      <Heart size={30} aria-hidden="true" />
      <h2>Sua lista está vazia</h2>
      <p>Abra um produto e toque em <b>Salvar</b>. A gente mostra aqui quanto o preço mudou desde então, sem cadastro.</p>
      <Link className={styles.primary} href="/busca">Buscar um produto</Link>
    </div>;
  }

  const enriched = items.map(item => ({ item, now: live[item.path] }));
  const dropped = enriched.filter(({ item, now }) => now && changeSinceSaved(item.price, now.price).kind === "down");
  const shown = compact ? (dropped.length ? dropped : enriched).slice(0, 3) : enriched;
  const alertSet = new Set(alerts.split("|"));

  return <section className={compact ? styles.compact : styles.list} aria-labelledby={compact ? "lista-inicio" : undefined}>
    {compact
      ? <div className={styles.compactHead}><h2 id="lista-inicio">{dropped.length ? "Baixou na sua lista" : "Na sua lista"}</h2><Link href="/lista">Ver tudo ({items.length})</Link></div>
      : <p className={styles.summary} aria-live="polite">{items.length} {items.length === 1 ? "produto" : "produtos"}{dropped.length ? ` · ${dropped.length} ${dropped.length === 1 ? "baixou" : "baixaram"} desde que você salvou` : ""}</p>}
    <ul className={styles.rows}>
      {shown.map(({ item, now }) => {
        const change = now ? changeSinceSaved(item.price, now.price) : null;
        const image = now?.image ?? item.image;
        return <li key={item.path} className={styles.row}>
          <Link href={`/produto/${item.path}`} className={styles.rowLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image ? <img src={image} alt="" loading="lazy" className={styles.thumb} /> : <span className={styles.thumb} aria-hidden="true" />}
            <span className={styles.rowBody}>
              <span className={styles.rowName}>{item.name}</span>
              <span className={styles.rowMeta}>
                {now === undefined ? "Checando o preço…" : now === null ? `Salvo por ${brl(item.price)} em ${day(item.savedAt)} · preço indisponível agora` : <>
                  {brl(item.price)} → <b className={change?.kind === "down" ? styles.down : change?.kind === "up" ? styles.up : undefined}>{brl(now.price)}</b>
                  {change && change.kind !== "same" ? ` · ${change.kind === "down" ? "baixou" : "subiu"} ${pct(change.pct)} desde ${day(item.savedAt)}` : ` · mesmo preço desde ${day(item.savedAt)}`}
                </>}
              </span>
              {now && <span className={`${styles.decision} ${styles[now.verdict.tone]}`}>{alertSet.has(item.path) && <BellRing size={13} aria-label="Alerta ativo" />}{now.verdict.decision}</span>}
            </span>
          </Link>
          {!compact && <button type="button" className={styles.remove} onClick={() => void remove(item.path)} aria-label={`Remover ${item.name} da lista`}><X size={18} /></button>}
        </li>;
      })}
    </ul>
  </section>;
}
