import type { HistoryPoint } from "./buscape";

/**
 * Veredito "o desconto é de verdade?" — regras simples, públicas e reproduzíveis, para qualquer data.
 *
 * Entradas: série diária do menor preço encontrado (todas as lojas) e o menor preço de agora.
 * Não há modelo preditivo nem promessa de queda futura: só comparamos o preço de hoje
 * com o que o próprio produto custou nos dias anteriores.
 */

export type VerdictKind = "menor" | "abaixo" | "maquiado" | "comum" | "acima" | "insuficiente";
export type VerdictTone = "good" | "neutral" | "warn" | "bad";

export type Verdict = {
  kind: VerdictKind;
  tone: VerdictTone;
  label: string;
  headline: string;
  detail: string;
  current: number;
  days: number;
  since: string | null;
  median: number | null;
  min: number | null;
  max: number | null;
  /** Diferença do preço atual para a mediana do período, em % (negativo = mais barato). */
  vsMedian: number | null;
  /** Pico de preço nas duas semanas anteriores, quando sugere maquiagem. */
  recentPeak: number | null;
  recentPeakDate: string | null;
  baseline: number | null;
};

export const MIN_DAYS = 14;

/**
 * O veredito em linguagem de decisão: a resposta para "compro agora ou espero?".
 * O selo técnico (label) continua como explicação logo abaixo.
 */
export const DECISION: Record<VerdictKind, string> = {
  menor: "Pode comprar.",
  abaixo: "Bom momento para comprar.",
  maquiado: "Espere.",
  acima: "Espere, se puder.",
  comum: "Preço normal. Sem pressa.",
  insuficiente: "Ainda sem resposta.",
};
export const decisionOf = (kind: VerdictKind) => DECISION[kind];
const RECENT_DAYS = 14;

export const VERDICT_RULES: { kind: VerdictKind; label: string; rule: string }[] = [
  { kind: "menor", label: "Desconto real", rule: "Preço de hoje igual ou menor que o mínimo do período e pelo menos 3% abaixo da mediana." },
  { kind: "abaixo", label: "Abaixo do normal", rule: "Pelo menos 5% abaixo da mediana do período." },
  { kind: "maquiado", label: "Desconto maquiado", rule: "Nas 2 semanas anteriores o preço subiu 8% ou mais acima do patamar normal e hoje voltou para perto dele: o \"desconto\" só desfaz o aumento." },
  { kind: "acima", label: "Acima do normal", rule: "Pelo menos 5% acima da mediana do período. Vale esperar ou procurar outra loja." },
  { kind: "comum", label: "Preço comum", rule: "Até 5% de diferença para a mediana. Sem desconto relevante." },
  { kind: "insuficiente", label: "Histórico curto", rule: `Menos de ${MIN_DAYS} dias de preços registrados. Não dá para afirmar se há desconto.` },
];

const brl = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const pct = (value: number) => `${Math.abs(value * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function addDays(date: string, delta: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

const formatDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(".", "");

export function computeVerdict(history: HistoryPoint[], currentPrice: number | null, today = new Date().toISOString().slice(0, 10)): Verdict {
  const sorted = [...history].filter(p => p.price > 0).sort((a, b) => a.date.localeCompare(b.date));
  const current = currentPrice && currentPrice > 0 ? currentPrice : sorted.at(-1)?.price ?? 0;
  const prior = sorted.filter(p => p.date < today);
  const prices = prior.map(p => p.price);
  const base = {
    current,
    days: prior.length,
    since: prior[0]?.date ?? null,
    median: median(prices),
    min: prices.length ? Math.min(...prices) : null,
    max: prices.length ? Math.max(...prices) : null,
    recentPeak: null as number | null,
    recentPeakDate: null as string | null,
    baseline: null as number | null,
  };

  if (!current || prior.length < MIN_DAYS || !base.median || !base.min) {
    return {
      ...base, kind: "insuficiente", tone: "neutral", label: "Histórico curto", vsMedian: null,
      headline: "Ainda não dá para cravar se é desconto.",
      detail: `Temos ${prior.length} ${prior.length === 1 ? "dia" : "dias"} de preços deste produto. Precisamos de pelo menos ${MIN_DAYS} para comparar com segurança. Passamos a registrar o preço a cada consulta.`,
    };
  }

  const vsMedian = (current - base.median) / base.median;
  const cut = addDays(today, -RECENT_DAYS);
  const older = prior.filter(p => p.date < cut).map(p => p.price);
  const recent = prior.filter(p => p.date >= cut);
  const baseline = older.length >= 7 ? median(older) : null;
  const peakPoint = recent.reduce<HistoryPoint | null>((top, p) => (!top || p.price > top.price ? p : top), null);
  // Exige queda posterior ao pico e retorno a até 3% do patamar anterior.
  const inflated = Boolean(baseline && peakPoint && peakPoint.price >= baseline * 1.08
    && current <= peakPoint.price * 0.97
    && current >= baseline * 0.97 && current <= baseline * 1.03);
  const period = `${prior.length} dias`;

  if (current <= base.min * 1.005 && vsMedian <= -0.03) {
    return { ...base, vsMedian, kind: "menor", tone: "good", label: "Desconto real",
      headline: `Menor preço dos últimos ${period}.`,
      detail: `${brl(current)} está ${pct(vsMedian)} abaixo do preço típico (${brl(base.median)}) e empata ou bate o mínimo registrado desde ${formatDate(base.since!)}.` };
  }
  if (vsMedian <= -0.05) {
    return { ...base, vsMedian, kind: "abaixo", tone: "good", label: "Abaixo do normal",
      headline: `${pct(vsMedian)} abaixo do preço típico.`,
      detail: `O preço típico nos últimos ${period} foi ${brl(base.median)}. O mínimo registrado foi ${brl(base.min)}, então ainda existe espaço para cair.` };
  }
  if (inflated && baseline && peakPoint) {
    return { ...base, vsMedian, baseline, recentPeak: peakPoint.price, recentPeakDate: peakPoint.date, kind: "maquiado", tone: "bad", label: "Desconto maquiado",
      headline: "O preço subiu antes de \"cair\".",
      detail: `Em ${formatDate(peakPoint.date)} chegou a ${brl(peakPoint.price)}, ${pct((peakPoint.price - baseline) / baseline)} acima do patamar de antes (${brl(baseline)}). Hoje, ${brl(current)} é praticamente o preço normal, não uma promoção.` };
  }
  if (vsMedian >= 0.05) {
    return { ...base, vsMedian, kind: "acima", tone: "warn", label: "Acima do normal",
      headline: `${pct(vsMedian)} mais caro que o normal.`,
      detail: `Nos últimos ${period} o preço típico foi ${brl(base.median)}${base.min < base.median * 0.995 ? ` e chegou a ${brl(base.min)}` : ""}. Se puder, espere ou compare outras lojas.` };
  }
  const distance = Math.abs(vsMedian) < 0.005
    ? `é o mesmo preço típico dos últimos ${period}`
    : `está ${pct(vsMedian)} ${vsMedian < 0 ? "abaixo" : "acima"} do preço típico dos últimos ${period} (${brl(base.median)})`;
  const floor = base.min >= base.median * 0.995 ? "O preço quase não variou no período." : `O mínimo registrado foi ${brl(base.min)}.`;
  return { ...base, vsMedian, kind: "comum", tone: "neutral", label: "Preço comum",
    headline: "Sem desconto relevante hoje.",
    detail: `${brl(current)} ${distance}. ${floor}` };
}
