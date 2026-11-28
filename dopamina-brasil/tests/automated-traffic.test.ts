import assert from "node:assert/strict";
import { isAutomatedUserAgent, isAutomatedRequest, INTERNAL_HEADER } from "../src/lib/automated-traffic.ts";

const chromeHeadless = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36";
const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const chromeDesktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const instagramApp = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0";

assert.equal(isAutomatedUserAgent(chromeHeadless), true);
assert.equal(isAutomatedUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
assert.equal(isAutomatedUserAgent("curl/8.5.0"), true);
assert.equal(isAutomatedUserAgent("python-requests/2.31"), true);
assert.equal(isAutomatedUserAgent("Mozilla/5.0 Playwright/1.50"), true);
assert.equal(isAutomatedUserAgent(iphone), false);
assert.equal(isAutomatedUserAgent(chromeDesktop), false);
assert.equal(isAutomatedUserAgent(instagramApp), false);
assert.equal(isAutomatedUserAgent(""), false);
assert.equal(isAutomatedUserAgent(null), false);

const h = (o: Record<string, string>) => ({ get: (k: string) => o[k.toLowerCase()] ?? null });
assert.equal(isAutomatedRequest(h({ "user-agent": chromeHeadless })), true);
assert.equal(isAutomatedRequest(h({ "user-agent": iphone })), false);
assert.equal(isAutomatedRequest(h({ "user-agent": iphone, [INTERNAL_HEADER]: "1" })), true);
console.log("automated-traffic ok");
