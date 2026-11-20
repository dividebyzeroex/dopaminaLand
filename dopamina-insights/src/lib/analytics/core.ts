/**
 * Núcleo de métricas do painel. Funções puras: recebem linhas de `intent_events`/`sessions`
 * e devolvem agregados prontos para a interface. Sem dependência de Next ou Supabase,
 * para rodar nos testes com `node --experimental-strip-types`.
 *
 * Definições (as mesmas mostradas no painel):
 * - Visitante: um navegador (`session_id`, guardado no localStorage do site).
 * - Visita: sequência de eventos do mesmo visitante sem pausa maior que 30 min.
 * - Busca: termo pesquisado. Junta o envio (`super_search`) e a página de resultados
 *   (`search_results`) do mesmo termo na mesma visita em até 3 min.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Meta = Record<string, any>;

export type RawEvent = {
  id: number;
  session_id: string;
  event_type: string;
  product_id: string | null;
  price_displayed: number | string | null;
  metadata: Meta | null;
  created_at: string;
};

export type RawSession = { session_id: string; started_at: string | null; device_info: Meta | null };

export const TZ = 'America/Sao_Paulo';
export const VISIT_GAP_MS = 30 * 60 * 1000;
const SEARCH_MERGE_MS = 3 * 60 * 1000;
const SEARCH_TO_PRODUCT_MS = 15 * 60 * 1000;

/** Eventos de alto volume que não entram nos relatórios (só servem para presença no "Ao vivo"). */
export const NOISE_EVENTS = ['heatmap_move', 'heatmap_click', 'element_visible'];

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp\/|vercel-screenshot/i;

/* ───────────────────────── helpers de tempo ───────────────────────── */

const partsFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
});

export function localParts(ts: number) {
  const p: Record<string, string> = {};
  for (const part of partsFmt.formatToParts(new Date(ts))) p[part.type] = part.value;
  const hour = Number(p.hour) % 24;
  return { day: `${p.year}-${p.month}-${p.day}`, hour, minute: Number(p.minute), weekday: p.weekday };
}

/** Início do dia de hoje em São Paulo (UTC-3, sem horário de verão desde 2019). */
export function startOfLocalDay(ts: number) {
  const { day } = localParts(ts);
  return Date.parse(`${day}T00:00:00-03:00`);
}

export type RangeKey = 'today' | '24h' | '7d' | '30d' | '90d';
export const RANGE_KEYS: RangeKey[] = ['today', '24h', '7d', '30d', '90d'];

export function resolveRange(key: RangeKey, now = Date.now()) {
  const hour = 3600_000;
  const day = 24 * hour;
  let from: number;
  switch (key) {
    case 'today': from = startOfLocalDay(now); break;
    case '24h': from = now - day; break;
    case '7d': from = now - 7 * day; break;
    case '30d': from = now - 30 * day; break;
    case '90d': from = now - 90 * day; break;
  }
  const span = now - from;
  return { key, from, to: now, prevFrom: from - span, prevTo: from, bucket: span <= 2 * day ? 'hour' as const : 'day' as const };
}

/* ───────────────────────── normalização ───────────────────────── */

export function foldTerm(term: string) {
  return term.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function decode(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  try { return decodeURIComponent(value); } catch { return value; }
}

function hostOf(url: unknown) {
  if (typeof url !== 'string' || !url) return '';
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

const OWN_HOSTS = /(^|\.)dopaminado\.com\.br$|(^|\.)dopamina|vercel\.app$|localhost/;

/** Origem legível de uma visita, a partir de UTM, referrer e navegador embutido. */
export function classifySource(input: { utm?: string; referrer?: string; browser?: string }) {
  const utm = (input.utm || '').trim();
  if (utm) return utm.charAt(0).toUpperCase() + utm.slice(1).toLowerCase();
  const host = hostOf(input.referrer);
  const browser = (input.browser || '').toLowerCase();
  if (host.includes('instagram') || browser === 'instagram') return 'Instagram';
  if (host.includes('facebook') || host === 'fb.com' || host.startsWith('lm.facebook') || browser === 'facebook') return 'Facebook';
  if (host.includes('whatsapp') || host === 'wa.me') return 'WhatsApp';
  if (host.includes('tiktok') || browser === 'tiktok') return 'TikTok';
  if (host.includes('google')) return 'Google';
  if (/bing\.|duckduckgo|yahoo|ecosia|brave/.test(host)) return 'Outros buscadores';
  if (host === 't.co' || host.includes('twitter') || host === 'x.com') return 'X / Twitter';
  if (host.includes('youtube')) return 'YouTube';
  if (host.includes('reddit')) return 'Reddit';
  if (host.includes('threads')) return 'Threads';
  if (host === 'vercel.com') return 'Vercel (prévia/testes)';
  if (!host || OWN_HOSTS.test(host)) return 'Direto';
  return host;
}

export type Visitor = {
  id: string;
  firstSeen: number | null;
  device: string;
  os: string;
  browser: string;
  city: string;
  region: string;
  country: string;
  referrer: string;
  utm: string;
  isBot: boolean;
};

export function toVisitor(session: RawSession | undefined, id: string): Visitor {
  const info = session?.device_info || {};
  const clean = (v: unknown) => { const s = decode(v); return !s || s === 'Desconhecido' || s === 'Unknown' ? '' : s; };
  const deviceType = clean(info.device_type);
  return {
    id,
    firstSeen: session?.started_at ? Date.parse(session.started_at) : null,
    device: deviceType === 'mobile' ? 'Celular' : deviceType === 'tablet' ? 'Tablet' : deviceType ? 'Computador' : 'Desconhecido',
    os: clean(info.os_name) || 'Desconhecido',
    browser: clean(info.browser_name) || 'Desconhecido',
    city: clean(info.city),
    region: clean(info.state),
    country: clean(info.country),
    referrer: typeof info.referrer === 'string' ? info.referrer : '',
    utm: typeof info.utm_source === 'string' ? info.utm_source : '',
    isBot: BOT_UA.test(String(info.userAgent || '')),
  };
}

export function placeOf(v: Visitor) {
  if (v.country && v.country !== 'BR') return [v.city, v.country].filter(Boolean).join(', ') || 'Exterior';
  return [v.city, v.region].filter(Boolean).join(' · ') || 'Local desconhecido';
}

function num(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

export function prettifySlug(path: string) {
  const last = decode(path).split('/').filter(Boolean).pop() || path;
  return last.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 90);
}

/* ───────────────────────── visitas ───────────────────────── */

export type Ev = RawEvent & { ts: number; meta: Meta };

export type SearchRec = {
  ts: number;
  visitorId: string;
  visitId: string;
  term: string;
  key: string;
  results: number | null;
  failed: boolean;
  blocked: boolean;
  fake: number | null;
  real: number | null;
  top: { name: string; path: string | null; price: number | null; verdict: string | null }[];
  ledToProduct: boolean;
};

export type ProductRec = { ts: number; visitorId: string; visitId: string; name: string; path: string; price: number | null; verdict: string | null; store: string | null; inferred: boolean };
export type ClickRec = { ts: number; visitorId: string; visitId: string; store: string; product: string; path: string; price: number | null };

export type Visit = {
  id: string;
  visitorId: string;
  start: number;
  end: number;
  durationSec: number;
  events: Ev[];
  pageviews: number;
  paths: string[];
  landing: string;
  source: string;
  searches: SearchRec[];
  products: ProductRec[];
  clicks: ClickRec[];
  shares: number;
  bounced: boolean;
  isNewVisitor: boolean;
};

export function prepareEvents(rows: RawEvent[]): Ev[] {
  return rows
    .map(r => ({ ...r, ts: Date.parse(r.created_at), meta: r.metadata || {} }))
    .filter(e => Number.isFinite(e.ts))
    .sort((a, b) => a.ts - b.ts || a.id - b.id);
}

function pathOf(e: Ev) {
  return typeof e.meta.path === 'string' ? e.meta.path : '';
}

export function buildVisits(events: Ev[], visitors: Map<string, Visitor>): Visit[] {
  const bySession = new Map<string, Ev[]>();
  for (const e of events) {
    if (NOISE_EVENTS.includes(e.event_type)) continue;
    if (visitors.get(e.session_id)?.isBot) continue;
    let list = bySession.get(e.session_id);
    if (!list) bySession.set(e.session_id, (list = []));
    list.push(e);
  }

  const visits: Visit[] = [];
  for (const [sid, list] of bySession) {
    let chunk: Ev[] = [];
    const flush = () => { if (chunk.length) visits.push(summarizeVisit(sid, chunk, visitors.get(sid) ?? toVisitor(undefined, sid))); chunk = []; };
    for (const e of list) {
      if (chunk.length && e.ts - chunk[chunk.length - 1].ts > VISIT_GAP_MS) flush();
      chunk.push(e);
    }
    flush();
  }
  return visits.sort((a, b) => b.start - a.start);
}

function summarizeVisit(visitorId: string, events: Ev[], visitor: Visitor): Visit {
  const start = events[0].ts;
  const end = events[events.length - 1].ts;
  const id = `${visitorId}:${start}`;

  const pageViews = events.filter(e => e.event_type === 'page_view');
  const leaves = events.filter(e => e.event_type === 'page_leave');
  const paths = (pageViews.length ? pageViews : leaves).map(pathOf).filter(Boolean);
  const pageviews = pageViews.length || leaves.length || 1;

  const landingEvent = pageViews.find(e => e.meta.landing) || pageViews[0];
  const landing = (landingEvent ? pathOf(landingEvent) : paths[0]) || '/';
  const source = classifySource({
    utm: landingEvent?.meta.utm_source || visitor.utm,
    referrer: landingEvent?.meta.landing ? landingEvent.meta.referrer : visitor.referrer,
    browser: visitor.browser,
  });

  // Duração: do primeiro ao último evento, somando o tempo da última página quando há page_leave.
  const lastDwell = num(leaves[leaves.length - 1]?.meta.dwell_time_seconds) ?? 0;
  const durationSec = Math.max(Math.round((end - start) / 1000), lastDwell);

  const products = collectProducts(events, visitorId, id);
  const searches = collectSearches(events, visitorId, id, products);
  const clicks: ClickRec[] = events.filter(e => e.event_type === 'offer_click').map(e => ({
    ts: e.ts, visitorId, visitId: id,
    store: String(e.meta.store || 'Loja'),
    product: e.product_id || prettifySlug(String(e.meta.product_path || '')),
    path: String(e.meta.product_path || ''),
    price: num(e.price_displayed),
  }));
  const shares = events.filter(e => e.event_type === 'share_product').length;

  return {
    id, visitorId, start, end, durationSec, events, pageviews, paths, landing, source,
    searches, products, clicks, shares,
    bounced: pageviews <= 1 && searches.length === 0 && products.length === 0 && clicks.length === 0 && durationSec < 10,
    isNewVisitor: visitor.firstSeen !== null && visitor.firstSeen >= start - VISIT_GAP_MS,
  };
}

function collectProducts(events: Ev[], visitorId: string, visitId: string): ProductRec[] {
  const out: ProductRec[] = [];
  const seenPaths = new Set<string>();
  for (const e of events) {
    if (e.event_type !== 'product_view') continue;
    const path = String(e.meta.product_path || pathOf(e).replace(/^\/produto\//, ''));
    seenPaths.add(path);
    out.push({
      ts: e.ts, visitorId, visitId, path,
      name: e.product_id || prettifySlug(path),
      price: num(e.price_displayed),
      verdict: e.meta.verdict ?? null,
      store: e.meta.best_store ?? null,
      inferred: false,
    });
  }
  // Visitas antigas (antes do evento product_view): deduz pela URL da página.
  for (const e of events) {
    if (e.event_type !== 'page_view' && e.event_type !== 'page_leave') continue;
    const p = pathOf(e);
    if (!p.startsWith('/produto/')) continue;
    const path = p.replace(/^\/produto\//, '');
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    out.push({ ts: e.ts, visitorId, visitId, path, name: prettifySlug(path), price: null, verdict: null, store: null, inferred: true });
  }
  return out.sort((a, b) => a.ts - b.ts);
}

function collectSearches(events: Ev[], visitorId: string, visitId: string, products: ProductRec[]): SearchRec[] {
  const out: SearchRec[] = [];
  for (const e of events) {
    const t = e.event_type;
    if (t !== 'super_search' && t !== 'search_results' && t !== 'search_blocked' && t !== 'search') continue;
    const term = String(e.meta.query ?? e.meta.q ?? '').trim();
    if (!term) continue;
    const key = foldTerm(term);
    const prev = [...out].reverse().find(s => s.key === key && e.ts - s.ts <= SEARCH_MERGE_MS);
    const target = prev ?? {
      ts: e.ts, visitorId, visitId, term: term.slice(0, 160), key,
      results: null, failed: false, blocked: false, fake: null, real: null, top: [], ledToProduct: false,
    };
    if (t === 'search_results') {
      target.results = num(e.meta.results);
      target.failed = Boolean(e.meta.failed);
      target.blocked = target.blocked || Boolean(e.meta.blocked);
      target.fake = num(e.meta.fake_discounts);
      target.real = num(e.meta.real_discounts);
      target.top = Array.isArray(e.meta.top) ? e.meta.top.slice(0, 5) : [];
    } else if (t === 'search_blocked') {
      target.blocked = true;
    } else if (t === 'super_search' && target.results === null && num(e.meta.results) !== null) {
      target.results = num(e.meta.results); // versão anterior do site enviava a contagem no próprio super_search
    }
    if (!prev) out.push(target);
  }
  for (const s of out) {
    s.ledToProduct = products.some(p => p.ts >= s.ts && p.ts - s.ts <= SEARCH_TO_PRODUCT_MS);
  }
  return out;
}

/* ───────────────────────── agregações ───────────────────────── */

type Counter = Map<string, number>;
function bump(map: Counter, key: string, by = 1) { map.set(key, (map.get(key) || 0) + by); }
function top(map: Counter, limit = 10) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, value]) => ({ name, value }));
}
function pct(part: number, whole: number) { return whole > 0 ? part / whole : 0; }
function quantile(values: number[], q: number) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

export function kpisOf(visits: Visit[]) {
  const visitors = new Set(visits.map(v => v.visitorId));
  const searches = visits.flatMap(v => v.searches);
  const withResults = searches.filter(s => s.results !== null);
  const productViews = visits.reduce((n, v) => n + v.products.length, 0);
  const offerClicks = visits.reduce((n, v) => n + v.clicks.length, 0);
  const visitsWithSearch = visits.filter(v => v.searches.length).length;
  const visitsWithProduct = visits.filter(v => v.products.length).length;
  const visitsWithClick = visits.filter(v => v.clicks.length).length;
  return {
    visitors: visitors.size,
    newVisitors: new Set(visits.filter(v => v.isNewVisitor).map(v => v.visitorId)).size,
    visits: visits.length,
    pageviews: visits.reduce((n, v) => n + v.pageviews, 0),
    searches: searches.length,
    uniqueTerms: new Set(searches.map(s => s.key)).size,
    zeroResultRate: pct(withResults.filter(s => s.results === 0 || s.failed).length, withResults.length),
    searchToProductRate: pct(searches.filter(s => s.ledToProduct).length, searches.length),
    productViews,
    offerClicks,
    shares: visits.reduce((n, v) => n + v.shares, 0),
    alertsCreated: visits.reduce((n, v) => n + v.events.filter(e => e.event_type === 'tracking_update' && e.meta.action === 'alert_created').length, 0),
    installClicks: visits.reduce((n, v) => n + v.events.filter(e => e.event_type === 'tracking_update' && e.meta.action === 'install_banner_click').length, 0),
    avgVisitSec: visits.length ? Math.round(visits.reduce((n, v) => n + v.durationSec, 0) / visits.length) : 0,
    medianVisitSec: quantile(visits.map(v => v.durationSec), 0.5) ?? 0,
    bounceRate: pct(visits.filter(v => v.bounced).length, visits.length),
    visitSearchRate: pct(visitsWithSearch, visits.length),
    visitProductRate: pct(visitsWithProduct, visits.length),
    visitClickRate: pct(visitsWithClick, visits.length),
  };
}
export type Kpis = ReturnType<typeof kpisOf>;

export function bucketKey(ts: number, bucket: 'hour' | 'day') {
  const p = localParts(ts);
  return bucket === 'hour' ? `${p.day}T${String(p.hour).padStart(2, '0')}` : p.day;
}

export function seriesOf(visits: Visit[], from: number, to: number, bucket: 'hour' | 'day') {
  const step = bucket === 'hour' ? 3600_000 : 86400_000;
  const rows = new Map<string, { key: string; ts: number; visits: number; visitors: Set<string>; pageviews: number; searches: number; productViews: number; offerClicks: number }>();
  const start = bucket === 'hour' ? Math.floor(from / step) * step : startOfLocalDay(from);
  for (let t = start; t <= to; t += step) {
    const key = bucketKey(t, bucket);
    if (!rows.has(key)) rows.set(key, { key, ts: t, visits: 0, visitors: new Set(), pageviews: 0, searches: 0, productViews: 0, offerClicks: 0 });
  }
  const row = (ts: number) => rows.get(bucketKey(ts, bucket));
  for (const v of visits) {
    const r = row(v.start);
    if (r) { r.visits++; r.visitors.add(v.visitorId); }
    for (const e of v.events) if (e.event_type === 'page_view') { const x = row(e.ts); if (x) x.pageviews++; }
    if (!v.events.some(e => e.event_type === 'page_view') && r) r.pageviews += v.pageviews;
    for (const s of v.searches) { const x = row(s.ts); if (x) x.searches++; }
    for (const p of v.products) { const x = row(p.ts); if (x) x.productViews++; }
    for (const c of v.clicks) { const x = row(c.ts); if (x) x.offerClicks++; }
  }
  return [...rows.values()].map(r => ({ key: r.key, ts: r.ts, visits: r.visits, visitors: r.visitors.size, pageviews: r.pageviews, searches: r.searches, productViews: r.productViews, offerClicks: r.offerClicks }));
}

export function funnelOf(visits: Visit[]) {
  const total = visits.length;
  const steps = [
    { step: 'Visitas', value: total },
    { step: 'Buscaram', value: visits.filter(v => v.searches.length).length },
    { step: 'Abriram um produto', value: visits.filter(v => v.products.length).length },
    { step: 'Foram à loja', value: visits.filter(v => v.clicks.length).length },
  ];
  return steps.map((s, i) => ({ ...s, ofTotal: pct(s.value, total), ofPrevious: i === 0 ? 1 : pct(s.value, steps[i - 1].value) }));
}

export function searchesOf(visits: Visit[], prevVisits: Visit[]) {
  const all = visits.flatMap(v => v.searches).sort((a, b) => b.ts - a.ts);
  const prevCount: Counter = new Map();
  for (const s of prevVisits.flatMap(v => v.searches)) bump(prevCount, s.key);

  const groups = new Map<string, SearchRec[]>();
  for (const s of all) { const g = groups.get(s.key); if (g) g.push(s); else groups.set(s.key, [s]); }

  const terms = [...groups.entries()].map(([key, list]) => {
    const forms: Counter = new Map();
    list.forEach(s => bump(forms, s.term));
    const known = list.filter(s => s.results !== null);
    return {
      key,
      term: top(forms, 1)[0].name,
      count: list.length,
      visitors: new Set(list.map(s => s.visitorId)).size,
      avgResults: known.length ? Math.round(known.reduce((n, s) => n + (s.results || 0), 0) / known.length) : null,
      zeroResults: known.filter(s => s.results === 0 || s.failed).length,
      blocked: list.filter(s => s.blocked).length,
      productRate: pct(list.filter(s => s.ledToProduct).length, list.length),
      fake: list.reduce((n, s) => n + (s.fake || 0), 0),
      lastAt: list[0].ts,
      prev: prevCount.get(key) || 0,
    };
  });

  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, searches: 0 }));
  for (const s of all) hours[localParts(s.ts).hour].searches++;

  return {
    total: all.length,
    terms: terms.sort((a, b) => b.count - a.count || b.lastAt - a.lastAt).slice(0, 100),
    rising: terms.filter(t => t.count >= 2 && t.count > t.prev).sort((a, b) => (b.count - b.prev) - (a.count - a.prev)).slice(0, 10),
    zero: terms.filter(t => t.zeroResults > 0).sort((a, b) => b.zeroResults - a.zeroResults).slice(0, 20),
    blocked: terms.filter(t => t.blocked > 0).sort((a, b) => b.blocked - a.blocked).slice(0, 20),
    recent: all.slice(0, 150).map(s => ({ ts: s.ts, term: s.term, results: s.results, failed: s.failed, blocked: s.blocked, fake: s.fake, real: s.real, ledToProduct: s.ledToProduct, visitorId: s.visitorId, visitId: s.visitId, top: s.top })),
    hours,
  };
}

export function productsOf(visits: Visit[]) {
  const views = visits.flatMap(v => v.products);
  const clicks = visits.flatMap(v => v.clicks);
  const byPath = new Map<string, { path: string; name: string; views: number; visitors: Set<string>; clicks: number; lastPrice: number | null; verdict: string | null; lastAt: number; inferred: boolean }>();
  for (const p of views.sort((a, b) => a.ts - b.ts)) {
    const key = p.path || p.name;
    let r = byPath.get(key);
    if (!r) byPath.set(key, (r = { path: p.path, name: p.name, views: 0, visitors: new Set(), clicks: 0, lastPrice: null, verdict: null, lastAt: 0, inferred: true }));
    r.views++;
    r.visitors.add(p.visitorId);
    r.lastAt = p.ts;
    if (!p.inferred) { r.name = p.name; r.inferred = false; }
    if (p.price !== null) r.lastPrice = p.price;
    if (p.verdict) r.verdict = p.verdict;
  }
  for (const c of clicks) {
    const r = byPath.get(c.path || c.product);
    if (r) r.clicks++;
  }
  const stores: Counter = new Map();
  clicks.forEach(c => bump(stores, c.store));
  const verdicts: Counter = new Map();
  views.forEach(p => { if (p.verdict) bump(verdicts, p.verdict); });

  return {
    totalViews: views.length,
    totalClicks: clicks.length,
    top: [...byPath.values()]
      .map(r => ({ path: r.path, name: r.name, views: r.views, visitors: r.visitors.size, clicks: r.clicks, ctr: pct(r.clicks, r.views), lastPrice: r.lastPrice, verdict: r.verdict, lastAt: r.lastAt, inferred: r.inferred }))
      .sort((a, b) => b.views - a.views || b.lastAt - a.lastAt)
      .slice(0, 100),
    stores: top(stores, 15),
    verdicts: top(verdicts, 10),
    recentClicks: clicks.sort((a, b) => b.ts - a.ts).slice(0, 50),
  };
}

export function audienceOf(visits: Visit[], visitors: Map<string, Visitor>) {
  const sources: Counter = new Map(), devices: Counter = new Map(), os: Counter = new Map(), browsers: Counter = new Map(), regions: Counter = new Map(), cities: Counter = new Map(), landings: Counter = new Map();
  const sourceSearch: Counter = new Map(), sourceClick: Counter = new Map();
  for (const v of visits) {
    const who = visitors.get(v.visitorId) ?? toVisitor(undefined, v.visitorId);
    bump(sources, v.source);
    if (v.searches.length) bump(sourceSearch, v.source);
    if (v.clicks.length) bump(sourceClick, v.source);
    bump(devices, who.device);
    bump(os, who.os);
    bump(browsers, who.browser);
    bump(regions, who.country && who.country !== 'BR' ? `Exterior (${who.country})` : who.region || 'Desconhecido');
    bump(cities, placeOf(who));
    bump(landings, v.landing);
  }
  return {
    sources: top(sources, 12).map(s => ({ ...s, searchRate: pct(sourceSearch.get(s.name) || 0, s.value), clickRate: pct(sourceClick.get(s.name) || 0, s.value) })),
    devices: top(devices, 5), os: top(os, 6), browsers: top(browsers, 8), regions: top(regions, 12), cities: top(cities, 12), landings: top(landings, 10),
  };
}

export function pagesOf(visits: Visit[]) {
  const views: Counter = new Map();
  const people = new Map<string, Set<string>>();
  const dwell = new Map<string, number[]>();
  for (const v of visits) {
    for (const e of v.events) {
      const p = pathOf(e);
      if (!p) continue;
      const group = p.startsWith('/produto/') ? '/produto/…' : p;
      if (e.event_type === 'page_view' || (e.event_type === 'page_leave' && !v.events.some(x => x.event_type === 'page_view'))) {
        bump(views, group);
        const s = people.get(group) ?? new Set(); s.add(v.visitorId); people.set(group, s);
      }
      if (e.event_type === 'page_leave') {
        const d = num(e.meta.dwell_time_seconds);
        if (d !== null && d < 3 * 3600) { const l = dwell.get(group) ?? []; l.push(d); dwell.set(group, l); }
      }
    }
  }
  return top(views, 15).map(({ name, value }) => {
    const d = dwell.get(name) ?? [];
    return { path: name, views: value, visitors: people.get(name)?.size ?? 0, medianDwellSec: quantile(d, 0.5) };
  });
}

const VITAL_ORDER = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
export function qualityOf(events: Ev[]) {
  const vitals = new Map<string, { values: number[]; good: number; ni: number; poor: number }>();
  const errors = new Map<string, { message: string; count: number; lastAt: number; path: string }>();
  const rage: Counter = new Map(), dead: Counter = new Map();
  for (const e of events) {
    if (e.event_type === 'web_vitals') {
      const name = String(e.meta.name || '');
      const value = num(e.meta.value);
      if (!VITAL_ORDER.includes(name) || value === null) continue;
      const r = vitals.get(name) ?? { values: [], good: 0, ni: 0, poor: 0 };
      r.values.push(value);
      if (e.meta.rating === 'good') r.good++; else if (e.meta.rating === 'poor') r.poor++; else r.ni++;
      vitals.set(name, r);
    } else if (e.event_type === 'js_error') {
      const message = String(e.meta.message || 'Erro sem mensagem').slice(0, 200);
      const r = errors.get(message) ?? { message, count: 0, lastAt: 0, path: pathOf(e) };
      r.count++; r.lastAt = Math.max(r.lastAt, e.ts); r.path = pathOf(e) || r.path;
      errors.set(message, r);
    } else if (e.event_type === 'rage_click') bump(rage, pathOf(e) || '?');
    else if (e.event_type === 'dead_click') bump(dead, pathOf(e) || '?');
  }
  return {
    vitals: VITAL_ORDER.filter(n => vitals.has(n)).map(name => {
      const r = vitals.get(name)!;
      const total = r.values.length;
      return { name, p75: quantile(r.values, 0.75), count: total, good: pct(r.good, total), ni: pct(r.ni, total), poor: pct(r.poor, total) };
    }),
    errors: [...errors.values()].sort((a, b) => b.count - a.count).slice(0, 20),
    rage: top(rage, 8),
    dead: top(dead, 8),
  };
}

export function coverageOf(events: Ev[]) {
  const has = (t: string) => events.some(e => e.event_type === t);
  return { pageViews: has('page_view'), searchResults: has('search_results'), productViews: has('product_view'), offerClicks: has('offer_click') };
}

export function visitRows(visits: Visit[], visitors: Map<string, Visitor>, limit = 300) {
  return visits.slice(0, limit).map(v => {
    const who = visitors.get(v.visitorId) ?? toVisitor(undefined, v.visitorId);
    return {
      id: v.id, visitorId: v.visitorId, start: v.start, end: v.end, durationSec: v.durationSec,
      pageviews: v.pageviews, searches: v.searches.map(s => s.term), products: v.products.map(p => p.name),
      clicks: v.clicks.length, shares: v.shares, landing: v.landing, source: v.source,
      device: who.device, os: who.os, browser: who.browser, place: placeOf(who), isNew: v.isNewVisitor, bounced: v.bounced,
    };
  });
}

/* ───────────────────────── linha do tempo / ao vivo ───────────────────────── */

export type FeedItem = { ts: number; kind: 'page' | 'search' | 'product' | 'click' | 'share' | 'blocked' | 'error' | 'exit' | 'frustration' | 'legacy'; title: string; detail: string; path: string; visitorId: string };

const brl = (n: number | null) => n === null ? '' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Texto legível de um evento. `timeline` inclui o tempo em cada página (fica de fora do feed ao vivo). */
export function describe(e: Ev, timeline = false): FeedItem | null {
  const base = { ts: e.ts, path: pathOf(e), visitorId: e.session_id };
  const m = e.meta;
  switch (e.event_type) {
    case 'page_view': return { ...base, kind: 'page', title: `Abriu ${pathOf(e) || '/'}`, detail: m.landing ? `Entrada${m.referrer ? ` · veio de ${hostOf(m.referrer) || m.referrer}` : ''}` : '' };
    case 'super_search': return { ...base, kind: 'search', title: `Buscou “${String(m.query || '').slice(0, 80)}”`, detail: m.results !== undefined ? `${m.results} resultado(s)` : 'Enviou a busca' };
    case 'search_results': return { ...base, kind: 'search', title: `Resultados para “${String(m.query || '').slice(0, 80)}”`, detail: m.blocked ? 'Termo bloqueado' : m.failed ? 'Fonte indisponível' : `${m.results ?? 0} produto(s)${m.fake_discounts ? ` · ${m.fake_discounts} desconto(s) maquiado(s)` : ''}` };
    case 'search_blocked': return { ...base, kind: 'blocked', title: 'Busca bloqueada', detail: String(m.query || '').slice(0, 80) };
    case 'product_view': return { ...base, kind: 'product', title: `Viu ${e.product_id || prettifySlug(String(m.product_path || ''))}`, detail: [brl(num(e.price_displayed)), m.verdict].filter(Boolean).join(' · ') };
    case 'offer_click': return { ...base, kind: 'click', title: `Foi para a loja ${m.store || ''}`.trim(), detail: [e.product_id, brl(num(e.price_displayed))].filter(Boolean).join(' · ') };
    case 'outbound_click': return { ...base, kind: 'exit', title: `Saiu para ${m.host || 'link externo'}`, detail: String(m.label || '') };
    case 'share_product': return { ...base, kind: 'share', title: 'Compartilhou um veredito', detail: [m.channel, e.product_id].filter(Boolean).join(' · ') };
    case 'js_error': return { ...base, kind: 'error', title: 'Erro de JavaScript', detail: String(m.message || '').slice(0, 120) };
    case 'rage_click': return { ...base, kind: 'frustration', title: 'Cliques repetidos (frustração)', detail: String(m.tag || '') };
    case 'tracking_update':
      if (m.action === 'alert_created') return { ...base, kind: 'share', title: `Criou alerta de preço${e.product_id ? `: ${e.product_id}` : ''}`, detail: [Array.isArray(m.kinds) ? m.kinds.join(', ') : '', m.standalone ? 'no app instalado' : ''].filter(Boolean).join(' · ') };
      if (m.action === 'alert_open') return { ...base, kind: 'page', title: 'Abriu o alerta de preço', detail: e.product_id || '' };
      if (m.action === 'install_banner_click') return { ...base, kind: 'click', title: 'Tocou em instalar o app', detail: m.ios ? 'iOS' : '' };
      return null;
    case 'page_leave': {
      if (!timeline) return null;
      const sec = num(m.dwell_time_seconds) ?? 0;
      const time = sec < 60 ? `${Math.round(sec)} s` : `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} s`;
      return { ...base, kind: 'page', title: `Ficou ${time} em ${pathOf(e) || '/'}`, detail: '' };
    }
    case 'view_item': case 'add_to_cart': case 'fake_checkout': case 'checkout_basket': case 'dark_pattern_audit': case 'bookmarklet_installed':
      return { ...base, kind: 'legacy', title: `Evento da versão antiga: ${e.event_type}`, detail: '' };
    default: return null;
  }
}

export function liveOf(events: Ev[], visitors: Map<string, Visitor>, now = Date.now()) {
  const human = events.filter(e => e.ts <= now && !visitors.get(e.session_id)?.isBot);
  const recent5 = human.filter(e => now - e.ts <= 5 * 60_000);
  const byVisitor = new Map<string, Ev[]>();
  for (const e of recent5) { const l = byVisitor.get(e.session_id) ?? []; l.push(e); byVisitor.set(e.session_id, l); }

  const activeNow = [...byVisitor.entries()].map(([id, list]) => {
    const who = visitors.get(id) ?? toVisitor(undefined, id);
    const withPath = [...list].reverse().find(e => pathOf(e));
    const lastMeaningful = [...human].reverse().find(e => e.session_id === id && describe(e) && e.event_type !== 'page_view');
    return {
      visitorId: id,
      lastAt: Math.max(...list.map(e => e.ts)),
      path: withPath ? pathOf(withPath) : '',
      place: placeOf(who), device: who.device, browser: who.browser,
      source: classifySource({ utm: who.utm, referrer: who.referrer, browser: who.browser }),
      lastAction: lastMeaningful ? describe(lastMeaningful)!.title : '',
    };
  }).sort((a, b) => b.lastAt - a.lastAt);

  const minutes = Array.from({ length: 30 }, (_, i) => {
    const end = now - (29 - i) * 60_000;
    return { ts: end - 60_000, visitors: new Set<string>(), actions: 0 };
  });
  for (const e of human) {
    const idx = 29 - Math.floor((now - e.ts) / 60_000);
    if (idx < 0 || idx > 29) continue;
    minutes[idx].visitors.add(e.session_id);
    if (describe(e)) minutes[idx].actions++;
  }

  const feed = human.map(e => describe(e)).filter((x): x is FeedItem => x !== null).sort((a, b) => b.ts - a.ts).slice(0, 80);
  const pages: Counter = new Map();
  activeNow.forEach(a => bump(pages, a.path.startsWith('/produto/') ? '/produto/…' : a.path || '?'));

  return {
    activeNow,
    active5: activeNow.length,
    active30: new Set(human.map(e => e.session_id)).size,
    perMinute: minutes.map(m => ({ ts: m.ts, visitors: m.visitors.size, actions: m.actions })),
    feed,
    activePages: top(pages, 8),
  };
}
