import { test } from "node:test";
import assert from "node:assert/strict";
import { adminAccess } from "../src/lib/admin-auth.ts";
const env = { INSIGHTS_USERNAME: "operator", INSIGHTS_PASSWORD: "a-test-only-long-password-2026" };
const authorization = `Basic ${Buffer.from(`${env.INSIGHTS_USERNAME}:${env.INSIGHTS_PASSWORD}`).toString("base64")}`;
const req = (method = "GET", headers: Record<string, string> = {}) => new Request("https://insights.example/api/analytics/data", { method, headers });
test("fails closed without configuration or with a weak password", () => {
  assert.equal(adminAccess(req(), {})?.status, 503);
  assert.equal(adminAccess(req(), { ...env, INSIGHTS_PASSWORD: "admin" })?.status, 503);
});
test("localStorage substitute, missing and wrong credentials cannot authorize", () => {
  for (const value of ["", "Bearer true", "Basic YWRtaW46ZG9wYW1pbmE="]) {
    assert.equal(adminAccess(req("GET", { authorization: value, cookie: "insights_auth=true" }), env)?.status, 401);
  }
});
test("valid credentials can read; responses must not be cached", () => {
  assert.equal(adminAccess(req("GET", { authorization }), env), null);
  assert.equal(adminAccess(req(), env)?.headers.get("cache-control"), "no-store");
});
test("rejects cross-site and originless writes", () => {
  assert.equal(adminAccess(req("POST", { authorization }), env)?.status, 403);
  assert.equal(adminAccess(req("POST", { authorization, origin: "https://attacker.example" }), env)?.status, 403);
  assert.equal(adminAccess(req("POST", { authorization, origin: "https://insights.example" }), env), null);
});
