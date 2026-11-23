import { BellRing, Check } from "lucide-react";
import VerdictBadge from "./VerdictBadge";
import styles from "../home.module.css";

/**
 * Arte da home para telas largas (monitor e TV), onde o texto sozinho deixa a direita vazia.
 * Ilustração do veredito: mesma linguagem do site (cartões, selos, linha em degraus), sem preços
 * nem produto de verdade. O que ela mostra é a ideia: o preço sobe antes de "cair".
 * Decorativa: o texto ao lado já diz tudo, por isso fica escondida de leitores de tela.
 */
const W = 520;
const H = 150;
// Degraus do preço: estável, pico antes da data, "queda" que só volta ao normal.
const STEPS: [number, number][] = [[0, 112], [70, 106], [118, 114], [170, 62], [232, 62], [262, 32], [330, 32], [356, 118], [440, 118], [W, 112]];
const path = STEPS.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `H${x} V${y}`)).join(" ");
const TYPICAL = 112;

export default function HeroArt() {
  return <div className={styles.visual} aria-hidden="true">
    <span className={styles.visualRing} />
    <span className={`${styles.visualRing} ${styles.visualRing2}`} />

    <article className={styles.visualMain}>
      <div className={styles.visualTop}>
        <span className={styles.kicker}>Histórico · 40 dias</span>
        <VerdictBadge tone="bad" label="Desconto maquiado" />
      </div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className={styles.visualChart}>
        <path d={`${path} V${H} H0 Z`} style={{ fill: "var(--bad)" }} fillOpacity="0.07" />
        <line x1="0" x2={W} y1={TYPICAL} y2={TYPICAL} stroke="#8b9087" strokeWidth="1.5" strokeDasharray="5 5" />
        <text x="6" y={TYPICAL + 22} className={styles.chartLabel}>preço típico</text>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="294" cy="32" r="7" style={{ fill: "var(--bad)", stroke: "var(--surface)" }} strokeWidth="3" />
        <text x="276" y="20" textAnchor="end" className={styles.chartLabelStrong} style={{ fill: "var(--bad)" }}>subiu antes</text>
        <circle cx={W - 14} cy={TYPICAL} r="8" fill="#2854ec" style={{ stroke: "var(--surface)" }} strokeWidth="3" />
        <text x={W - 14} y={H + 18} textAnchor="end" className={styles.chartLabel}>hoje</text>
      </svg>
      <p className={styles.visualStory}>O preço <strong>subiu nas semanas anteriores</strong> e agora “caiu” para o valor normal. <strong>Não é promoção.</strong></p>
    </article>

    <article className={styles.visualAlert}>
      <span className={styles.visualBell}><BellRing size={18} strokeWidth={2} /></span>
      <div>
        <strong>Chegou na sua meta</strong>
        <span>Aviso de preço no celular</span>
      </div>
    </article>

    <article className={styles.visualVerdicts}>
      <span className={styles.kicker}>Veredito honesto</span>
      <div className={styles.visualBadges}>
        <VerdictBadge tone="good" label="Desconto real" />
        <VerdictBadge tone="neutral" label="Preço comum" />
        <VerdictBadge tone="warn" label="Acima do normal" />
      </div>
      <span className={styles.visualFine}><Check size={14} color="var(--good)" strokeWidth={2.4} />Nenhum veredito pago</span>
    </article>

    <span className={styles.visualCaption}>Ilustração do veredito</span>
  </div>;
}
