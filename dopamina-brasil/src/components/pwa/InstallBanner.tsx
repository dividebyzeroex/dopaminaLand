"use client";

import { useRef, useSyncExternalStore } from "react";
import { BellRing, X } from "lucide-react";
import { usePwa } from "./usePwa";
import Link from "next/link";
import InstallSteps from "./InstallSteps";
import { promptInstall, readLocal, subscribePwa, writeLocal } from "@/lib/pwa-client";
import { trackEvent } from "@/lib/tracking";
import styles from "./pwa.module.css";

const KEY = "dopamina:install-banner";
const SNOOZE_DAYS = 14;

/**
 * Convite para instalar o app, no fluxo da página (nunca fixo por cima do conteúdo).
 * Aparece no momento de valor, logo abaixo do veredito, só no celular e fora do app.
 * Some por 14 dias ao fechar.
 */
export default function InstallBanner() {
  const pwa = usePwa();
  const dialog = useRef<HTMLDialogElement>(null);
  // Escondido até ler o adiamento salvo (no servidor, sempre escondido).
  const hidden = useSyncExternalStore(subscribePwa, () => Date.now() < Number(readLocal(KEY) || 0), () => true);

  if (hidden || !pwa.mobile || pwa.standalone) return null;

  function dismiss() {
    writeLocal(KEY, String(Date.now() + SNOOZE_DAYS * 86400000));
    trackEvent("tracking_update", undefined, undefined, { action: "install_banner_dismiss" });
  }

  async function install() {
    trackEvent("tracking_update", undefined, undefined, { action: "install_banner_click", ios: pwa.ios });
    // Android com convite nativo: instala direto. Senão, mostra o passo a passo.
    if (!pwa.ios && pwa.canPromptInstall) await promptInstall();
    else dialog.current?.showModal();
  }

  return <>
    <aside className={styles.banner} aria-label="Instalar o app">
      <span className={styles.bannerIcon} aria-hidden="true"><BellRing size={20} /></span>
      <p><b>Saiba quando este preço cair.</b> Com o Dopamina na tela inicial, o aviso chega como notificação.</p>
      <button type="button" className={styles.bannerCta} onClick={() => void install()}>Instalar</button>
      <button type="button" className={styles.bannerClose} onClick={dismiss} aria-label="Agora não"><X size={18} /></button>
    </aside>
    <dialog ref={dialog} className={styles.sheet} aria-labelledby="install-title" onClick={e => { if (e.target === dialog.current) dialog.current?.close(); }}>
      <div className={styles.sheetInner}>
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fechar"><X size={18} /></button>
        <span className={styles.kicker}>App Dopamina</span>
        <h2 id="install-title" className={styles.sheetTitle}>Instale em poucos toques</h2>
        <p className={styles.sheetText}>Com o app na tela inicial, você recebe notificação quando um preço que acompanha cair, subir ou estabilizar.</p>
        <InstallSteps />
        <Link href="/instalar" className={styles.fine}>Abrir o guia completo</Link>
      </div>
    </dialog>
  </>;
}
