import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { HistoryPoint, ProductDetail } from "./buscape";

/**
 * Persistência do histórico de preços (tabela `price_observations`, migration 002).
 *
 * Cada consulta a um produto grava a série diária de menor preço. Com o tempo isso
 * forma um histórico próprio, maior que os ~40 dias que a fonte mostra.
 * Tudo aqui é "melhor esforço": sem credenciais ou sem a tabela, o site segue funcionando.
 */

const clients: Partial<Record<"write" | "read", SupabaseClient | null>> = {};

/** Escrita exige a service role (a tabela não aceita INSERT público). Leitura aceita a chave pública. */
function db(mode: "write" | "read" = "write"): SupabaseClient | null {
  if (clients[mode] !== undefined) return clients[mode]!;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (mode === "read" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);
  clients[mode] = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return clients[mode]!;
}

const SOURCE = "buscape";

export async function recordPriceHistory(product: ProductDetail): Promise<void> {
  const supabase = db();
  if (!supabase || !product.sourceId) return;
  const today = new Date().toISOString().slice(0, 10);
  const points: HistoryPoint[] = [...product.history];
  if (product.bestPrice && !points.some(p => p.date === today)) points.push({ date: today, price: product.bestPrice });
  if (!points.length) return;

  const rows = points.map(point => ({
    source: SOURCE,
    product_id: product.sourceId,
    product_path: product.path,
    product_name: product.name,
    day: point.date,
    price: point.price,
    store: point.date === today ? product.bestStore : null,
  }));
  const { error } = await supabase.from("price_observations").upsert(rows, { onConflict: "source,product_id,day" });
  if (error) console.warn("price_observations:", error.message);
}

/** Pontos guardados antes da janela que a fonte informa (para estender o gráfico). */
export async function loadStoredHistory(sourceId: string | null, before: string | undefined): Promise<HistoryPoint[]> {
  const supabase = db("read");
  if (!supabase || !sourceId || !before) return [];
  const { data, error } = await supabase
    .from("price_observations")
    .select("day, price")
    .eq("source", SOURCE)
    .eq("product_id", sourceId)
    .lt("day", before)
    .order("day", { ascending: true })
    .limit(400);
  if (error || !data) return [];
  return data.flatMap(row => {
    const price = Number(row.price);
    return typeof row.day === "string" && Number.isFinite(price) && price > 0 ? [{ date: row.day, price }] : [];
  });
}

/** Produtos consultados recentemente, para o sitemap. */
export async function recentProductPaths(limit = 500): Promise<{ path: string; day: string }[]> {
  const supabase = db("read");
  if (!supabase) return [];
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("price_observations")
    .select("product_path, day")
    .gte("day", since)
    .order("day", { ascending: false })
    .limit(limit * 10);
  if (error || !data) return [];
  const seen = new Map<string, string>();
  for (const row of data) if (row.product_path && !seen.has(row.product_path)) seen.set(row.product_path, row.day);
  return [...seen.entries()].slice(0, limit).map(([path, day]) => ({ path, day }));
}
