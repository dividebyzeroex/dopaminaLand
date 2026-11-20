import { detectDevice } from "../src/lib/pwa-client.ts";
import { installGuide } from "../src/lib/install-guide.ts";

let fail = 0;
const check = (name: string, got: unknown, want: unknown) => { const ok = got === want; if (!ok) fail++; console.log(ok ? "ok  " : "FAIL", name, ok ? "" : `→ ${String(got)} (esperado ${String(want)})`); };
const label = (ua: string, touch = 0, platform = "") => { const d = detectDevice(ua, touch, platform); return installGuide(d.os, d.browser, d.safariNew).label; };

const UA = {
  safari26: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1",
  safari17: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  chromeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  instagram: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 339.0.3.12.91",
  chromeAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  samsung: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
  firefoxAndroid: "Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0",
  whatsappAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36",
  ipadOS: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  desktopChrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
};
check("iPhone Safari 26", label(UA.safari26), "iPhone/iPad · Safari (iOS 26)");
check("iPhone Safari 17", label(UA.safari17), "iPhone/iPad · Safari");
check("iPhone Chrome", label(UA.chromeIos), "iPhone/iPad · Chrome");
check("Instagram no iPhone", label(UA.instagram), "Navegador do app (Instagram, WhatsApp…)");
check("Android Chrome", label(UA.chromeAndroid), "Android · Chrome");
check("Samsung Internet", label(UA.samsung), "Android · Samsung Internet");
check("Firefox Android", label(UA.firefoxAndroid), "Android · Firefox");
check("WebView no Android (WhatsApp)", label(UA.whatsappAndroid), "Navegador do app (Instagram, WhatsApp…)");
check("iPad (se apresenta como Mac)", label(UA.ipadOS, 5, "MacIntel"), "iPhone/iPad · Safari");
check("Chrome no computador", label(UA.desktopChrome), "Computador · Chrome");
process.exit(fail);
