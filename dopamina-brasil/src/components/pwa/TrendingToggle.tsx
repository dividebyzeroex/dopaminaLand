"use client";

import { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";
import { usePwa } from "./usePwa";
import InstallSteps from "./InstallSteps";
import { getTrendingPreference, serverPushConfigured, setTrendingPreference } from "@/lib/pwa-client";
import { trackEvent } from "@/lib/tracking";
import styles from "./pwa.module.css";

/**
 * Liga/desliga os destaques de queda dos produtos mais buscados neste aparelho.
 * Funciona também para quem ainda não tem alerta de nenhum produto.
 */
export default function TrendingToggle() {
  const pwa = usePwa();
  const [on, setOn] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    getTrendingPreference()
      .then(value => { if (alive) { setOn(value); setLoaded(true); } })
      .catch(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  async function change(next: boolean) {
    setBusy(true); setNote("");
    const result = await setTrendingPreference(next);
    if (result.ok) {
      setOn(next);
      setNote(next ? "Pronto: avisamos quando um dos mais buscados baixar de verdade." : "Destaques desligados neste aparelho.");
      trackEvent("tracking_update", undefined, undefined, { action: next ? "trending_on" : "trending_off", standalone: pwa.standalone });
    } else setNote(result.error ?? "Não foi possível salvar agora.");
    setBusy(false);
  }

  if (!serverPushConfigured) return null;
  const needsIosInstall = pwa.ios && !pwa.standalone;

  return <section className={styles.alertRow} aria-labelledby="destaques-title">
    <div>
      <p id="destaques-title" className={styles.alertName} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingDown size={18} aria-hidden="true" /> Quedas nos produtos mais buscados
      </p>
      <p className={styles.fine}>
        Além dos seus alertas, avisamos quando um dos produtos que mais gente procura no Dopamina tem desconto real
        (nunca desconto maquiado). No máximo 1 aviso por dia, em horário comercial.
        {loaded && on === true ? " Ativo neste aparelho." : ""}{note ? ` ${note}` : ""}
      </p>
      {needsIosInstall && on !== true && <><p className={styles.fine}>No iPhone, instale o app antes:</p><InstallSteps /></>}
    </div>
    {loaded && !needsIosInstall && <button type="button" className={on ? styles.secondary : styles.primary} disabled={busy} onClick={() => void change(!on)}>
      {busy ? "Salvando…" : on ? "Desligar" : "Receber destaques"}
    </button>}
  </section>;
}
