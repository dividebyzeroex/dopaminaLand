import assert from "node:assert/strict";
import { changeSinceSaved, parseList, withItem, withoutItem, LIST_MAX, type SavedItem } from "../src/lib/my-list.ts";

const item = (path: string, price = 100, savedAt = "2026-11-01T10:00:00Z"): SavedItem => ({ path, name: path, price, savedAt });

// parse tolera lixo e descarta itens inválidos
assert.deepEqual(parseList(null), []);
assert.deepEqual(parseList("{x"), []);
assert.deepEqual(parseList('{"a":1}'), []);
assert.equal(parseList(JSON.stringify([item("a"), { path: "b" }, { ...item("c"), price: 0 }])).length, 1);

// salvar de novo mantém o preço e a data de quando salvou, e sobe para o topo
let list = withItem([], item("a", 100));
list = withItem(list, item("b", 50));
list = withItem(list, { ...item("a", 80, "2026-11-20T10:00:00Z"), image: "x.jpg" });
assert.deepEqual(list.map(x => x.path), ["a", "b"]);
assert.equal(list[0].price, 100);
assert.equal(list[0].savedAt, "2026-11-01T10:00:00Z");
assert.equal(list[0].image, "x.jpg");

// remover e limite
assert.deepEqual(withoutItem(list, "a").map(x => x.path), ["b"]);
let big: SavedItem[] = [];
for (let i = 0; i < LIST_MAX + 5; i++) big = withItem(big, item(`p${i}`));
assert.equal(big.length, LIST_MAX);
assert.equal(big[0].path, `p${LIST_MAX + 4}`);

// variação desde que salvou
assert.equal(changeSinceSaved(100, 90).kind, "down");
assert.equal(changeSinceSaved(100, 110).kind, "up");
assert.equal(changeSinceSaved(100, 100.4).kind, "same");
assert.ok(Math.abs(changeSinceSaved(749, 467.1).pct + 0.3764) < 0.001);

console.log("my-list: ok");
