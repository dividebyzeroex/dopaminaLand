import type { SupabaseClient } from "@supabase/supabase-js";
import { getProduct } from "./buscape";
import { computeVerdict, decisionOf } from "./price-verdict";
import { mapLimit } from "./analysis";
import { buildTargetReply } from "./raiox-reply";
import { sendDirect } from "./zernio";

/**
 * Alertas pedidos pelo Direct ("avisar", "meta 1500"). A checagem roda junto da
 * checagem horária de preços. O Instagram só permite mensagem dentro de ~24h da
 * última mensagem da pessoa: se o envio for recusado, o aviso fica guardado e
 * é entregue quando ela escrever de novo (flushConversation).
 */
export type DirectWatch = {
  id: number; account_id: string; conversation_id: string; product_path: string; product_name: string | null;
  target_price: number; hit_at: string | null; hit_price: number | null; delivered_at: string | null; attempts: number;
};
const COLUMNS = "id, account_id, conversation_id, product_path, product_name, target_price, hit_at, hit_price, delivered_at, attempts";
const MAX_ATTEMPTS = 30;

async function deliver(db: SupabaseClient, w: DirectWatch, now: Date): Promise<boolean> {
  const detail = await getProduct(w.product_path).catch(() => null);
  const price = detail?.bestPrice ?? Number(w.hit_price);
  if (!(price > 0)) return false;
  const verdict = detail ? computeVerdict(detail.history, price) : null;
  const text = buildTargetReply({
    name: detail?.name ?? w.product_name ?? "Produto", price, productPath: w.product_path, now, target: Number(w.target_price),
    decision: decisionOf(verdict?.kind ?? "insuficiente"),
    headline: verdict?.headline ?? "Ainda não há histórico suficiente para um veredito.",
    detail: verdict?.detail ?? "", days: verdict?.days ?? 0,
  });
  const result = await sendDirect(w.conversation_id, w.account_id, text, `watch-${w.id}`);
  await db.from("raiox_watches").update(result.ok
    ? { delivered_at: now.toISOString(), last_error: null, attempts: w.attempts + 1 }
    : { attempts: w.attempts + 1, last_error: `${result.status} ${result.error ?? ""}`.slice(0, 200) }).eq("id", w.id);
  return result.ok;
}

export async function runDirectWatches(db: SupabaseClient, now: Date) {
  const { data, error } = await db.from("raiox_watches").select(COLUMNS)
    .is("stopped_at", null).is("delivered_at", null).gt("expires_at", now.toISOString()).lt("attempts", MAX_ATTEMPTS).limit(2000);
  if (error) return { ran: false, reason: error.message };
  const watches = (data ?? []) as DirectWatch[];
  const paths = [...new Set(watches.filter(w => !w.hit_at).map(w => w.product_path))];
  const prices = new Map<string, number>();
  await mapLimit(paths, 2, async path => {
    const product = await getProduct(path).catch(() => null);
    if (product?.bestPrice) prices.set(path, product.bestPrice);
  });
  const stats = { ran: true, open: watches.length, hit: 0, delivered: 0 };
  await mapLimit(watches, 5, async w => {
    let current = w;
    if (!w.hit_at) {
      const price = prices.get(w.product_path);
      if (!price || price > Number(w.target_price)) return;
      current = { ...w, hit_at: now.toISOString(), hit_price: price };
      await db.from("raiox_watches").update({ hit_at: current.hit_at, hit_price: price }).eq("id", w.id);
      stats.hit++;
    }
    if (await deliver(db, current, now)) stats.delivered++;
  });
  return stats;
}

/** A pessoa escreveu de novo: a janela de mensagens reabriu, entrega o que ficou pendente. */
export async function flushConversation(db: SupabaseClient, conversationId: string, now = new Date()) {
  const { data } = await db.from("raiox_watches").select(COLUMNS)
    .eq("conversation_id", conversationId).not("hit_at", "is", null)
    .is("stopped_at", null).is("delivered_at", null).gt("expires_at", now.toISOString()).limit(5);
  for (const w of (data ?? []) as DirectWatch[]) await deliver(db, w, now);
}
