import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildVisits, classifySource, funnelOf, kpisOf, liveOf, prepareEvents, productsOf, resolveRange, searchesOf, seriesOf, toVisitor,
  type RawEvent, type Visitor,
} from '../src/lib/analytics/core.ts';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const T0 = Date.parse('2026-11-20T13:00:00Z'); // 10:00 em São Paulo
const min = 60_000;

let id = 0;
function ev(session: string, offsetMin: number, type: string, meta: Record<string, unknown> = {}, product: string | null = null, price: number | null = null): RawEvent {
  return { id: ++id, session_id: session, event_type: type, product_id: product, price_displayed: price, metadata: meta, created_at: new Date(T0 + offsetMin * min).toISOString() };
}

const visitors = new Map<string, Visitor>([
  [A, toVisitor({ session_id: A, started_at: new Date(T0).toISOString(), device_info: { device_type: 'mobile', os_name: 'Android', browser_name: 'Instagram', city: 'S%C3%A3o%20Paulo', state: 'SP', country: 'BR', referrer: 'https://l.instagram.com/' } }, A)],
  [B, toVisitor({ session_id: B, started_at: '2026-10-01T00:00:00Z', device_info: { device_type: '', os_name: 'Windows', userAgent: 'Mozilla/5.0' } }, B)],
]);

const rows: RawEvent[] = [
  // Visitante A, visita 1: entra pelo Instagram, busca, vê produto, vai à loja.
  ev(A, 0, 'page_view', { path: '/', landing: true, referrer: 'https://l.instagram.com/' }),
  ev(A, 1, 'super_search', { query: 'iPhone 15', path: '/' }, 'search_submitted'),
  ev(A, 1.1, 'page_view', { path: '/busca', q: 'iPhone 15' }),
  ev(A, 1.2, 'search_results', { query: 'iPhone 15', results: 8, analyzed: 4, fake_discounts: 1, real_discounts: 2, path: '/busca' }),
  ev(A, 2, 'product_view', { product_path: 'celular/iphone-15-128gb', verdict: 'maquiado', path: '/produto/celular/iphone-15-128gb' }, 'iPhone 15 128GB', 4599),
  ev(A, 3, 'offer_click', { store: 'Amazon', product_path: 'celular/iphone-15-128gb' }, 'iPhone 15 128GB', 4599),
  ev(A, 4, 'page_leave', { path: '/produto/celular/iphone-15-128gb', dwell_time_seconds: 90 }),
  // Visitante A, visita 2 (depois de 2 h): busca sem resultado.
  ev(A, 120, 'super_search', { query: 'iphone  15 ', path: '/' }),
  ev(A, 120.2, 'search_results', { query: 'iphone 15', results: 0 }),
  // Visitante B: só abre a home e sai (rejeição).
  ev(B, 10, 'page_view', { path: '/', landing: true, referrer: '' }),
  // Ruído não conta como visita.
  ev(B, 10.1, 'heatmap_move', { x: 1 }),
];

const events = prepareEvents(rows);
const visits = buildVisits(events, visitors);

test('separa visitas por pausa de 30 min', () => {
  assert.equal(visits.length, 3);
  assert.equal(visits.filter(v => v.visitorId === A).length, 2);
});

test('junta envio e resultado da mesma busca', () => {
  const first = visits.find(v => v.visitorId === A && v.start === T0)!;
  assert.equal(first.searches.length, 1);
  assert.equal(first.searches[0].results, 8);
  assert.equal(first.searches[0].ledToProduct, true);
  assert.equal(first.source, 'Instagram');
  assert.equal(first.durationSec, 240);
});

test('indicadores e funil', () => {
  const k = kpisOf(visits);
  assert.equal(k.visitors, 2);
  assert.equal(k.visits, 3);
  assert.equal(k.searches, 2);
  assert.equal(k.productViews, 1);
  assert.equal(k.offerClicks, 1);
  assert.equal(k.zeroResultRate, 0.5);
  assert.equal(k.newVisitors, 1);
  const f = funnelOf(visits);
  assert.deepEqual(f.map(s => s.value), [3, 2, 1, 1]);
});

test('termos agrupados sem acento/caixa e sem resultado', () => {
  const s = searchesOf(visits, []);
  assert.equal(s.terms.length, 1);
  assert.equal(s.terms[0].count, 2);
  assert.equal(s.terms[0].zeroResults, 1);
  assert.equal(s.hours[10].searches, 1);
});

test('produtos e lojas', () => {
  const p = productsOf(visits);
  assert.equal(p.top[0].name, 'iPhone 15 128GB');
  assert.equal(p.top[0].clicks, 1);
  assert.deepEqual(p.stores, [{ name: 'Amazon', value: 1 }]);
});

test('série por hora cobre o período inteiro', () => {
  const s = seriesOf(visits, T0, T0 + 3 * 3600_000, 'hour');
  assert.equal(s.length, 4);
  assert.equal(s.reduce((n, r) => n + r.visits, 0), 3);
});

test('ao vivo: presença inclui heatmap, feed não', () => {
  const live = liveOf(events, visitors, T0 + 12 * min);
  assert.equal(live.active5, 1);
  assert.equal(live.activeNow[0].visitorId, B);
  assert.ok(live.feed.every(f => f.kind !== 'legacy'));
});

test('origem', () => {
  assert.equal(classifySource({ referrer: 'https://www.google.com/' }), 'Google');
  assert.equal(classifySource({ utm: 'newsletter' }), 'Newsletter');
  assert.equal(classifySource({ referrer: 'https://www.dopaminado.com.br/busca' }), 'Direto');
  assert.equal(toVisitor({ session_id: A, started_at: null, device_info: { city: 'S%C3%A3o%20Paulo' } }, A).city, 'São Paulo');
});

test('hoje começa à meia-noite de São Paulo', () => {
  const r = resolveRange('today', T0);
  assert.equal(new Date(r.from).toISOString(), '2026-11-20T03:00:00.000Z');
  assert.equal(r.bucket, 'hour');
});
