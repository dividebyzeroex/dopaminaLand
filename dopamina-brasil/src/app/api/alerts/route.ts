import { NextRequest, NextResponse } from "next/server";
import { adminDb, alertsAvailable, isValidEndpoint, sendPush } from "@/lib/push";
import { getProduct, isSafeProductPath } from "@/lib/buscape";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Alertas de preço do aparelho. O endpoint de push funciona como identificador:
 * é uma URL longa e aleatória que só o próprio aparelho conhece.
 */

const unavailable = () => NextResponse.json({ ok: false, error: "Os alertas ainda não estão ativos. Tente novamente em breve." }, { status: 503 });
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

type Body = {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  endpoint?: string;
  path?: string;
  kinds?: { drop?: boolean; rise?: boolean; stable?: boolean };
};

async function subscriptionId(endpoint: string) {
  const db = adminDb()!;
  const { data } = await db.from("push_subscriptions").select("id").eq("endpoint", endpoint).maybeSingle();
  return data?.id as string | undefined;
}

/** Cria ou atualiza o alerta de um produto. */
export async function POST(req: NextRequest) {
  if (!rateLimit(`alerts:${clientIp(req.headers)}`, 20, 60_000).ok) return bad("Muitas tentativas. Tente em instantes.", 429);
  if (!alertsAvailable()) return unavailable();
  const body = (await req.json().catch(() => ({}))) as Body;
  const sub = body.subscription;
  if (!sub || !isValidEndpoint(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return bad("Inscrição de notificação inválida.");
  if (!body.path || !isSafeProductPath(body.path)) return bad("Produto inválido.");
  const kinds = { drop: body.kinds?.drop !== false, rise: Boolean(body.kinds?.rise), stable: body.kinds?.stable !== false };
  if (!kinds.drop && !kinds.rise && !kinds.stable) return bad("Escolha pelo menos um tipo de alerta.");

  const product = await getProduct(body.path).catch(() => null);
  if (!product?.bestPrice) return bad("Não conseguimos ler o preço deste produto agora.", 502);

  const db = adminDb()!;
  const existing = await subscriptionId(sub.endpoint);
  const { data: saved, error } = await db.from("push_subscriptions").upsert({
    endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    last_seen_at: new Date().toISOString(), disabled_at: null,
  }, { onConflict: "endpoint" }).select("id").single();
  if (error || !saved) return bad("Não foi possível salvar o alerta.", 500);

  const { error: watchError } = await db.from("price_watches").upsert({
    subscription_id: saved.id, product_path: product.path, product_name: product.name,
    notify_drop: kinds.drop, notify_rise: kinds.rise, notify_stable: kinds.stable,
    base_price: product.bestPrice, last_price: product.bestPrice, last_change_at: new Date().toISOString(),
  }, { onConflict: "subscription_id,product_path" });
  if (watchError) return bad("Não foi possível salvar o alerta.", 500);

  // Primeiro alerta do aparelho: confirma com um push, que já testa a entrega.
  if (!existing) {
    await sendPush({ id: saved.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }, {
      title: "Alertas ativados ✓",
      body: `Vamos avisar quando ${product.name.slice(0, 60)} mudar de preço.`,
      url: `/produto/${product.path}`,
      tag: "dopamina-welcome",
    });
  }
  return NextResponse.json({ ok: true, price: product.bestPrice, name: product.name });
}

/** Lista os alertas do aparelho. */
export async function GET(req: NextRequest) {
  if (!alertsAvailable()) return unavailable();
  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!isValidEndpoint(endpoint)) return bad("Aparelho inválido.");
  const id = await subscriptionId(endpoint);
  if (!id) return NextResponse.json({ ok: true, alerts: [] });
  const { data } = await adminDb()!.from("price_watches")
    .select("product_path, product_name, notify_drop, notify_rise, notify_stable, base_price, last_price, created_at")
    .eq("subscription_id", id).order("created_at", { ascending: false });
  return NextResponse.json({ ok: true, alerts: data ?? [] });
}

/** Remove um alerta (ou todos, sem `path`). */
export async function DELETE(req: NextRequest) {
  if (!alertsAvailable()) return unavailable();
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!isValidEndpoint(body.endpoint)) return bad("Aparelho inválido.");
  const id = await subscriptionId(body.endpoint);
  if (!id) return NextResponse.json({ ok: true });
  let query = adminDb()!.from("price_watches").delete().eq("subscription_id", id);
  if (body.path) query = query.eq("product_path", body.path);
  await query;
  return NextResponse.json({ ok: true });
}
