"use client";

import { useState } from "react";
import { usePwa } from "./usePwa";
import { promptInstall, type DeviceBrowser, type DeviceOs } from "@/lib/pwa-client";
import { installGuide, type GuideIcon } from "@/lib/install-guide";
import styles from "./pwa.module.css";

const ICONS: Record<GuideIcon, React.ReactNode> = {
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></svg>,
  "dots-h": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>,
  "dots-v": <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  install: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M12 7v7m-3-3 3 3 3-3" /></svg>,
  toggle: <svg width="22" height="18" viewBox="0 0 30 18" fill="none"><rect x="1" y="1" width="28" height="16" rx="8" fill="#34c759" /><circle cx="21" cy="9" r="6" fill="#fff" /></svg>,
};

const OTHERS: { key: string; label: string; os: DeviceOs; browser: DeviceBrowser; safariNew: boolean }[] = [
  { key: "ios26", label: "iPhone (iOS 26)", os: "ios", browser: "safari", safariNew: true },
  { key: "ios", label: "iPhone (iOS 18 ou anterior)", os: "ios", browser: "safari", safariNew: false },
  { key: "android", label: "Android · Chrome", os: "android", browser: "chrome", safariNew: false },
  { key: "samsung", label: "Samsung Internet", os: "android", browser: "samsung", safariNew: false },
];

/** Passo a passo de instalação para o sistema e o navegador detectados, com opção de ver os outros. */
export default function InstallSteps() {
  const pwa = usePwa();
  const [override, setOverride] = useState<string | null>(null);
  const chosen = OTHERS.find(o => o.key === override);
  const guide = chosen ? installGuide(chosen.os, chosen.browser, chosen.safariNew) : installGuide(pwa.os, pwa.browser, pwa.safariNew);
  const canOneTap = !chosen && pwa.canPromptInstall && !pwa.standalone;

  return <div className={styles.guide}>
    <p className={styles.detected}>{chosen ? "Mostrando:" : "Seu aparelho:"} <b>{guide.label}</b></p>
    {canOneTap && <button type="button" className={styles.primary} onClick={() => void promptInstall()}>Instalar agora</button>}
    <ol className={styles.steps}>
      {guide.steps.map((step, i) => <li key={i}>
        <span className={styles.stepNum}>{i + 1}</span>
        <span>{step.text}</span>
        {step.icon && <span className={styles.stepIcon} aria-hidden="true">{ICONS[step.icon]}</span>}
      </li>)}
    </ol>
    {guide.note && <p className={styles.fine}>{guide.note}</p>}
    <details className={styles.others}>
      <summary>Não é o seu aparelho?</summary>
      <div className={styles.otherList}>
        {OTHERS.map(o => <button key={o.key} type="button" className={styles.chip} aria-pressed={override === o.key} onClick={() => setOverride(o.key)}>{o.label}</button>)}
        {override && <button type="button" className={styles.chip} onClick={() => setOverride(null)}>Voltar ao meu</button>}
      </div>
    </details>
  </div>;
}
