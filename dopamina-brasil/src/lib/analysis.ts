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
  // Conteúdo adulto marcado pela fonte não aparece no site (página, termômetro, busca).
  if (!product || product.adult) return null;
  const stored = await loadStoredHistory(product.sourceId, product.history[0]?.date).catch(() => []);
  const history = [...stored, ...product.history];
  return { product, history, verdict: computeVerdict(history, product.bestPrice) };
}

/** Limita quantas tarefas rodam ao mesmo tempo; cada chamada devolve a sua própria promessa. */
export function createLimiter(limit: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const release = () => { active--; queue.shift()?.(); };
  return function run<R>(fn: () => Promise<R>): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const start = () => { active++; fn().then(resolve, reject).finally(release); };
      if (active < limit) start(); else queue.push(start);
    });
  };
}

/** Veredito de um resultado de busca. null = conteúdo adulto marcado pela fonte (fica de fora). */
export async function analyzeHit(hit: SearchHit): Promise<AnalyzedHit | null> {
  if (!hit.path) return { hit, product: null, verdict: null };
  const product = await getProduct(hit.path).catch(() => null);
  if (product?.adult) return null;
  const analysis = product ? await analyzeProduct(hit.path).catch(() => null) : null;
  return { hit, product: analysis?.product ?? null, verdict: analysis?.verdict ?? null };
}

/**
 * Busca em duas etapas: a lista sai na hora e o veredito dos primeiros `detailed`
 * resultados chega depois, um a um (a página mostra cada card assim que fica pronto).
 * Concorrência baixa de propósito: a fonte bloqueia rajadas de requisições.
 */
export async function startSearch(query: string, detailed = 6) {
  const hits = (await searchProducts(query.toLowerCase())).slice(0, 16);
  const toDetail = new Set(hits.filter(hit => hit.path).slice(0, detailed).map(hit => hit.path));
  const run = createLimiter(2);
  const pending = hits.map(hit => (hit.path && toDetail.has(hit.path) ? run(() => analyzeHit(hit)) : null));
  return { hits, pending };
}

/** Versão completa (espera todos os vereditos), usada por relatórios e APIs. */
export async function analyzeSearch(query: string, detailed = 6): Promise<AnalyzedHit[]> {
  const { hits, pending } = await startSearch(query, detailed);
  const results = await Promise.all(hits.map((hit, i) => pending[i] ?? Promise.resolve<AnalyzedHit>({ hit, product: null, verdict: null })));
  return results.filter((entry): entry is AnalyzedHit => entry !== null);
}
