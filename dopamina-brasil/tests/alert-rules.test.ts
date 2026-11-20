import { decideAlert, alertMessage, type WatchState } from "../src/lib/alert-rules.ts";

let fail = 0;
const check = (name: string, got: unknown, want: unknown) => { const ok = got === want; if (!ok) fail++; console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `→ ${String(got)} (esperado ${String(want)})`); };
const now = new Date("2026-11-20T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const base: WatchState = { notifyDrop: true, notifyRise: true, notifyStable: true, lastPrice: 1000, lastChangeAt: daysAgo(1), lastNotifiedAt: null };

check("queda de 5% avisa", decideAlert(base, 950, now).kind, "drop");
check("queda grava novo preço de referência", decideAlert(base, 950, now).next.lastPrice, 950);
check("queda de 2% não avisa", decideAlert(base, 980, now).kind, null);
check("alta de 4% avisa", decideAlert(base, 1040, now).kind, "rise");
check("alta sem opção marcada não avisa", decideAlert({ ...base, notifyRise: false }, 1040, now).kind, null);
check("oscilação de 0,5% não muda referência", decideAlert(base, 1005, now).next.lastPrice, 1000);
check("estável há 8 dias avisa", decideAlert({ ...base, lastChangeAt: daysAgo(8) }, 1003, now).kind, "stable");
check("estável há 3 dias não avisa", decideAlert({ ...base, lastChangeAt: daysAgo(3) }, 1003, now).kind, null);
check("estável já avisado há 2 dias não repete", decideAlert({ ...base, lastChangeAt: daysAgo(20), lastNotifiedAt: daysAgo(2) }, 1000, now).kind, null);
check("estável avisado há 8 dias repete", decideAlert({ ...base, lastChangeAt: daysAgo(20), lastNotifiedAt: daysAgo(8) }, 1000, now).kind, "stable");
check("mudança de 1,5% reinicia a contagem de estabilidade", decideAlert({ ...base, lastChangeAt: daysAgo(10) }, 1015, now).next.lastChangeAt, now.toISOString());
check("texto de queda", alertMessage("drop", "JBL Flip 6", 600, 640, -0.0625, 0).title, "Baixou 6,3%: JBL Flip 6");
process.exit(fail);
