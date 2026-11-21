/**
 * Destaques de queda: aviso periódico, por push, quando um dos produtos mais
 * buscados baixa de preço de verdade. Vai para quem tem o push ativo no aparelho,
 * além dos alertas dos produtos que a pessoa escolheu.
 *
 * Regras (públicas e reproduzíveis, sem promessa de queda futura):
 *  - O produto precisa estar com veredito "Desconto real" ou "Abaixo do normal"
 *    (nunca "Desconto maquiado") e ter caído 3% ou mais em relação ao maior preço
 *    dos 3 dias anteriores.
 *  - O mesmo produto não é destacado de novo por 7 dias, a menos que caia mais 3%.
 *  - Cada aparelho recebe no máximo 1 aviso de destaques por dia, em horário comercial,
 *    juntando até 3 produtos. Produtos que a pessoa já acompanha ficam de fora
 *    (ela recebe o alerta próprio deles).
 *
 * Sem dependências de rede ou banco, para rodar nos testes (tests/drop-digest.test.ts).
 */

export type PricePoint = { date: string; price: number };

export const DROP_MIN = 0.03;
export const LOOKBACK_DAYS = 3;
export const REPEAT_DAYS = 7;
export const FURTHER_DROP = 0.03;
export const PER_DEVICE_GAP_HOURS = 20;
export const MAX_ITEMS = 3;
/** Horas (São Paulo) em que a checagem horária também procura destaques. */
export const DIGEST_HOURS_SP = [10, 13, 16, 19];

const DAY = 86400000;
const GOOD_VERDICTS = new Set(["menor", "abaixo"]);

function addDays(date: string, delta: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Queda de hoje contra o maior preço dos últimos dias (negativo = mais barato). */
export function recentDrop(history: PricePoint[], current: number, today: string, lookback = LOOKBACK_DAYS): { reference: number | null; change: number } {
  const prior = history.filter(p => p.price > 0 && p.date < today).sort((a, b) => a.date.localeCompare(b.date));
  const window = prior.filter(p => p.date >= addDays(today, -lookback));
  const pool = window.length ? window : prior.slice(-1);
  if (!pool.length || !(current > 0)) return { reference: null, change: 0 };
  const reference = Math.max(...pool.map(p => p.price));
  return { reference, change: (current - reference) / reference };
}

export function isNotableDrop(verdictKind: string, change: number): boolean {
  return GOOD_VERDICTS.has(verdictKind) && change <= -DROP_MIN;
}

export type Notice = { price: number; notifiedAt: string };

/** Pode destacar este produto de novo? */
export function canRepeat(notice: Notice | undefined, price: number, now: Date): boolean {
  if (!notice) return true;
  const days = (now.getTime() - Date.parse(notice.notifiedAt)) / DAY;
  return days >= REPEAT_DAYS || price <= notice.price * (1 - FURTHER_DROP);
}

/** Este aparelho pode receber destaques agora? */
export function deviceCanReceive(lastTrendingAt: string | null, now: Date): boolean {
  if (!lastTrendingAt) return true;
  return (now.getTime() - Date.parse(lastTrendingAt)) / 3600000 >= PER_DEVICE_GAP_HOURS;
}

const hourFmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false });
export function isDigestHour(now: Date): boolean {
  return DIGEST_HOURS_SP.includes(Number(hourFmt.format(now)) % 24);
}

export type DropItem = {
  path: string;
  name: string;
  price: number;
  reference: number;
  change: number;
  verdict: string;
  days: number;
};

/** Até 3 quedas para um aparelho, maiores primeiro, sem os produtos que ele já acompanha. */
export function pickForDevice(drops: DropItem[], watched: Set<string>, max = MAX_ITEMS): DropItem[] {
  return drops.filter(d => !watched.has(d.path)).sort((a, b) => a.change - b.change).slice(0, max);
}

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const pct = (v: number) => `${Math.abs(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
const short = (name: string, n = 48) => (name.length > n ? `${name.slice(0, n - 1)}…` : name);

export type DigestMessage = { title: string; body: string; url: string; tag: string };

export function digestMessage(items: DropItem[]): DigestMessage {
  if (items.length === 1) {
    const d = items[0];
    const why = d.verdict === "menor" ? `menor preço em ${d.days} dias` : "abaixo do preço típico";
    return {
      title: `Baixou ${pct(d.change)}: ${short(d.name, 60)}`,
      body: `De ${brl(d.reference)} para ${brl(d.price)}, ${why}. Um dos mais buscados no Dopamina.`,
      url: `/produto/${d.path}?origem=destaque`,
      tag: "dopamina-destaques",
    };
  }
  return {
    title: `${items.length} dos mais buscados baixaram de preço`,
    body: items.map(d => `${short(d.name, 34)} −${pct(d.change)} (${brl(d.price)})`).join(" · "),
    url: "/?origem=destaques#termometro",
    tag: "dopamina-destaques",
  };
}
