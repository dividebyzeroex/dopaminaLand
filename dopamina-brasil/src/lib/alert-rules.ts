/**
 * Quando um alerta de preço dispara. Função pura, testada em tests/alert-rules.test.ts.
 *
 * - Baixou: preço caiu 3% ou mais desde o último preço avisado/registrado.
 * - Subiu: preço subiu 3% ou mais (útil para quem está esperando: "não compre agora").
 * - Estabilizou: o preço ficou dentro de ±1% por 7 dias seguidos. Sinal de que não
 *   há queda a caminho; avisamos no máximo uma vez a cada 7 dias.
 */

export type AlertKind = "drop" | "rise" | "stable";

export type WatchState = {
  notifyDrop: boolean;
  notifyRise: boolean;
  notifyStable: boolean;
  /** Último preço que serviu de referência (avisado ou registrado). */
  lastPrice: number;
  /** Quando o preço mudou mais de 1% pela última vez (ISO). */
  lastChangeAt: string;
  /** Último push enviado (ISO) ou null. */
  lastNotifiedAt: string | null;
};

export type AlertDecision = {
  kind: AlertKind | null;
  /** Variação relativa ao último preço de referência (0,05 = +5%). */
  change: number;
  /** Novo estado a gravar. */
  next: Pick<WatchState, "lastPrice" | "lastChangeAt" | "lastNotifiedAt">;
};

export const DROP_OR_RISE = 0.03;
export const STABLE_BAND = 0.01;
export const STABLE_DAYS = 7;
const DAY = 86400000;

export function decideAlert(watch: WatchState, price: number, now = new Date()): AlertDecision {
  const nowIso = now.toISOString();
  const change = watch.lastPrice > 0 ? (price - watch.lastPrice) / watch.lastPrice : 0;
  const moved = Math.abs(change) > STABLE_BAND;
  const lastChangeAt = moved ? nowIso : watch.lastChangeAt;

  if (change <= -DROP_OR_RISE && watch.notifyDrop) {
    return { kind: "drop", change, next: { lastPrice: price, lastChangeAt, lastNotifiedAt: nowIso } };
  }
  if (change >= DROP_OR_RISE && watch.notifyRise) {
    return { kind: "rise", change, next: { lastPrice: price, lastChangeAt, lastNotifiedAt: nowIso } };
  }

  const stableFor = (now.getTime() - Date.parse(lastChangeAt)) / DAY;
  const sinceLastPush = watch.lastNotifiedAt ? (now.getTime() - Date.parse(watch.lastNotifiedAt)) / DAY : Infinity;
  if (!moved && watch.notifyStable && stableFor >= STABLE_DAYS && sinceLastPush >= STABLE_DAYS) {
    return { kind: "stable", change, next: { lastPrice: watch.lastPrice, lastChangeAt, lastNotifiedAt: nowIso } };
  }

  // Sem aviso: atualiza a referência só quando o preço realmente mudou, para que
  // pequenas oscilações somadas ainda possam disparar uma queda de 3% depois.
  return { kind: null, change, next: { lastPrice: moved ? price : watch.lastPrice, lastChangeAt, lastNotifiedAt: watch.lastNotifiedAt } };
}

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number) => `${Math.abs(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/** Texto do push. */
export function alertMessage(kind: AlertKind, name: string, price: number, previous: number, change: number, stableDays: number) {
  const short = name.length > 60 ? `${name.slice(0, 58)}…` : name;
  if (kind === "drop") return { title: `Baixou ${pct(change)}: ${short}`, body: `De ${brl(previous)} para ${brl(price)}. Veja se é desconto real no histórico.` };
  if (kind === "rise") return { title: `Subiu ${pct(change)}: ${short}`, body: `Foi de ${brl(previous)} para ${brl(price)}. Se puder, espere.` };
  return { title: `Preço estável: ${short}`, body: `${brl(price)} há ${Math.floor(stableDays)} dias, sem sinal de queda. Bom momento para decidir.` };
}
