import { test } from "node:test";
import assert from "node:assert/strict";
import { readJsonObject } from "../src/lib/request-body.ts";
const req = (body: string) => new Request("https://example.test", { method: "POST", body });
test("accepts a JSON object", async () => assert.deepEqual(await readJsonObject(req('{"query":"iphone"}')), { query: "iphone" }));
test("rejects malformed JSON, arrays and primitives", async () => {
  for (const value of ["null", "[]", "123", "invalid"]) await assert.rejects(readJsonObject(req(value)));
});
test("enforces actual byte size even without content-length", async () => {
  await assert.rejects(readJsonObject(req('{"query":"áááááááá"}'), 20));
});
