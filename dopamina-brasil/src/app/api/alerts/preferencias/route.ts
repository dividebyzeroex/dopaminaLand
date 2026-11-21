import { NextRequest, NextResponse } from "next/server";
import { adminDb, alertsAvailable, isValidEndpoint } from "@/lib/push";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Preferência do aparelho para os destaques de queda dos produtos mais buscados.
 * O endpoint de push identifica o aparelho (URL longa e aleatória que só ele conhece).
 *  - GET  ?endpoint=...                  → { trending: boolean | null }
 *  - POST { endpoint, trending }         → liga/desliga num aparelho já inscrito
 *  - POST { subscription, trending }     → inscreve o aparelho só para destaques
 */

const unavailable = () => NextResponse.json({ ok: false, error: "Os avisos ainda não estão ativos. Tente novamente em breve." }, { status: 503 });
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
const noStore = { "Cache-Control": "no-store" };

type Body = {
  endpoint?: string;
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  trending?: boolean;
};

export async function GET(req: NextRequest) {
  if (!rateLimit(`alert-prefs:${clientIp(req.headers)}`, 30, 60_000).ok) return bad("Muitas tentativas.", 429);
  if (!alertsAvailable()) return unavailable();
  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!isValidEndpoint(endpoint)) return bad("Aparelho inválido.");
  const { data, error } = await adminDb()!.from("push_subscriptions").select("notify_trending, disabled_at").eq("endpoint", endpoint).maybeSingle();
  if (error) return unavailable();
  const trending = data && !data.disabled_at ? Boolean(data.notify_trending) : null;
  return NextResponse.json({ ok: true, trending }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`alert-prefs:${clientIp(req.headers)}`, 20, 60_000).ok) return bad("Muitas tentativas.", 429);
  if (!alertsAvailable()) return unavailable();
  const body = (await req.json().catch(() => ({}))) as Body;
  if (typeof body.trending !== "boolean") return bad("Preferência inválida.");
  const db = adminDb()!;

  const sub = body.subscription;
  if (sub) {
    if (!isValidEndpoint(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return bad("Inscrição de notificação inválida.");
    const { error } = await db.from("push_subscriptions").upsert({
      endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      last_seen_at: new Date().toISOString(), disabled_at: null, notify_trending: body.trending,
    }, { onConflict: "endpoint" });
    if (error) return bad("Não foi possível salvar a preferência.", 500);
    return NextResponse.json({ ok: true, trending: body.trending });
  }

  if (!isValidEndpoint(body.endpoint)) return bad("Aparelho inválido.");
  const { data, error } = await db.from("push_subscriptions").update({ notify_trending: body.trending }).eq("endpoint", body.endpoint).select("id");
  if (error) return bad("Não foi possível salvar a preferência.", 500);
  if (!data?.length) return bad("Aparelho não inscrito.", 404);
  return NextResponse.json({ ok: true, trending: body.trending });
}
