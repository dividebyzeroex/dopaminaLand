import { activeEvent, eventBySlug, eventLabel, occurrence, EVENTS } from "../src/lib/events.ts";

let fail = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = got === want; if (!ok) fail++;
  console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `→ ${String(got)} (esperado ${String(want)})`);
};
const ev = (id: string) => EVENTS.find(e => e.id === id)!;

check("Dia das Mães 2026 = 2º domingo de maio", ev("maes").dateOf(2026), "2026-05-10");
check("Dia das Mães 2027", ev("maes").dateOf(2027), "2027-05-09");
check("Dia dos Pais 2026 = 2º domingo de agosto", ev("pais").dateOf(2026), "2026-08-09");
check("Dia dos Pais 2027", ev("pais").dateOf(2027), "2027-08-08");
check("Black Friday 2026", ev("black-friday").dateOf(2026), "2026-11-27");
check("Black Friday 2027", ev("black-friday").dateOf(2027), "2027-11-26");
check("Black Friday 2025", ev("black-friday").dateOf(2025), "2025-11-28");

check("20/11/2026 → Black Friday", activeEvent("2026-11-20")?.event.id, "black-friday");
check("30/11/2026 (Cyber Monday) ainda Black Friday", activeEvent("2026-11-30")?.event.id, "black-friday");
check("01/12/2026 → Natal", activeEvent("2026-12-01")?.event.id, "natal");
check("26/12/2026 → nenhum", activeEvent("2026-12-26"), null);
check("25/04/2026 → Dia das Mães", activeEvent("2026-04-25")?.event.id, "maes");
check("01/06/2026 → Namorados", activeEvent("2026-06-01")?.event.id, "namorados");
check("25/07/2026 → Dia dos Pais", activeEvent("2026-07-25")?.event.id, "pais");
check("01/10/2026 → Dia das Crianças", activeEvent("2026-10-01")?.event.id, "criancas");
check("10/03/2026 → Dia do Consumidor", activeEvent("2026-03-10")?.event.id, "consumidor");
check("15/02/2026 → nenhum", activeEvent("2026-02-15"), null);

check("contagem", eventLabel(occurrence(ev("black-friday"), "2026-11-20")), "Black Friday 27/11 · faltam 7 dias");
check("véspera", eventLabel(occurrence(ev("natal"), "2026-12-24")), "Natal é amanhã, 25/12");
check("no dia", eventLabel(occurrence(ev("natal"), "2026-12-25")), "Hoje é Natal");
check("depois do Natal vira o do ano seguinte", occurrence(ev("natal"), "2026-12-26").date, "2027-12-25");
check("slug", eventBySlug("dia-das-maes")?.id, "maes");
process.exit(fail);
