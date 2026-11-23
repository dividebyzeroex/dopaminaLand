import { NextRequest, NextResponse } from "next/server";
import { adminDb, alertsAvailable, sendPush, type StoredSubscription } from "@/lib/push";
import { getProductFresh } from "@/lib/buscape";
import { mapLimit } from "@/lib/analysis";
import { alertMessage, decideAlert } from "@/lib/alert-rules";
import { runTrendingDigest } from "@/lib/trending-digest";
import { runDirectWatches } from "@/lib/raiox-watch";

/**
 * Checagem horária dos alertas: consulta o preço de cada produto acompanhado
 * (cache de 1 hora) e manda push para quem deve ser avisado, mesmo com o app
 * fechado. Chamada a cada hora pelo agendador do Supabase (pg_cron + pg_net,
 * migration 005) com `Authorization: Bearer $CRON_SECRET`.
 *
 * Nas horas de destaque (10h, 13h, 16h e 19h de São Paulo) também manda os
 * destaques de queda dos produtos mais buscados (lib/trending-digest.ts).
 * `?destaques=agora` força essa etapa fora do horário, para testar.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type WatchRow = {
  id: number; product_path: string; product_name: string | null;
  notify_drop: boolean; notify_rise: boolean; notify_stable: boolean;
  last_price: number | null; last_change_at: string; last_notified_at: string | null;
  target_price: number | null; target_hit_at: string | null;
  push_subscriptions: StoredSubscription & { disabled_at: string | null };
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!alertsAvailable()) return NextResponse.json({ ok: false, error: "alertas não configurados" }, { status: 503 });

  const db = adminDb()!;
  const { data, error } = await db.from("price_watches")
    .select("id, product_path, product_name, notify_drop, notify_rise, notify_stable, last_price, last_change_at, last_notified_at, target_price, target_hit_at, push_subscriptions!inner(id, endpoint, p256dh, auth, disabled_at)")
    .is("push_subscriptions.disabled_at", null)
    .limit(5000);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const watches = (data ?? []) as unknown as WatchRow[];

  // Um preço por produto, mesmo que muita gente acompanhe o mesmo item.
  const paths = [...new Set(watches.map(w => w.product_path))];
  const prices = new Map<string, number>();
  await mapLimit(paths, 2, async path => {
    const product = await getProductFresh(path).catch(() => null);
    if (product?.bestPrice) prices.set(path, product.bestPrice);
  });

  const now = new Date();
  const stats = { watches: watches.length, products: paths.length, priced: prices.size, sent: 0, gone: 0, failed: 0 };
  await mapLimit(watches, 10, async w => {
    const price = prices.get(w.product_path);
    if (!price) return;
    const previous = Number(w.last_price ?? price);
    const decision = decideAlert({
      notifyDrop: w.notify_drop, notifyRise: w.notify_rise, notifyStable: w.notify_stable,
      lastPrice: previous, lastChangeAt: w.last_change_at, lastNotifiedAt: w.last_notified_at,
      targetPrice: w.target_price === null ? null : Number(w.target_price), targetHitAt: w.target_hit_at,
    }, price, now);

    if (decision.kind) {
      const stableDays = (now.getTime() - Date.parse(w.last_change_at)) / 86400000;
      const msg = alertMessage(decision.kind, w.product_name ?? "Produto", price, previous, decision.change, stableDays, w.target_price === null ? null : Number(w.target_price));
      const result = await sendPush(w.push_subscriptions, { ...msg, url: `/produto/${w.product_path}?origem=alerta`, tag: `preco-${w.product_path}` });
      if (result === "gone") {
        stats.gone++;
        await db.from("push_subscriptions").update({ disabled_at: now.toISOString() }).eq("id", w.push_subscriptions.id);
        return;
      }
      if (result !== "sent") { stats.failed++; return; }
      stats.sent++;
    }
    await db.from("price_watches").update({
      last_price: decision.next.lastPrice, last_change_at: decision.next.lastChangeAt, last_notified_at: decision.next.lastNotifiedAt,
      target_hit_at: decision.next.targetHitAt,
    }).eq("id", w.id);
  });

  // Destaques de queda dos mais buscados. Falha aqui não derruba os alertas acima.
  const force = req.nextUrl.searchParams.get("destaques") === "agora";
  const digest = await runTrendingDigest(db, now, { force }).catch(e => ({ ran: false, reason: e instanceof Error ? e.message : "erro" }));

  // Alertas pedidos pelo Direct (bot Raio-X). Também isolados: falha aqui não derruba o resto.
  const direct = await runDirectWatches(db, now).catch(e => ({ ran: false, reason: e instanceof Error ? e.message : "erro" }));

  return NextResponse.json({ ok: true, ...stats, digest, direct });
}
