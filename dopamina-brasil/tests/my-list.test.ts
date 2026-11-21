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

// Listas de presente
{
  const { nextGiftOccasion, withGift, giftTotals } = await import("../src/lib/my-list.ts");
  const occ = [
    { event: { id: "black-friday", name: "Black Friday" }, date: "2026-11-27", daysLeft: 6 },
    { event: { id: "natal", name: "Natal" }, date: "2026-12-25", daysLeft: 34 },
    { event: { id: "maes", name: "Dia das Mães" }, date: "2027-05-09", daysLeft: 169 },
  ];
  assert.deepEqual(nextGiftOccasion(occ), { key: "natal-2026", name: "Natal 2026", date: "2026-12-25", daysLeft: 34 });
  assert.equal(nextGiftOccasion([{ event: { id: "natal", name: "Natal" }, date: "2026-12-25", daysLeft: -1 }, ...occ.slice(2)])?.key, "maes-2027");
  let l = withGift([item("a"), item("b")], "a", "natal-2026");
  assert.equal(l[0].gift, "natal-2026");
  assert.equal(withItem(l, item("a", 50)).find(x => x.path === "a")?.gift, "natal-2026", "salvar de novo mantém a lista de presente");
  l = withGift(l, "a", null);
  assert.equal(l[0].gift, undefined);
  const t = giftTotals([{ price: 100, now: 90 }, { price: 200, now: 210 }, { price: 50, now: null }]);
  assert.deepEqual(t, { count: 3, priced: 2, saved: 300, now: 300, diff: 0 });
  console.log("gift lists: ok");
}
