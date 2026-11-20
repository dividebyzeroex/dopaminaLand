"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, X } from "lucide-react";
import { usePwa } from "./usePwa";
import InstallSteps from "./InstallSteps";
import { ensurePushSubscription, promptInstall, rememberWatched, subscribePwa, watchedPaths } from "@/lib/pwa-client";
import { trackEvent } from "@/lib/tracking";
import styles from "./pwa.module.css";

type Props = { path: string; name: string; price: number | null };
type Step = "choose" | "install-ios" | "saving" | "done" | "denied" | "error";

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

/** "Avisar quando o preço mudar": escolhe o tipo de alerta, pede permissão e salva. */
export default function AlertButton({ path, name, price }: Props) {
  const pwa = usePwa();
  const dialog = useRef<HTMLDialogElement>(null);
  const active = useSyncExternalStore(subscribePwa, () => watchedPaths().includes(path), () => false);
  const [step, setStep] = useState<Step>("choose");
  const [message, setMessage] = useState("");
  const [kinds, setKinds] = useState({ drop: true, stable: true, rise: false });

  // iPhone fora da tela inicial não recebe push: o primeiro passo é instalar.
  const needsIosInstall = pwa.ios && !pwa.standalone;

  function open() {
    setStep(needsIosInstall ? "install-ios" : "choose");
    setMessage("");
    dialog.current?.showModal();
    trackEvent("tracking_update", name, price ?? undefined, { action: "alert_open", path, standalone: pwa.standalone });
  }

  async function save() {
    setStep("saving");
    const result = await ensurePushSubscription();
    if ("error" in result) {
      if (result.error === "denied") { setStep("denied"); return; }
      setMessage(result.error === "no-key" ? "Os alertas ainda não estão ativos. Volte em breve." : "Este navegador não aceita notificações. Instale o app ou tente pelo Chrome.");
      setStep("error");
      return;
    }
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: result.subscription.toJSON(), path, kinds }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok || !data?.ok) {
      setMessage(data?.error ?? "Não foi possível salvar o alerta agora.");
      setStep("error");
      return;
    }
    rememberWatched(path, true);
    setStep("done");
    trackEvent("tracking_update", name, price ?? undefined, { action: "alert_created", path, kinds, standalone: pwa.standalone });
  }

  const toggle = (key: keyof typeof kinds) => setKinds(k => ({ ...k, [key]: !k[key] }));
  const none = !kinds.drop && !kinds.stable && !kinds.rise;

  return <>
    <button type="button" className={active ? styles.alertOn : styles.alertBtn} onClick={open}>
      {active ? <><BellRing size={17} aria-hidden="true" /> Alerta ativo</> : <><Bell size={17} aria-hidden="true" /> Avisar quando o preço mudar</>}
    </button>

    <dialog ref={dialog} className={styles.sheet} aria-labelledby="alert-title" onClick={e => { if (e.target === dialog.current) dialog.current?.close(); }}>
      <div className={styles.sheetInner}>
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fechar"><X size={18} /></button>

        {step === "install-ios" && <>
          <span className={styles.kicker}>Primeiro passo</span>
          <h2 id="alert-title" className={styles.sheetTitle}>Coloque o Dopamina na tela inicial</h2>
          <p className={styles.sheetText}>No iPhone, os alertas de preço chegam como notificação só com o app na tela inicial. Leva 10 segundos:</p>
          <InstallSteps />
        </>}

        {(step === "choose" || step === "saving") && <>
          <span className={styles.kicker}>Alerta de preço</span>
          <h2 id="alert-title" className={styles.sheetTitle}>Avisar sobre {name.length > 50 ? `${name.slice(0, 48)}…` : name}</h2>
          {price && <p className={styles.sheetText}>Hoje: <b>{brl(price)}</b>. Você recebe uma notificação no celular quando:</p>}
          <fieldset className={styles.options}>
            <legend className="sr-only">Tipos de alerta</legend>
            <label className={styles.option}><input type="checkbox" checked={kinds.drop} onChange={() => toggle("drop")} /><span><b>Baixar de preço</b><small>Queda de 3% ou mais</small></span></label>
            <label className={styles.option}><input type="checkbox" checked={kinds.stable} onChange={() => toggle("stable")} /><span><b>Estabilizar</b><small>Uma semana sem mudar: sem queda à vista</small></span></label>
            <label className={styles.option}><input type="checkbox" checked={kinds.rise} onChange={() => toggle("rise")} /><span><b>Subir de preço</b><small>Alta de 3% ou mais</small></span></label>
          </fieldset>
          {pwa.canPromptInstall && !pwa.standalone && <button type="button" className={styles.secondary} onClick={() => void promptInstall()}>Instalar o app para receber mais rápido</button>}
          <button type="button" className={styles.primary} disabled={none || step === "saving"} onClick={() => void save()}>
            {step === "saving" ? "Ativando…" : "Ativar alerta"}
          </button>
          <p className={styles.fine}>Sem cadastro e sem e-mail. Você desativa quando quiser em <Link href="/alertas">Meus alertas</Link>.</p>
        </>}

        {step === "done" && <>
          <span className={styles.ok}><Check size={22} aria-hidden="true" /></span>
          <h2 id="alert-title" className={styles.sheetTitle}>Alerta ativado</h2>
          <p className={styles.sheetText}>Checamos o preço todos os dias. Você vai receber uma notificação de confirmação agora.</p>
          <Link className={styles.primary} href="/alertas">Ver meus alertas</Link>
        </>}

        {step === "denied" && <>
          <h2 id="alert-title" className={styles.sheetTitle}>As notificações estão bloqueadas</h2>
          <p className={styles.sheetText}>Para receber o alerta, permita notificações do Dopamina nos ajustes do {pwa.ios ? "iPhone (Ajustes › Notificações › Dopamina)" : "navegador (ícone de cadeado ao lado do endereço › Notificações)"} e tente de novo.</p>
          <button type="button" className={styles.primary} onClick={() => setStep("choose")}>Tentar de novo</button>
        </>}

        {step === "error" && <>
          <h2 id="alert-title" className={styles.sheetTitle}>Não deu certo desta vez</h2>
          <p className={styles.sheetText}>{message}</p>
          <button type="button" className={styles.primary} onClick={() => setStep("choose")}>Voltar</button>
        </>}
      </div>
    </dialog>
  </>;
}
