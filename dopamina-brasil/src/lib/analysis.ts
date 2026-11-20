import { getProduct, searchProducts, type ProductDetail, type SearchHit } from "./buscape";
import { loadStoredHistory } from "./price-store";
import { computeVerdict, type Verdict } from "./price-verdict";

export type AnalyzedHit = { hit: SearchHit; product: ProductDetail | null; verdict: Verdict | null };

/** Executa tarefas assíncronas com concorrência limitada (não sobrecarrega a fonte). */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Produto + histórico completo (fonte + o que já gravamos antes da janela da fonte) + veredito. */
export async function analyzeProduct(path: string): Promise<{ product: ProductDetail; history: ProductDetail["history"]; verdict: Verdict } | null> {
  const product = await getProduct(path).catch(() => null);
  if (!product) return null;
  const stored = await loadStoredHistory(product.sourceId, product.history[0]?.date).catch(() => []);
  const history = [...stored, ...product.history];
  return { product, history, verdict: computeVerdict(history, product.bestPrice) };
}

/**
 * Busca e calcula o veredito dos primeiros `detailed` resultados que têm página de produto.
 * Concorrência baixa de propósito: a fonte bloqueia rajadas de requisições.
 */
export async function analyzeSearch(query: string, detailed = 6): Promise<AnalyzedHit[]> {
  const hits = (await searchProducts(query.toLowerCase())).slice(0, 16);
  const toDetail = new Set(hits.filter(hit => hit.path).slice(0, detailed).map(hit => hit.path));
  return mapLimit(hits, 2, async hit => {
    if (!hit.path || !toDetail.has(hit.path)) return { hit, product: null, verdict: null };
    const analysis = await analyzeProduct(hit.path);
    return { hit, product: analysis?.product ?? null, verdict: analysis?.verdict ?? null };
  });
}
