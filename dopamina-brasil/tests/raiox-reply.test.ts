import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { buildFoundReply, parseIncoming, parseRequest, verifySignature, SIGNATURE, DISCLAIMER } from "../src/lib/raiox-reply.ts";

const body = '{"a":1}';
const sig = createHmac("sha256", "s3").update(body).digest("hex");
assert.equal(verifySignature(body, sig, "s3"), true);
assert.equal(verifySignature(body, sig, "outro"), false);
assert.equal(verifySignature(body + " ", sig, "s3"), false);
assert.equal(verifySignature(body, null, "s3"), false);

const ev = (over = {}) => ({ id: "e1", event: "message.received", message: { conversationId: "c1", direction: "incoming", text: " raiox iPhone 15 ", sender: { id: "u1" } }, account: { accountId: "a1" }, metadata: {}, ...over });
assert.deepEqual(parseIncoming(ev()), { eventId: "e1", conversationId: "c1", accountId: "a1", senderId: "u1", text: "raiox iPhone 15" });
assert.equal(parseIncoming(ev({ event: "message.sent" })), null);
assert.equal(parseIncoming(ev({ metadata: { standby: true } })), null);
assert.equal(parseIncoming(ev({ message: { conversationId: "c1", direction: "outgoing", text: "oi" } })), null);
assert.equal(parseIncoming(ev({ message: { conversationId: "c1", direction: "incoming", text: null } })), null);

assert.deepEqual(parseRequest("raiox iPhone 15 128GB"), { kind: "query", query: "iPhone 15 128GB" });
assert.deepEqual(parseRequest("Raio-X: geladeira inverse"), { kind: "query", query: "geladeira inverse" });
assert.deepEqual(parseRequest("raiox https://www.magazineluiza.com.br/p/123/"), { kind: "link", url: "https://www.magazineluiza.com.br/p/123/" });
assert.deepEqual(parseRequest("raiox"), { kind: "empty" });
assert.deepEqual(parseRequest("airfryer 5l"), { kind: "query", query: "airfryer 5l" });

const reply = buildFoundReply({ name: "Air Fryer 5L", price: 399.9, productPath: "air-fryer/p/1", decision: "Espere.", headline: "Já custou menos.", detail: "Menor preço: R$ 349.", days: 90, now: new Date("2026-11-24T15:00:00Z") });
assert.match(reply, /^Raio-X Dopamina/);
assert.match(reply, /R\$\s399,90/);
assert.match(reply, /Espere\./);
assert.match(reply, /dopaminado\.com\.br\/produto\/air-fryer\/p\/1/);
assert.match(reply, /consultado em 24\/11/);
assert.ok(reply.includes(SIGNATURE) && reply.includes(DISCLAIMER));
console.log("raiox-reply: ok");
