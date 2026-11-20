import { pickRotating } from "../src/lib/rotation.ts";

const pool = Array.from({ length: 20 }, (_, i) => ({ path: `cat${i % 10}/p${i}`, group: `g${i % 10}` }));
const opts = { total: 12, fixedTop: 8, perGroup: 2 };
let fail = 0;
const check = (name: string, ok: boolean, detail = "") => { if (!ok) fail++; console.log(ok ? "ok  " : "FAIL", name, detail); };

const a = pickRotating([], pool, { ...opts, window: 0 }).map(c => c.path);
const b = pickRotating([], pool, { ...opts, window: 1 }).map(c => c.path);
check("12 itens", a.length === 12);
check("8 primeiros fixos entre janelas", a.slice(0, 8).join() === b.slice(0, 8).join());
check("últimas vagas revezam", a.slice(8).join() !== b.slice(8).join(), `${a.slice(8)} -> ${b.slice(8)}`);

const ps5 = Array.from({ length: 6 }, (_, i) => ({ path: `games/ps5-${i}`, group: "Games" }));
const c = pickRotating([], [...ps5, ...pool], { ...opts, window: 0 });
check("máximo 2 por categoria", c.filter(x => x.group === "Games").length === 2);

const own = [{ path: "x/buscado", group: "g0" }];
const d = pickRotating(own, pool, { ...opts, window: 3 });
check("buscas próprias entram primeiro", d[0].path === "x/buscado");
check("sem duplicados", new Set(d.map(x => x.path)).size === d.length);
process.exit(fail);
