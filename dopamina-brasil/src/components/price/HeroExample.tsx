import Link from "next/link";
import type { ThermometerItem } from "@/lib/featured";
import { brl, brlShort, shortDate } from "@/lib/format";
import { stepGeometry } from "@/lib/series";
import ProductVisual from "../ProductVisual";
import VerdictBadge from "./VerdictBadge";
import { TONE_COLOR } from "./Sparkline";
import styles from "../home.module.css";

const W = 560;
const H = 220;

/** Escolhe o caso que melhor explica o produto: maquiado > desconto real > o primeiro. */
export function pickExample(items: ThermometerItem[]) {
  return items.find(i => i.verdict.kind === "maquiado" && i.verdict.recentPeakDate)
    ?? items.find(i => i.verdict.kind === "menor" || i.verdict.kind === "abaixo")
    ?? items[0];
}

function story(item: ThermometerItem, eventName?: string) {
  const v = item.verdict;
  if (v.kind === "maquiado" && v.recentPeak && v.baseline) {
    const up = Math.round(((v.recentPeak - v.baseline) / v.baseline) * 100);
    return <>O preço <strong>subiu {up}% antes</strong> {eventName ? `de ${eventName}` : "nas últimas semanas"} e agora “caiu” para perto do valor normal. <strong>Não é promoção.</strong></>;
  }
  return <>{v.headline} {v.detail}</>;
}

export default function HeroExample({ item, eventName }: { item: ThermometerItem; eventName?: string }) {
  const { verdict } = item;
  const points = item.history.slice(-40);
  const prices = points.map(p => p.price);
  if (prices.length < 2) return null;
  const { path, area, x, y } = stepGeometry(prices, W, H, 14);
  const last = prices.length - 1;
  const color = TONE_COLOR[verdict.tone];
  const peakIndex = verdict.recentPeakDate ? points.findIndex(p => p.date === verdict.recentPeakDate) : -1;
  const peakLabelLeft = peakIndex >= 0 && x(peakIndex) > W * 0.55;

  return <article className={styles.example} aria-label={`Exemplo de veredito: ${item.name}`}>
    <div className={styles.exampleTop}>
      <span className={styles.kicker}>Exemplo real · hoje</span>
      <VerdictBadge tone={verdict.tone} label={verdict.label} />
    </div>
    <div className={styles.exampleProduct}>
      <div className={styles.exampleThumb}><ProductVisual src={item.image} name={item.name} /></div>
      <div style={{ minWidth: 0 }}>
        <div className={styles.exampleName}>{item.name}</div>
        <div className={styles.examplePrice}>{brl(verdict.current)}</div>
      </div>
    </div>
    <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" className={styles.exampleChart}
      aria-label={`Histórico de ${points.length} dias. Preço típico ${verdict.median ? brl(verdict.median) : "indisponível"}. Hoje ${brl(verdict.current)}.`}>
      <path d={area} fill={color} fillOpacity="0.07" />
      {verdict.median && <line x1={14} x2={W - 14} y1={y(verdict.median)} y2={y(verdict.median)} stroke="#8b9087" strokeWidth="1.5" strokeDasharray="5 5" />}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {peakIndex >= 0 && verdict.recentPeak && <g>
        <circle cx={x(peakIndex)} cy={y(verdict.recentPeak)} r="6" style={{ fill: color, stroke: "var(--surface)" }} strokeWidth="2.5" />
        <text x={peakLabelLeft ? x(peakIndex) - 12 : x(peakIndex) + 12} y={Math.max(16, y(verdict.recentPeak) - 10)} textAnchor={peakLabelLeft ? "end" : "start"} className={styles.chartLabelStrong} fill={color}>
          {shortDate(verdict.recentPeakDate!)}: {brl(verdict.recentPeak)}
        </text>
      </g>}
      <circle cx={x(last)} cy={y(prices[last])} r="7" fill="#2854ec" style={{ stroke: "var(--surface)" }} strokeWidth="3" />
      {verdict.median && <text x={18} y={y(verdict.median) - 8} className={styles.chartLabel}>típico {brlShort(verdict.median)}</text>}
      <text x={14} y={H + 14} className={styles.chartLabel}>{shortDate(points[0].date)}</text>
      <text x={W - 14} y={H + 14} textAnchor="end" className={styles.chartLabel}>hoje</text>
    </svg>
    <p className={styles.exampleStory}>{story(item, eventName)}</p>
    <Link href={`/produto/${item.hit.path}`} className={styles.exampleLink}>Ver gráfico completo{item.storeCount ? ` e ${item.storeCount} ${item.storeCount === 1 ? "loja" : "lojas"}` : ""} →</Link>
  </article>;
}
