import styles from "./pwa.module.css";

function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>;
}
function PlusBoxIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></svg>;
}

function DotsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>;
}

/** Android sem o botão automático de instalar (Samsung Internet, Firefox, Chrome antes do convite). */
export function AndroidSteps() {
  return <ol className={styles.steps}>
    <li><span className={styles.stepNum}>1</span><span>Toque no menu <DotsIcon /> do navegador.</span></li>
    <li><span className={styles.stepNum}>2</span><span>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</span></li>
    <li><span className={styles.stepNum}>3</span><span>Abra o <b>Dopamina</b> pelo ícone.</span></li>
  </ol>;
}

/** Passo a passo do iPhone/iPad: no iOS, push só funciona com o app na tela inicial. */
export default function InstallSteps() {
  return <ol className={styles.steps}>
    <li><span className={styles.stepNum}>1</span><span>Toque em <b>Compartilhar</b> <ShareIcon /> na barra do Safari.</span></li>
    <li><span className={styles.stepNum}>2</span><span>Escolha <b>Adicionar à Tela de Início</b> <PlusBoxIcon />.</span></li>
    <li><span className={styles.stepNum}>3</span><span>Abra o <b>Dopamina</b> pelo ícone e crie o alerta de novo.</span></li>
  </ol>;
}
