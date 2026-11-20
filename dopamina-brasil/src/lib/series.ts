import type { HistoryPoint } from "./buscape";

/** Série para exibição: dias anteriores + o preço de agora como último ponto. */
export function displaySeries(history: HistoryPoint[], current: number | null, today = new Date().toISOString().slice(0, 10)): HistoryPoint[] {
  const list = history.filter(p => p.date < today);
  if (current && current > 0) list.push({ date: today, price: current });
  else if (history.at(-1)?.date === today) list.push(history.at(-1)!);
  return list;
}

export type StepGeometry = { path: string; area: string; x: (i: number) => number; y: (v: number) => number };

/** Linha em degraus (o preço vale o dia inteiro até mudar), ajustada ao retângulo dado. */
export function stepGeometry(prices: number[], width: number, height: number, pad = 4): StepGeometry {
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const span = hi - lo || hi * 0.05 || 1;
  const min = lo - span * 0.15;
  const max = hi + span * 0.15;
  const n = prices.length;
  const x = (i: number) => pad + (n <= 1 ? (width - 2 * pad) / 2 : (i * (width - 2 * pad)) / (n - 1));
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (height - 2 * pad);
  let path = `M${x(0).toFixed(1)} ${y(prices[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) path += ` H${x(i).toFixed(1)} V${y(prices[i]).toFixed(1)}`;
  const area = `${path} V${height - pad} H${x(0).toFixed(1)} Z`;
  return { path, area, x, y };
}
