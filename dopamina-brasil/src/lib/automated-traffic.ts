// Tráfego automatizado (navegador sem tela, scripts, robôs) não é visita de pessoa:
// não deve entrar nos insights de acessos, buscas e produtos. Usado nas rotas de
// telemetria (servidor) e no TrackingProvider (navegador).

const AUTOMATED_UA =
  /headlesschrome|headless|playwright|puppeteer|phantomjs|selenium|webdriver|lighthouse|pagespeed|bot\b|crawler|spider|slurp|curl\/|wget\/|python-requests|python-urllib|node-fetch|undici|axios\/|go-http-client|okhttp|java\/|httpclient|facebookexternalhit|whatsapp\/|telegrambot/i;

// Cabeçalho que as nossas próprias ferramentas (renderização de posts, rotinas) podem
// enviar para se declararem internas, mesmo com navegador comum.
export const INTERNAL_HEADER = "x-dopamina-internal";

export function isAutomatedUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return AUTOMATED_UA.test(userAgent);
}

export function isAutomatedRequest(headers: { get(name: string): string | null }): boolean {
  if (headers.get(INTERNAL_HEADER)) return true;
  return isAutomatedUserAgent(headers.get("user-agent"));
}
