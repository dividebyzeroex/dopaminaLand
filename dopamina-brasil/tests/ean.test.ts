import assert from "node:assert/strict";
import { nameToQuery, normalizeGtin } from "../src/lib/ean.ts";

assert.equal(normalizeGtin("7894900011517"), "7894900011517");
assert.equal(normalizeGtin("789 4900 01151 7"), "7894900011517");
assert.equal(normalizeGtin("7894900011518"), null, "dígito verificador errado");
assert.equal(normalizeGtin("711719577294"), "0711719577294", "UPC-A vira EAN-13");
assert.equal(normalizeGtin("96385074"), "96385074", "EAN-8");
assert.equal(normalizeGtin("123"), null);
assert.equal(nameToQuery("Refrigerante Coca-Cola 2Lt CX 6 UN"), "Refrigerante Coca-Cola 2Lt 6");
console.log("ean: ok");
