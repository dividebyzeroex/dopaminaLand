"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, X } from "lucide-react";
import { usePwa } from "./usePwa";
import InstallSteps from "./InstallSteps";
import { enableBackgroundCheck, ensureNotificationPermission, localNotification, promptInstall, registerServerAlert, saveLocalWatch, subscribePwa, watchedPaths } from "@/lib/pwa-client";
import { trackEvent } from "@/lib/tracking";
import { saveToList } from "@/lib/my-list-client";
import styles from "./pwa.module.css";

type Props = { path: string; name: string; price: number | null; image?: string; /** Rótulo curto, para a barra fixa do celular. */ compact?: boolean };
type Step = "choose" | "install-ios" | "saving" | "done" | "denied" | "error";

/** "4.100,50", "4100,50", "4100.50" e "4100" → número. */
function parseBrl(text: string): number {
  const t = text.trim();
  if (t.includes(",")) return Number(t.replace(/\./g, "").replace(",", "."));
  if (/\.\d{1,2}$/.test(t)) return Number(t);
  return Number(t.replace(/\./g, ""));
}

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

/** "Avisar quando o preço mudar": escolhe o tipo de alerta, pede permissão e salva. */
export default function AlertButton({ path, name, price, image, compact }: Props) {
  const titleId = useId();
  const pwa = usePwa();
  const dialog = useRef<HTMLDialogElement>(null);
  const active = useSyncExternalStore(subscribePwa, () => watchedPaths().includes(path), () => false);
  const [step, setStep] = useState<Step>("choose");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"push" | "background" | "open">("open");
  const [kinds, setKinds] = useState({ drop: true, stable: true, rise: false });
  // Preço-alvo: sugestão inicial 10% abaixo do preço de agora, arredondada.
  const [useTarget, setUseTarget] = useState(false);
  const [targetText, setTargetText] = useState(price ? String(Math.floor((price * 0.9) / 10) * 10) : "");
  const target = useTarget ? parseBrl(targetText) : null;
  const targetInvalid = useTarget && (!target || !Number.isFinite(target) || target <= 0 || (price !== null && target >= price));
  // Destaques de queda dos mais buscados (no máximo 1 aviso por dia).
  const [trending, setTrending] = useState(true);

  // iPhone fora da tela inicial não recebe push: o primeiro passo é instalar.
  const needsIosInstall = pwa.ios && !pwa.standalone;

  function open() {
    setStep(needsIosInstall ? "install-ios" : "choose");
    setMessage("");
    dialog.current?.showModal();
    trackEvent("tracking_update", name, price ?? undefined, { action: "alert_open", path, standalone: pwa.standalone });
  }

  async function save() {
    if (!price) { setMessage("Não conseguimos ler o preço deste produto agora."); setStep("error"); return; }
    setStep("saving");
    const permission = await ensureNotificationPermission();
    if (permission === "denied" || permission === "default") { setStep("denied"); return; }
    if (permission === "unsupported") { setMessage("Este navegador não mostra notificações. Instale o app pelo Chrome ou Safari."); setStep("error"); return; }
    // 1º servidor (avisos de hora em hora com o app fechado); se não der, fica a checagem local.
    const serverPush = await registerServerAlert({ path, kinds, trending });
    const saved = await saveLocalWatch({ path, name, price, kinds, serverPush }).catch(() => false);
    if (!saved) { setMessage("Não foi possível salvar o alerta neste aparelho."); setStep("error"); return; }
    // Alertar também salva na Minha lista (um gesto só).
    saveToList({ path, name, price, image });
    const background = serverPush ? false : await enableBackgroundCheck();
    setMode(serverPush ? "push" : background ? "background" : "open");
    await localNotification(serverPush ? "Alerta por push ativado ✓" : "Alerta local ativado ✓", serverPush ? `Vamos avisar quando ${name.slice(0, 60)} mudar de preço.` : "Abra o Dopamina para atualizar o preço. Avisos com o app fechado não estão garantidos.", `/produto/${path}`).catch(() => undefined);
    setStep("done");
    trackEvent("tracking_update", name, price ?? undefined, { action: "alert_created", path, kinds, trending: serverPush ? trending : false, standalone: pwa.standalone });
  }

  const toggle = (key: keyof typeof kinds) => setKinds(k => ({ ...k, [key]: !k[key] }));
  const none = !kinds.drop && !kinds.stable && !kinds.rise && !useTarget;

  return <>
    <button type="button" className={`${active ? styles.alertOn : styles.alertBtn}${compact ? ` ${styles.alertCompact}` : ""}`} onClick={open}>
      {active ? <><BellRing size={17} aria-hidden="true" /> Alerta ativo</> : <><Bell size={17} aria-hidden="true" /> {compact ? "Avisar se baixar" : "Avisar quando o preço mudar"}</>}
    </button>

    <dialog ref={dialog} className={styles.sheet} aria-labelledby={titleId} onClick={e => { if (e.target === dialog.current) dialog.current?.close(); }}>
      {/* Fora da área que rola: o X nunca sai da tela. */}
      <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fechar"><X size={18} /></button>
      <div className={styles.sheetInner}>

        {step === "install-ios" && <>
          <span className={styles.kicker}>Primeiro passo</span>
          <h2 id={titleId} className={styles.sheetTitle}>Coloque o Dopamina na tela inicial</h2>
          <p className={styles.sheetText}>No iPhone, os alertas de preço chegam como notificação só com o app na tela inicial. Leva 10 segundos:</p>
          <InstallSteps />
        </>}

        {(step === "choose" || step === "saving") && <>
          <span className={styles.kicker}>Alerta de preço</span>
          <h2 id={titleId} className={styles.sheetTitle}>Avisar sobre {name.length > 50 ? `${name.slice(0, 48)}…` : name}</h2>
          {price && <p className={styles.sheetText}>Hoje: <b>{brl(price)}</b>. Você recebe uma notificação no celular quando:</p>}
          <fieldset className={styles.options}>
            <legend className="sr-only">Tipos de alerta</legend>
            <label className={styles.option}><input type="checkbox" checked={kinds.drop} onChange={() => toggle("drop")} /><span><b>Baixar de preço</b><small>Queda de 3% ou mais</small></span></label>
            <label className={styles.option}><input type="checkbox" checked={kinds.stable} onChange={() => toggle("stable")} /><span><b>Estabilizar</b><small>Uma semana sem variação relevante</small></span></label>
            <label className={styles.option}><input type="checkbox" checked={kinds.rise} onChange={() => toggle("rise")} /><span><b>Subir de preço</b><small>Alta de 3% ou mais</small></span></label>
            <label className={styles.option}><input type="checkbox" checked={useTarget} onChange={() => setUseTarget(v => !v)} /><span><b>Chegar ao meu preço</b><small>Avisa uma vez quando baixar até o valor que você escolher</small></span></label>
            {useTarget && <label className={styles.target}>
              <span>Avisar quando chegar a</span>
              <span className={styles.targetField}>R$ <input inputMode="decimal" value={targetText} onChange={e => setTargetText(e.target.value.replace(/[^0-9.,]/g, ""))} aria-invalid={targetInvalid} aria-describedby="alvo-ajuda" /></span>
              <small id="alvo-ajuda">{targetInvalid ? "Escolha um valor menor que o preço de agora." : price && target ? `${Math.round((1 - target / price) * 100)}% abaixo do preço de hoje` : ""}</small>
            </label>}
          </fieldset>
          <label className={styles.option} style={{ marginTop: 8 }}><input type="checkbox" checked={trending} onChange={() => setTrending(t => !t)} /><span><b>Quedas nos mais buscados</b><small>Desconto real nos produtos que mais gente procura. No máximo 1 aviso por dia.</small></span></label>
          {pwa.canPromptInstall && !pwa.standalone && <button type="button" className={styles.secondary} onClick={() => void promptInstall()}>Instalar o app para receber mais rápido</button>}
          <p className={styles.fine}>Sem cadastro e sem e-mail: o alerta fica neste aparelho e, quando o push está disponível, também no servidor. Você desativa quando quiser em <Link href="/alertas">Meus alertas</Link>.</p>
          <div className={styles.actionBar}>
            <button type="button" className={styles.primary} disabled={none || targetInvalid || step === "saving"} onClick={() => void save()}>
              {step === "saving" ? "Ativando…" : "Ativar alerta"}
            </button>
          </div>
        </>}

        {step === "done" && <>
          <span className={styles.ok}><Check size={22} aria-hidden="true" /></span>
          <h2 id={titleId} className={styles.sheetTitle}>Alerta ativado</h2>
          <p className={styles.sheetText}>{mode === "push"
            ? `Checamos o preço de hora em hora e avisamos aqui, mesmo com o app fechado.${trending ? " Você também recebe, no máximo uma vez por dia, as quedas reais nos produtos mais buscados." : ""}`
            : mode === "background"
              ? "O app checa o preço em segundo plano, cerca de duas vezes por dia, e avisa você."
              : "O app checa o preço sempre que você abre o Dopamina. Para não perder nada, abra o app de vez em quando."}</p>
          <Link className={styles.primary} href="/alertas">Ver meus alertas</Link>
        </>}

        {step === "denied" && <>
          <h2 id={titleId} className={styles.sheetTitle}>As notificações estão bloqueadas</h2>
          <p className={styles.sheetText}>Para receber o alerta, permita notificações do Dopamina nos ajustes do {pwa.ios ? "iPhone (Ajustes › Notificações › Dopamina)" : "navegador (ícone de cadeado ao lado do endereço › Notificações)"} e tente de novo.</p>
          <button type="button" className={styles.primary} onClick={() => setStep("choose")}>Tentar de novo</button>
        </>}

        {step === "error" && <>
          <h2 id={titleId} className={styles.sheetTitle}>Não deu certo desta vez</h2>
          <p className={styles.sheetText}>{message}</p>
          <button type="button" className={styles.primary} onClick={() => setStep("choose")}>Voltar</button>
        </>}
      </div>
    </dialog>
  </>;
}
