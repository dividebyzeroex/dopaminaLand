import { createHash, timingSafeEqual } from "node:crypto";

/** HTTP Basic over HTTPS. Credentials never reach client bundles. */
export function adminAccess(request: Request, env: { INSIGHTS_USERNAME?: string; INSIGHTS_PASSWORD?: string } = {
  INSIGHTS_USERNAME: process.env.INSIGHTS_USERNAME,
  INSIGHTS_PASSWORD: process.env.INSIGHTS_PASSWORD,
}): Response | null {
  const username = env.INSIGHTS_USERNAME;
  const password = env.INSIGHTS_PASSWORD;
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  if (!username || !password || password.length < 20) {
    return Response.json({ error: "Acesso administrativo não configurado." }, { status: 503, headers });
  }
  const supplied = request.headers.get("authorization") ?? "";
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (supplied.length > 4096 || !timingSafeEqual(hash(supplied), hash(expected))) {
    return Response.json({ error: "Autenticação necessária." }, {
      status: 401, headers: { ...headers, "WWW-Authenticate": 'Basic realm="Dopamina Insights", charset="UTF-8"' },
    });
  }
  // Browsers send Basic credentials automatically; reject cross-site mutations.
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)
      && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Origem inválida." }, { status: 403, headers });
  }
  return null;
}
