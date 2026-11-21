/**
 * Regras dos alertas no servidor: reaproveita o mesmo arquivo usado pelo app no
 * aparelho (public/alerts-core.js), para que a checagem horária do servidor e a
 * checagem local decidam exatamente igual.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const core = require("../../public/alerts-core.js") as {
  decideAlert: (watch: WatchState, price: number, now?: Date) => AlertDecision;
  alertMessage: (kind: AlertKind, name: string, price: number, previous: number, change: number, stableDays: number, target?: number | null) => { title: string; body: string };
};

export type AlertKind = "drop" | "rise" | "stable" | "target";
export type WatchState = {
  notifyDrop: boolean; notifyRise: boolean; notifyStable: boolean;
  lastPrice: number; lastChangeAt: string; lastNotifiedAt: string | null;
  /** Preço-alvo escolhido pela pessoa (opcional) e quando foi atingido. */
  targetPrice?: number | null; targetHitAt?: string | null;
};
export type AlertDecision = {
  kind: AlertKind | null;
  change: number;
  next: Pick<WatchState, "lastPrice" | "lastChangeAt" | "lastNotifiedAt"> & { targetHitAt: string | null };
};

export const decideAlert = core.decideAlert;
export const alertMessage = core.alertMessage;
