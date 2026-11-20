import { computeVerdict } from "../src/lib/price-verdict.ts";
const today = "2026-11-19";
const days = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => { const d = new Date(Date.UTC(2026, 9, 11 + i)); return { date: d.toISOString().slice(0, 10), price: f(i) }; });
const cases: [string, ReturnType<typeof days>, number, string][] = [
  ["flat -> comum", days(39, () => 1000), 1000, "comum"],
  ["new low", days(39, i => 1000 - (i === 5 ? 50 : 0)), 940, "menor"],
  ["below median", days(39, i => (i < 5 ? 880 : 1000)), 930, "abaixo"],
  ["inflated then back", days(39, i => (i >= 30 ? 1150 : 1000)), 1000, "maquiado"],
  ["rise without subsequent drop", days(39, i => (i >= 25 ? 1150 : 1000)), 1150, "acima"],
  ["new high after prior peak", days(39, i => (i >= 30 ? 1150 : 1000)), 1200, "acima"],
  ["partial drop still above normal", days(39, i => (i >= 30 ? 1200 : 1000)), 1100, "acima"],
  ["return near baseline", days(39, i => (i >= 30 ? 1150 : 1000)), 1020, "maquiado"],
  ["above", days(39, () => 1000), 1080, "acima"],
  ["short history", days(5, () => 1000), 900, "insuficiente"],
];
let fail = 0;
for (const [name, h, cur, want] of cases) {
  const v = computeVerdict(h, cur, today);
  const ok = v.kind === want; if (!ok) fail++;
  console.log(ok ? "ok  " : "FAIL", name, "->", v.kind, "|", v.detail);
}
process.exit(fail);
