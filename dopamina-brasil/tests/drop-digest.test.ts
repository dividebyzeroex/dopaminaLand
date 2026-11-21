import { canRepeat, deviceCanReceive, digestMessage, isDigestHour, isNotableDrop, pickForDevice, recentDrop, type DropItem } from "../src/lib/drop-digest.ts";

let fail = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = got === want; if (!ok) fail++;
  console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `→ ${String(got)} (esperado ${String(want)})`);
};

const today = "2026-11-20";
const now = new Date("2026-11-20T16:10:00Z"); // 13h10 em São Paulo
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const history = [
  { date: "2026-11-15", price: 1000 },
  { date: "2026-11-17", price: 1000 },
  { date: "2026-11-18", price: 1050 },
  { date: "2026-11-19", price: 1000 },
  { date: "2026-11-20", price: 940 }, // hoje não conta como referência
];

const drop = recentDrop(history, 940, today);
check("referência = maior preço dos 3 dias anteriores", drop.reference, 1050);
check("queda contra a referência", drop.change.toFixed(3), "-0.105");
check("sem dias recentes usa o último preço anterior", recentDrop([{ date: "2026-11-01", price: 500 }], 480, today).reference, 500);
check("sem histórico não há referência", recentDrop([], 480, today).reference, null);

check("desconto real e queda de 5% destaca", isNotableDrop("menor", -0.05), true);
check("abaixo do normal e queda de 3% destaca", isNotableDrop("abaixo", -0.03), true);
check("desconto maquiado nunca destaca", isNotableDrop("maquiado", -0.2), false);
check("preço comum não destaca", isNotableDrop("comum", -0.1), false);
check("queda de 2% não destaca", isNotableDrop("menor", -0.02), false);

check("produto nunca destacado pode", canRepeat(undefined, 900, now), true);
check("destacado há 2 dias no mesmo preço não repete", canRepeat({ price: 900, notifiedAt: hoursAgo(48) }, 900, now), false);
check("destacado há 2 dias mas caiu mais 3% repete", canRepeat({ price: 900, notifiedAt: hoursAgo(48) }, 870, now), true);
check("destacado há 8 dias repete", canRepeat({ price: 900, notifiedAt: hoursAgo(8 * 24) }, 900, now), true);

check("aparelho nunca avisado recebe", deviceCanReceive(null, now), true);
check("avisado há 5 h não recebe", deviceCanReceive(hoursAgo(5), now), false);
check("avisado há 21 h recebe", deviceCanReceive(hoursAgo(21), now), true);

check("13h de São Paulo é hora de destaques", isDigestHour(now), true);
check("3h da manhã não é", isDigestHour(new Date("2026-11-20T06:10:00Z")), false);

const item = (path: string, change: number): DropItem => ({ path, name: `Produto ${path}`, price: 900, reference: 1000, change, verdict: "menor", days: 40 });
const drops = [item("a", -0.04), item("b", -0.12), item("c", -0.07), item("d", -0.05)];
const picked = pickForDevice(drops, new Set(["b"]));
check("tira o que o aparelho já acompanha", picked.some(d => d.path === "b"), false);
check("maiores quedas primeiro", picked[0].path, "c");
check("no máximo 3 produtos", picked.length, 3);

const single = digestMessage([{ ...item("celular/iphone-16", -0.1), name: "iPhone 16 128GB" }]);
check("título com um produto", single.title, "Baixou 10%: iPhone 16 128GB");
check("link do produto marca a origem", single.url, "/produto/celular/iphone-16?origem=destaque");
const many = digestMessage(drops.slice(0, 3));
check("título com vários produtos", many.title, "3 dos mais buscados baixaram de preço");
check("vários produtos levam ao termômetro", many.url, "/?origem=destaques#termometro");

process.exit(fail);
