import assert from "node:assert/strict";
import { extractLink, sharedQuery } from "../src/lib/shared-link.ts";

assert.equal(extractLink("Olha isso! https://www.amazon.com.br/dp/B0ABC123?ref=x."), "https://www.amazon.com.br/dp/B0ABC123?ref=x");
assert.equal(extractLink(null, "sem link"), null);
assert.equal(extractLink("", "Veja (https://produto.mercadolivre.com.br/MLB-123)"), "https://produto.mercadolivre.com.br/MLB-123");
assert.equal(sharedQuery({ url: "", text: "Air Fryer Mondial https://www.magazineluiza.com.br/p/abc/", title: "Magalu" }), "https://www.magazineluiza.com.br/p/abc/");
assert.equal(sharedQuery({ title: "Kindle 11ª geração" }), "Kindle 11ª geração");
assert.equal(sharedQuery({}), null);
console.log("shared-link: ok");
