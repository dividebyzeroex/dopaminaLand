"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { refreshProductPrice } from "@/app/produto/actions";
import styles from "../bf.module.css";

const REFRESH_AFTER_MIN = 20;

// Relógio compartilhado: atualiza o "há X min" a cada 30 s sem um timer por componente.
let now = 0;
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(fn: () => void) {
  subs.add(fn);
  if (!timer) { now = Date.now(); timer = setInterval(() => { now = Date.now(); subs.forEach(f => f()); }, 30_000); }
  return () => { subs.delete(fn); if (!subs.size && timer) { clearInterval(timer); timer = null; } };
}
const getNow = () => now || Date.now();

function ago(minutes: number) {
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `há ${h} h${minutes % 60 ? ` ${minutes % 60} min` : ""}`;
}

/**
 * Quando o preço foi checado, perto do botão de compra. Com mais de 20 min,
 * oferece "Atualizar" (preços mudam várias vezes por dia em datas como a Black Friday).
 */
export default function PriceFreshness({ path, checkedAt, compact = false }: { path: string; checkedAt: string; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  // No servidor mostra o horário absoluto; no navegador, o tempo relativo.
  const current = useSyncExternalStore(subscribe, getNow, () => 0);
  const checked = Date.parse(checkedAt);
  const minutes = current ? Math.max(0, Math.floor((current - checked) / 60_000)) : null;
  const time = new Date(checked).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  const stale = minutes !== null && minutes >= REFRESH_AFTER_MIN;

  function refresh() {
    setNote("");
    start(async () => {
      const result = await refreshProductPrice(path).catch(() => ({ ok: false as const, reason: "limit" as const }));
      if (result.ok) router.refresh();
      else setNote(result.reason === "recent" ? "Já está atualizado." : "Tente de novo em alguns minutos.");
    });
  }

  return <p className={compact ? styles.freshCompact : styles.fresh} aria-live="polite">
    <span>Preço checado {minutes === null ? `às ${time}` : ago(minutes)}</span>
    {stale && <button type="button" onClick={refresh} disabled={pending}><RefreshCw size={14} aria-hidden="true" className={pending ? styles.spinning : undefined} />{pending ? "Atualizando…" : "Atualizar"}</button>}
    {note && <span>{note}</span>}
  </p>;
}
