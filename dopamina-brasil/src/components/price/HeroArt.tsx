import Image from "next/image";
import { BellRing } from "lucide-react";
import VerdictBadge from "./VerdictBadge";
import styles from "../home.module.css";

/**
 * Arte da home para telas largas (monitor e TV), onde o texto sozinho deixa a direita vazia.
 * Foto de um casal acompanhando uma queda de preço no celular (imagem gerada por IA, sem
 * marcas nem textos) com dois cartões do site por cima: o histórico em degraus e o aviso de meta.
 * Sem produto nem preços reais; a legenda diz que a imagem é gerada por IA.
 * Decorativa: o texto ao lado já diz tudo, por isso fica escondida de leitores de tela.
 */
const W = 520;
const H = 150;
// Degraus do preço: estável, pequenas oscilações e uma queda real até o menor preço.
const STEPS: [number, number][] = [[0, 50], [60, 46], [110, 54], [170, 40], [230, 44], [290, 58], [340, 52], [372, 104], [W, 104]];
const path = STEPS.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `H${x} V${y}`)).join(" ");
const TYPICAL = 62;

export default function HeroArt() {
  return <div className={styles.visual} aria-hidden="true">
    <Image src="/hero-casal.webp" alt="" fill sizes="(min-width: 1100px) 45vw, 0px" className={styles.visualPhoto} />
    <span className={styles.visualShade} />

    <article className={styles.visualMain}>
      <div className={styles.visualTop}>
        <span className={styles.kicker}>Histórico · 40 dias</span>
        <VerdictBadge tone="good" label="Desconto real" />
      </div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className={styles.visualChart}>
        <path d={`${path} V${H} H0 Z`} style={{ fill: "var(--good)" }} fillOpacity="0.08" />
        <line x1="0" x2={W} y1={TYPICAL} y2={TYPICAL} stroke="#8b9087" strokeWidth="1.5" strokeDasharray="5 5" />
        <text x="6" y={TYPICAL + 20} className={styles.chartLabel}>preço típico</text>
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx={W - 14} cy="104" r="8" style={{ fill: "var(--good)", stroke: "var(--surface)" }} strokeWidth="3" />
        <text x={W - 14} y="86" textAnchor="end" className={styles.chartLabelStrong} style={{ fill: "var(--good)" }}>menor preço</text>
        <text x={W - 14} y={H + 18} textAnchor="end" className={styles.chartLabel}>hoje</text>
      </svg>
    </article>

    <article className={styles.visualAlert}>
      <span className={styles.visualBell}><BellRing size={18} strokeWidth={2} /></span>
      <div>
        <strong>Chegou na sua meta</strong>
        <span>Aviso de preço no celular</span>
      </div>
    </article>

    <span className={styles.visualCaption}>Imagem ilustrativa gerada por IA</span>
  </div>;
}
