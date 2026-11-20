"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellOff, RefreshCw } from "lucide-react";
import { usePwa } from "./usePwa";
import InstallSteps from "./InstallSteps";
import TrendingToggle from "./TrendingToggle";
import { checkNow, listLocalWatches, removeLocalWatch, type LocalWatch } from "@/lib/pwa-client";
import styles from "./pwa.module.css";

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Alertas guardados neste aparelho (IndexedDB, via service worker). */
export default function MyAlerts() {
  const pwa = usePwa();
  const [watches, setWatches] = useState<LocalWatch[] | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function load() {
    try {
      const data = await listLocalWatches();
      setWatches(data.watches.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLastCheck(data.lastCheck);
    } catch {
      setWatches([]);
    }
  }

  useEffect(() => {
    let alive = true;
    listLocalWatches()
      .then(data => { if (alive) { setWatches(data.watches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); setLastCheck(data.lastCheck); } })
      .catch(() => { if (alive) setWatches([]); });
    return () => { alive = false; };
  }, []);

  async function refresh() {
    setBusy(true); setNote("");
    try {
      const { report } = await checkNow();
      setNote(report.notified ? `${report.notified} ${report.notified === 1 ? "aviso enviado" : "avisos enviados"}.` : "Nenhuma mudança relevante desde a última checagem.");
    } catch { setNote("Não foi possível checar agora."); }
    await load();
    setBusy(false);
  }

  async function remove(path: string) {
    await removeLocalWatch(path).catch(() => undefined);
    setWatches(list => list?.filter(w => w.path !== path) ?? null);
  }

  if (watches === null) return <p className={styles.sheetText} role="status">Carregando seus alertas…</p>;

  return <div className={styles.myAlerts}>
    <TrendingToggle />
    {watches.length === 0 && <div className={styles.empty}>
      <BellOff size={28} aria-hidden="true" />
      <p className={styles.sheetText}>Nenhum alerta neste aparelho ainda. Abra um produto e toque em <b>Avisar quando o preço mudar</b>.</p>
      {pwa.ios && !pwa.standalone && <><p className={styles.sheetText}>No iPhone, instale o app antes:</p><InstallSteps /></>}
      <Link className={styles.primary} href="/">Buscar um produto</Link>
    </div>}

    {watches.length > 0 && <div className={styles.alertRow}>
      <p className={styles.fine}>{lastCheck ? `Última checagem: ${when(lastCheck)}.` : "Ainda não checamos."} O app checa ao ser aberto{pwa.standalone && !pwa.ios ? " e em segundo plano" : ""}.{note ? ` ${note}` : ""}</p>
      <button type="button" className={styles.secondary} onClick={() => void refresh()} disabled={busy}><RefreshCw size={16} aria-hidden="true" style={{ marginRight: 8 }} />{busy ? "Checando…" : "Checar agora"}</button>
    </div>}

    {watches.map(w => {
      const kinds = [w.notifyDrop && "baixar", w.notifyStable && "estabilizar", w.notifyRise && "subir"].filter(Boolean).join(", ");
      const now = w.currentPrice ?? w.lastPrice;
      const change = w.basePrice ? (now - w.basePrice) / w.basePrice : 0;
      return <article key={w.path} className={styles.alertRow}>
        <div>
          <Link href={`/produto/${w.path}`} className={styles.alertName}>{w.name}</Link>
          <p className={styles.fine}>{w.serverPush ? "Checado de hora em hora, com o app fechado. " : ""}Avisa ao {kinds}. Quando criou: {brl(w.basePrice)} · agora: {brl(now)}{Math.abs(change) >= 0.005 ? ` (${change > 0 ? "+" : "−"}${Math.abs(change * 100).toFixed(1).replace(".", ",")}%)` : ""}</p>
        </div>
        <button type="button" className={styles.secondary} onClick={() => void remove(w.path)}>Remover</button>
      </article>;
    })}
  </div>;
}
