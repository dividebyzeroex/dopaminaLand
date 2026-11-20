import { NextRequest, NextResponse } from "next/server";
import { adminDb, alertsAvailable, sendPush, type StoredSubscription } from "@/lib/push";
import { getProduct } from "@/lib/buscape";
import { mapLimit } from "@/lib/analysis";
import { alertMessage, decideAlert } from "@/lib/alert-rules";

/**
 * Checagem dos alertas. Chamada pela Vercel Cron (vercel.json) com
 * `Authorization: Bearer $CRON_SECRET`; pode ser chamada por outro agendador
 * com o mesmo cabeçalho para rodar com mais frequência.
 */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type WatchRow = {
  id: number; product_path: string; product_name: string | null;
  notify_drop: boolean; notify_rise: boolean; notify_stable: boolean;
  last_price: number | null; last_change_at: string; last_notified_at: string | null;
  push_subscriptions: StoredSubscription & { disabled_at: string | null };
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!alertsAvailable()) return NextResponse.json({ ok: false, error: "alertas não configurados" }, { status: 503 });

  const db = adminDb()!;
  const { data, error } = await db.from("price_watches")
    .select("id, product_path, product_name, notify_drop, notify_rise, notify_stable, last_price, last_change_at, last_notified_at, push_subscriptions!inner(id, endpoint, p256dh, auth, disabled_at)")
    .is("push_subscriptions.disabled_at", null)
    .limit(5000);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const watches = (data ?? []) as unknown as WatchRow[];

  // Um preço por produto, mesmo que muita gente acompanhe o mesmo item.
  const paths = [...new Set(watches.map(w => w.product_path))];
  const prices = new Map<string, number>();
  await mapLimit(paths, 2, async path => {
    const product = await getProduct(path).catch(() => null);
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
    }, price, now);

    if (decision.kind) {
      const stableDays = (now.getTime() - Date.parse(w.last_change_at)) / 86400000;
      const msg = alertMessage(decision.kind, w.product_name ?? "Produto", price, previous, decision.change, stableDays);
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
    }).eq("id", w.id);
  });

  return NextResponse.json({ ok: true, ...stats });
}
