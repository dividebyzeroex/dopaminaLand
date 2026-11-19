import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import { recordPriceHistory } from "./price-store";

/**
 * Leitura de dados públicos do Buscapé.
 *
 * Preferimos o JSON estruturado que a própria página entrega (`__NEXT_DATA__`) ao
 * HTML dos cards: é mais estável e traz loja, número de ofertas, nota e o
 * histórico diário de menor preço (~40 dias). Se o JSON mudar, caímos para a
 * leitura dos cards. Nada aqui inventa preço: um campo ausente vira `null`.
 */

const ORIGIN = "https://www.buscape.com.br";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TIMEOUT_MS = 8000;

export type SearchHit = {
  /** Caminho do produto no Buscapé, ex.: "celular/smartphone-apple-iphone-15-128gb". Também é o nosso slug. */
  path: string | null;
  name: string;
  price: number;
  image?: string;
  storeCount: number | null;
  rating: number | null;
  reviews: number | null;
  category: string | null;
  /** Loja, quando o resultado é uma oferta avulsa (sem página de produto/histórico). */
  store: string | null;
  cashback: number | null;
  /** Link externo (fonte) para conferir o resultado. */
  sourceUrl: string;
};

export type Offer = {
  id: string;
  store: string;
  price: number;
  installments: number | null;
  installmentValue: number | null;
  marketplace: boolean;
  logo?: string;
  /** Redirecionamento do Buscapé para a loja. Substituir por link de afiliado próprio na Fase 1. */
  url: string;
};

export type HistoryPoint = { date: string; price: number };

export type ProductDetail = {
  path: string;
  sourceId: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  image?: string;
  rating: number | null;
  description: string | null;
  bestPrice: number | null;
  bestStore: string | null;
  offerCount: number | null;
  storeCount: number | null;
  offers: Offer[];
  history: HistoryPoint[];
  sourceUrl: string;
  checkedAt: string;
};

const SAFE_PATH = /^[a-z0-9-]+(?:\/[a-z0-9-]+){1,3}$/;

export function isSafeProductPath(path: string): boolean {
  return SAFE_PATH.test(path) && path.length <= 220;
}

export function productHref(path: string) {
  return `/produto/${path}`;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR,pt;q=0.9" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Fonte respondeu ${res.status}`);
  return res.text();
}

function nextData(html: string): Record<string, unknown> | null {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

const num = (value: unknown): number | null => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};
const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value.trim().replace(/\s+/g, " ") : null);

function httpsImage(value?: string | null): string | undefined {
  if (!value || value.startsWith("data:")) return undefined;
  try {
    const url = new URL(value, ORIGIN);
    return url.protocol === "https:" ? url.href : undefined;
  } catch { return undefined; }
}

function pathFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const path = new URL(url, ORIGIN).pathname.replace(/^\/+|\/+$/g, "");
    return isSafeProductPath(path) ? path : null;
  } catch { return null; }
}

function parsePriceText(raw: string): number {
  // "R$ 3.779,10" -> 3779.10. Pega apenas o primeiro valor do texto.
  const match = raw.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?/);
  if (!match) return 0;
  return Number(match[0].replace(/\./g, "").replace(",", ".")) || 0;
}

function hitsFromJson(data: Json): SearchHit[] | null {
  const hits = data?.props?.initialReduxState?.hits?.hits;
  if (!Array.isArray(hits)) return null;
  const seen = new Set<string>();
  return hits.flatMap((hit: Json): SearchHit[] => {
    const name = text(hit?.name);
    const price = num(hit?.price);
    if (!name || !price || price <= 0) return [];
    const path = hit?.type === "product" ? pathFromUrl(hit?.url) : null;
    const source = typeof hit?.url === "string" ? new URL(hit.url, ORIGIN).href : ORIGIN;
    // A fonte repete a mesma oferta várias vezes (mesmo título e preço, vendedores diferentes).
    const key = path ?? `${name.toLowerCase()}|${price}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      path,
      name,
      price,
      image: httpsImage(hit?.image),
      storeCount: num(hit?.storeCount),
      rating: num(hit?.preciseRating) ?? null,
      reviews: num(hit?.countOfComments),
      category: text(hit?.categoryName),
      store: path ? null : text(hit?.merchantName ?? hit?.bestOffer?.merchantName),
      cashback: num(hit?.cashback?.cashbackValue),
      sourceUrl: source,
    }];
  });
}

function hitsFromCards(html: string): SearchHit[] {
  const $ = cheerio.load(html);
  const out: SearchHit[] = [];
  $('[data-testid="product-card::card"]').each((_, el) => {
    const card = $(el);
    const name = text(card.find('[data-testid="product-card::name"]').text());
    const price = parsePriceText(card.find('[data-testid="product-card::price"]').text());
    const href = card.attr("href");
    if (!name || !price || !href) return;
    const img = card.find("img").first();
    out.push({
      path: pathFromUrl(href),
      name,
      price,
      image: httpsImage(img.attr("data-src") || img.attr("src")),
      storeCount: null,
      rating: null,
      reviews: null,
      category: null,
      store: null,
      cashback: null,
      sourceUrl: new URL(href, ORIGIN).href,
    });
  });
  return out;
}

async function searchUncached(query: string): Promise<SearchHit[]> {
  const html = await fetchHtml(`${ORIGIN}/search?q=${encodeURIComponent(query)}`);
  const data = nextData(html);
  const hits = (data && hitsFromJson(data)) || hitsFromCards(html);
  return rankHits(query, hits).slice(0, 24);
}

export const foldText = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const ACCESSORY = /\b(?:peliculas?|capas?|capinhas?|cases?|carregador(?:es)?|cabos?|suportes?|adesivos?|skins?|protetor(?:es)?|bolsas?|pulseiras?|refis|refil|controle remoto|kit limpeza)\b/;

/**
 * Reordena por aderência ao termo: a fonte às vezes coloca acessórios (película, capa)
 * à frente do produto buscado. Mantém a ordem original como critério de desempate.
 */
export function rankHits(query: string, hits: SearchHit[]): SearchHit[] {
  const q = foldText(query);
  const tokens = q.split(/[^a-z0-9]+/).filter(t => t.length >= 2);
  const wantsAccessory = ACCESSORY.test(q);
  return hits
    .map((hit, index) => {
      const name = foldText(hit.name);
      const match = tokens.length ? tokens.filter(t => name.includes(t)).length / tokens.length : 0;
      const accessory = !wantsAccessory && ACCESSORY.test(name) ? 1 : 0;
      return { hit, index, score: match - accessory + (hit.path ? 0.15 : 0) };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.hit);
}

function offersFromJson(state: Json): Offer[] {
  const list: Json[] = Array.isArray(state?.offers?.displayOffers) ? state.offers.displayOffers : [];
  const seen = new Set<string>();
  return list.flatMap((offer): Offer[] => {
    const id = text(String(offer?.id ?? ""));
    const price = num(offer?.price);
    const store = text(offer?.sellerName);
    if (!id || !price || price <= 0 || !store || seen.has(id) || !/^\d+$/.test(id)) return [];
    seen.add(id);
    const parcels = num(offer?.numParcels);
    return [{
      id,
      store,
      price,
      installments: parcels && parcels > 1 ? parcels : null,
      installmentValue: parcels && parcels > 1 ? num(offer?.parcelValue) : null,
      marketplace: Boolean(offer?.sellerIsMarketplace),
      logo: httpsImage(offer?.sellerRoundedLogoURL),
      url: `${ORIGIN}/lead?oid=${id}&channel=1`,
    }];
  }).sort((a, b) => a.price - b.price);
}

function historyFromJson(state: Json, sourceId: string | null): HistoryPoint[] {
  const all = state?.priceHistory?.priceHistory;
  if (!all || typeof all !== "object") return [];
  const series: Json = (sourceId && all[sourceId]) || Object.values(all)[0];
  const days: Json[] = Array.isArray(series?.days) ? series.days : [];
  const byDate = new Map<string, number>();
  for (const day of days) {
    const date = typeof day?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day.date) ? day.date : null;
    const price = num(day?.price);
    if (!date || !price || price <= 0) continue;
    byDate.set(date, Math.min(price, byDate.get(date) ?? Infinity));
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, price]) => ({ date, price }));
}

async function productUncached(path: string): Promise<ProductDetail | null> {
  if (!isSafeProductPath(path)) return null;
  const sourceUrl = `${ORIGIN}/${path}`;
  const html = await fetchHtml(sourceUrl);
  const data: Json = nextData(html);
  const state = data?.props?.initialReduxState;
  const product = state?.products?.product;
  const info = product?.product;
  const name = text(info?.name);
  if (!state || !name) return null;

  const sourceId = text(String(info?.id ?? state?.offers?.currentProductID ?? ""));
  const offers = offersFromJson(state);
  const best = state?.offers?.bestOffer;
  const bestPrice = num(best?.price) ?? offers[0]?.price ?? null;
  const history = historyFromJson(state, sourceId);
  const image = httpsImage(best?.imageUrl) ?? httpsImage(state?.offers?.displayOffers?.[0]?.imageUrl);

  const detail: ProductDetail = {
    path,
    sourceId,
    name,
    brand: text(product?.brand?.name ?? product?.brandOfProduct?.name ?? (typeof product?.brand === "string" ? product.brand : null)),
    category: text(product?.categoryName),
    image,
    rating: num(info?.rating),
    description: text(info?.description),
    bestPrice: bestPrice && bestPrice > 0 ? bestPrice : null,
    bestStore: text(best?.sellerName) ?? offers[0]?.store ?? null,
    offerCount: num(state?.offers?.countOfOffers),
    storeCount: num(state?.offers?.countOfStores),
    offers,
    history,
    sourceUrl,
    checkedAt: new Date().toISOString(),
  };

  // Guarda a série no nosso banco para formar histórico próprio além dos 40 dias da fonte.
  await recordPriceHistory(detail).catch(() => undefined);
  return detail;
}

/** Busca com cache de 1 hora por termo (normalizado). */
export const searchProducts = unstable_cache(
  async (query: string) => searchUncached(query),
  ["buscape-search-v3"],
  { revalidate: 3600 },
);

/** Detalhe de produto com cache de 3 horas. */
export const getProduct = unstable_cache(
  async (path: string) => productUncached(path),
  ["buscape-product-v2"],
  { revalidate: 10800 },
);

export function normalizeQuery(input: string): string {
  return input.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 120);
}

/** Converte uma URL colada (de qualquer loja) em termo de busca. */
export function queryFromUrl(inputUrl: string): string | null {
  try {
    const parsed = new URL(inputUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const candidate = parts.reduce((best, part) => (part.length > best.length ? part : best), "");
    const clean = decodeURIComponent(candidate)
      .replace(/\.html?$/i, "")
      .replace(/[-_+]/g, " ")
      .replace(/\b(dp|p|pd|produto|mlb\d+)\b/gi, "")
      .replace(/\b[A-Z0-9]{10}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length >= 3 ? clean.slice(0, 120) : null;
  } catch { return null; }
}
