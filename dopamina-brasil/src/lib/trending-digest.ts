import type { SupabaseClient } from "@supabase/supabase-js";
import { getProductFresh } from "./buscape";
import { mapLimit } from "./analysis";
import { computeVerdict } from "./price-verdict";
import { trendingEntries } from "./trending";
import { activeEvent } from "./events";
import { sendPush, type StoredSubscription } from "./push";
import {
  canRepeat, deviceCanReceive, digestMessage, isDigestHour, isNotableDrop, pickForDevice, recentDrop,
  type DropItem, type Notice,
} from "./drop-digest";

/**
 * Destaques de queda dos produtos mais buscados (regras em drop-digest.ts).
 * Roda dentro da checagem horária (/api/cron/price-watch) nas horas de destaque.
 * Precisa da migration 006; sem ela, só registra que está pendente.
 */

type SubRow = StoredSubscription & { last_trending_at: string | null };

export type DigestStats = {
  ran: boolean;
  reason?: string;
  devices?: number;
  products?: number;
  drops?: { path: string; change: number; verdict: string }[];
  sent?: number;
  gone?: number;
  failed?: number;
};

export async function runTrendingDigest(db: SupabaseClient, now: Date, options: { force?: boolean } = {}): Promise<DigestStats> {
  if (!options.force && !isDigestHour(now)) return { ran: false, reason: "fora do horário de destaques" };

  const { data: subs, error } = await db.from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, last_trending_at")
    .is("disabled_at", null)
    .eq("notify_trending", true)
    .limit(5000);
  if (error) return { ran: false, reason: "migration 006 pendente" };
  const devices = ((subs ?? []) as SubRow[]).filter(s => deviceCanReceive(s.last_trending_at, now));
  if (!devices.length) return { ran: false, reason: "nenhum aparelho para avisar agora", devices: 0 };

  // Só o que é de fato "mais buscado": buscas no Dopamina e populares do mercado.
  const entries = (await trendingEntries(activeEvent()?.event ?? null, now).catch(() => []))
    .filter(e => e.source === "dopamina" || e.source === "buscape");
  const paths = [...new Set(entries.map(e => e.path))];

  const { data: noticeRows } = await db.from("trending_drop_notices").select("product_path, price, notified_at").in("product_path", paths.length ? paths : ["-"]);
  const notices = new Map<string, Notice>((noticeRows ?? []).map(n => [n.product_path as string, { price: Number(n.price), notifiedAt: n.notified_at as string }]));

  const today = now.toISOString().slice(0, 10);
  const drops: DropItem[] = [];
  await mapLimit(paths, 2, async path => {
    const product = await getProductFresh(path).catch(() => null);
    if (!product?.bestPrice || product.adult) return;
    const verdict = computeVerdict(product.history, product.bestPrice, today);
    const { reference, change } = recentDrop(product.history, product.bestPrice, today);
    if (!reference || !isNotableDrop(verdict.kind, change) || !canRepeat(notices.get(product.path), product.bestPrice, now)) return;
    drops.push({ path: product.path, name: product.name, price: product.bestPrice, reference, change, verdict: verdict.kind, days: verdict.days });
  });
  const base = { devices: devices.length, products: paths.length, drops: drops.map(d => ({ path: d.path, change: Number(d.change.toFixed(4)), verdict: d.verdict })) };
  if (!drops.length) return { ran: true, reason: "nenhuma queda relevante", ...base, sent: 0 };

  const { data: watchRows } = await db.from("price_watches").select("subscription_id, product_path").in("subscription_id", devices.map(d => d.id));
  const watched = new Map<string, Set<string>>();
  for (const w of watchRows ?? []) {
    const set = watched.get(w.subscription_id as string) ?? new Set<string>();
    set.add(w.product_path as string);
    watched.set(w.subscription_id as string, set);
  }

  const stats = { sent: 0, gone: 0, failed: 0 };
  const recipients = new Map<string, number>();
  await mapLimit(devices, 10, async device => {
    const items = pickForDevice(drops, watched.get(device.id) ?? new Set());
    if (!items.length) return;
    const msg = digestMessage(items);
    const result = await sendPush(device, { ...msg, kind: "destaques" });
    if (result === "gone") {
      stats.gone++;
      await db.from("push_subscriptions").update({ disabled_at: now.toISOString() }).eq("id", device.id);
      return;
    }
    if (result !== "sent") { stats.failed++; return; }
    stats.sent++;
    items.forEach(i => recipients.set(i.path, (recipients.get(i.path) ?? 0) + 1));
    await db.from("push_subscriptions").update({ last_trending_at: now.toISOString() }).eq("id", device.id);
  });

  // Registra só o que chegou a alguém, para a regra de não repetir por 7 dias.
  const sentDrops = drops.filter(d => recipients.has(d.path));
  if (sentDrops.length) {
    await db.from("trending_drop_notices").upsert(sentDrops.map(d => ({
      product_path: d.path, product_name: d.name, price: d.price, previous_price: d.reference,
      verdict: d.verdict, notified_at: now.toISOString(), recipients: recipients.get(d.path) ?? 0,
    })), { onConflict: "product_path" });
  }

  return { ran: true, ...base, ...stats };
}
