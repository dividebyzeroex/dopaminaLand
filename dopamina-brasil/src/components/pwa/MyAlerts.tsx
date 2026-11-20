"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellOff } from "lucide-react";
import { usePwa } from "./usePwa";
import InstallSteps from "./InstallSteps";
import { currentEndpoint, rememberWatched } from "@/lib/pwa-client";
import styles from "./pwa.module.css";

type Alert = { product_path: string; product_name: string | null; notify_drop: boolean; notify_rise: boolean; notify_stable: boolean; base_price: number | null; last_price: number | null };
const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function MyAlerts() {
  const pwa = usePwa();
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const ep = await currentEndpoint().catch(() => null);
      if (!alive) return;
      setEndpoint(ep);
      if (!ep) { setAlerts([]); return; }
      const res = await fetch(`/api/alerts?endpoint=${encodeURIComponent(ep)}`).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (!alive) return;
      if (!res?.ok || !data?.ok) { setError(data?.error ?? "Não foi possível carregar seus alertas."); setAlerts([]); return; }
      setAlerts(data.alerts);
    })();
    return () => { alive = false; };
  }, []);

  async function remove(path: string) {
    if (!endpoint) return;
    await fetch("/api/alerts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint, path }) }).catch(() => null);
    rememberWatched(path, false);
    setAlerts(list => list?.filter(a => a.product_path !== path) ?? null);
  }

  if (alerts === null) return <p className={styles.sheetText} role="status">Carregando seus alertas…</p>;

  return <div className={styles.myAlerts}>
    {error && <p className={styles.sheetText} role="alert">{error}</p>}
    {!error && alerts.length === 0 && <div className={styles.empty}>
      <BellOff size={28} aria-hidden="true" />
      <p className={styles.sheetText}>Nenhum alerta neste aparelho ainda. Abra um produto e toque em <b>Avisar quando o preço mudar</b>.</p>
      {pwa.ios && !pwa.standalone && <><p className={styles.sheetText}>No iPhone, instale o app antes:</p><InstallSteps /></>}
      <Link className={styles.primary} href="/">Buscar um produto</Link>
    </div>}
    {alerts.map(a => {
      const kinds = [a.notify_drop && "baixar", a.notify_stable && "estabilizar", a.notify_rise && "subir"].filter(Boolean).join(", ");
      const change = a.base_price && a.last_price ? (a.last_price - a.base_price) / a.base_price : null;
      return <article key={a.product_path} className={styles.alertRow}>
        <div>
          <Link href={`/produto/${a.product_path}`} className={styles.alertName}>{a.product_name ?? a.product_path}</Link>
          <p className={styles.fine}>Avisa ao {kinds}. {a.base_price ? `Quando criou: ${brl(a.base_price)}` : ""}{a.last_price ? ` · último registrado: ${brl(a.last_price)}` : ""}{change !== null && Math.abs(change) >= 0.005 ? ` (${change > 0 ? "+" : "−"}${Math.abs(change * 100).toFixed(1).replace(".", ",")}%)` : ""}</p>
        </div>
        <button type="button" className={styles.secondary} onClick={() => void remove(a.product_path)}>Remover</button>
      </article>;
    })}
  </div>;
}
