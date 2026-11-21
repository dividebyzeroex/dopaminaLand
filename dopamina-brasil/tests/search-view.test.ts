import assert from "node:assert/strict";
import { extractSpecs, groupVersions, modelKey, parseOrder, sortGroups } from "../src/lib/search-view.ts";

// Ficha curta: só o que está no título
assert.deepEqual(extractSpecs("Fritadeira Elétrica Air Fryer Digital 6.5 Litros 1700w Lumi"), ["6,5 L", "1700 W"]);
assert.deepEqual(extractSpecs("Smartphone Samsung Galaxy S24 FE 128GB 8GB RAM Azul"), ["128 GB", "8 GB RAM"]);
assert.deepEqual(extractSpecs("Smart TV LG 55\" 4K UHD ThinQ AI"), ['55"']);
assert.deepEqual(extractSpecs("Air Fryer Mondial AFN-40 4L 1500W 127V Preta"), ["4 L", "1500 W", "127V"]);
assert.deepEqual(extractSpecs("Smart TV Samsung 50 polegadas Crystal UHD"), ['50"']);
assert.deepEqual(extractSpecs("Kindle 11ª geração"), []);
assert.deepEqual(extractSpecs("Caixa de som JBL Flip 6 Bluetooth"), []);
assert.deepEqual(extractSpecs("Liquidificador Bivolt 1200 W"), ["1200 W", "Bivolt"]);

// Versões: cor e voltagem não separam modelos
assert.equal(modelKey("Air Fryer Mondial AFN-40 4L 127V Preta"), modelKey("Air Fryer Mondial AFN-40 4L 220V Vermelha"));
assert.notEqual(modelKey("iPhone 15 128GB Preto"), modelKey("iPhone 15 256GB Preto"));
assert.notEqual(modelKey("Galaxy S24"), modelKey("Galaxy S24 FE"));

const items = [
  { name: "Air Fryer Mondial AFN-40 127V Preta", price: 250 },
  { name: "Air Fryer Philco 12L", price: 329 },
  { name: "Air Fryer Mondial AFN-40 220V Vermelha", price: 230 },
  { name: "Air Fryer Mondial AFN-40 Bivolt Preta", price: 0 },
];
const groups = groupVersions(items);
assert.equal(groups.length, 2);
assert.equal(groups[0].versions, 2);
assert.equal(groups[0].item.price, 230, "o representante é o mais barato");
assert.equal(groups[1].item.name, "Air Fryer Philco 12L");

// Ordenação
const g = groupVersions([{ name: "a", price: 300 }, { name: "b", price: 0 }, { name: "c", price: 100 }]);
assert.deepEqual(sortGroups(g, "menor-preco").map(x => x.item.name), ["c", "a", "b"]);
assert.deepEqual(sortGroups(g, "maior-preco").map(x => x.item.name), ["a", "c", "b"]);
assert.deepEqual(sortGroups(g, "relevancia").map(x => x.item.name), ["a", "b", "c"]);
assert.equal(parseOrder("menor-preco"), "menor-preco");
assert.equal(parseOrder("x"), "relevancia");
assert.equal(parseOrder(undefined), "relevancia");

console.log("search-view: ok");
