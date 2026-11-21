"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HistoryPoint } from "@/lib/buscape";
import { brl, brlShort, shortDate } from "@/lib/format";
import styles from "../bf.module.css";

type Props = { points: HistoryPoint[]; current: number | null; median: number | null; min: number | null; today: string };

const PAD = { left: 58, right: 14, top: 18, bottom: 30 };

export default function PriceHistoryChart({ points, current, median, min, today }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  // O SVG é desenhado na largura real do container: o texto dos eixos fica legível no celular.
  const [W, setW] = useState(720);
  const H = W < 520 ? 230 : 260;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const series = useMemo(() => {
    // O ponto de hoje é sempre o menor preço das ofertas atuais (a série da fonte pode estar defasada).
    const list = points.filter(p => p.date < today);
    const last = points.at(-1);
    if (current) list.push({ date: today, price: current });
    else if (last?.date === today) list.push(last);
    return list;
  }, [points, current, today]);

  if (series.length < 2) return <p className={styles.verdictMeta}>Ainda não há pontos suficientes para desenhar o histórico.</p>;

  const prices = series.map(p => p.price);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const span = hi - lo || hi * 0.05 || 1;
  const yMin = Math.max(0, lo - span * 0.18);
  const yMax = hi + span * 0.18;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  // Linha em degraus: o preço vale o dia inteiro até mudar.
  let line = `M ${x(0)} ${y(series[0].price)}`;
  for (let i = 1; i < series.length; i++) line += ` H ${x(i)} V ${y(series[i].price)}`;
  const area = `${line} V ${PAD.top + innerH} H ${x(0)} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks);
  const xEvery = Math.max(1, Math.ceil(series.length / Math.max(3, Math.floor(W / 115))));
  const minIndex = prices.lastIndexOf(lo);
  const lastIndex = series.length - 1;

  function onMove(clientX: number) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((ratio - PAD.left) / innerW) * (series.length - 1));
    setHover(Math.min(lastIndex, Math.max(0, i)));
  }

  const active = hover ?? null;
  const activePoint = active !== null ? series[active] : null;
  const tooltipLeft = active !== null ? `${Math.min(88, Math.max(12, (x(active) / W) * 100))}%` : "0";

  return <div>
    <div
      ref={box}
      className={styles.chartBox}
      onPointerMove={event => onMove(event.clientX)}
      onPointerDown={event => onMove(event.clientX)}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Histórico de ${series.length} dias. Mínimo ${brl(lo)}, máximo ${brl(hi)}${median ? `, típico ${brl(median)}` : ""}.`}>
        <defs>
          <linearGradient id="dopa-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2854ec" stopOpacity=".14" />
            <stop offset="1" stopColor="#2854ec" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(v => <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity=".06" />
          <text x={PAD.left - 10} y={y(v) + 3} textAnchor="end">{brlShort(v)}</text>
        </g>)}
        {series.map((p, i) => (i % xEvery === 0 || i === lastIndex) && (lastIndex - i >= xEvery / 2 || i === lastIndex)
          ? <text key={p.date} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === lastIndex ? "end" : "middle"}>{i === lastIndex ? "hoje" : shortDate(p.date)}</text>
          : null)}
        <path d={area} fill="url(#dopa-area)" />
        {median && <line x1={PAD.left} x2={W - PAD.right} y1={y(median)} y2={y(median)} stroke="#969b94" strokeWidth="1.5" strokeDasharray="5 5" />}
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        {min && <circle cx={x(minIndex)} cy={y(lo)} r="5" style={{ fill: "var(--good)", stroke: "var(--surface)" }} strokeWidth="2" />}
        <circle cx={x(lastIndex)} cy={y(series[lastIndex].price)} r="6" fill="#2854ec" style={{ stroke: "var(--surface)" }} strokeWidth="2.5" />
        {activePoint && active !== null && <g>
          <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="currentColor" strokeOpacity=".25" />
          <circle cx={x(active)} cy={y(activePoint.price)} r="4.5" fill="currentColor" style={{ stroke: "var(--surface)" }} strokeWidth="2" />
        </g>}
      </svg>
      {activePoint && <div className={styles.tooltip} style={{ left: tooltipLeft }} aria-hidden="true">
        {brl(activePoint.price)}<span>{active === lastIndex ? "hoje" : new Date(`${activePoint.date}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })}</span>
      </div>}
    </div>
    <div className={styles.legend}>
      <span><i />Menor preço do dia (todas as lojas)</span>
      {median && <span><i className={styles.dashed} />Preço típico (mediana)</span>}
      <span><i className={styles.minDot} />Mínimo do período</span>
      <span><i className={styles.dot} />Hoje</span>
    </div>
  </div>;
}
