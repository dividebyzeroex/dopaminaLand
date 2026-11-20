import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { loadEvents, loadVisitors } from '@/lib/server/load';
import { usingServiceRole } from '@/lib/server/supabase';
import {
  RANGE_KEYS, audienceOf, buildVisits, coverageOf, funnelOf, kpisOf, pagesOf, prepareEvents, productsOf,
  qualityOf, resolveRange, searchesOf, seriesOf, visitRows, type RangeKey,
} from '@/lib/analytics/core';

export const maxDuration = 30;

export async function GET(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  const param = new URL(request.url).searchParams.get('range') as RangeKey | null;
  const range = resolveRange(param && RANGE_KEYS.includes(param) ? param : '7d');

  try {
    // Período atual + período anterior de mesmo tamanho (para as variações dos indicadores).
    const { rows, truncated } = await loadEvents(range.prevFrom, range.to);
    const events = prepareEvents(rows);
    const visitors = await loadVisitors(events.map(e => e.session_id));

    const current = events.filter(e => e.ts >= range.from);
    const previous = events.filter(e => e.ts < range.from);
    const visits = buildVisits(current, visitors);
    const prevVisits = buildVisits(previous, visitors);

    return NextResponse.json({
      range,
      generatedAt: Date.now(),
      truncated,
      serviceRole: usingServiceRole(),
      eventCount: current.length,
      kpis: kpisOf(visits),
      prevKpis: kpisOf(prevVisits),
      series: seriesOf(visits, range.from, range.to, range.bucket),
      funnel: funnelOf(visits),
      searches: searchesOf(visits, prevVisits),
      products: productsOf(visits),
      audience: audienceOf(visits, visitors),
      pages: pagesOf(visits),
      quality: qualityOf(current),
      coverage: coverageOf(current),
      visits: visitRows(visits, visitors),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Falha ao montar o relatório' }, { status: 500 });
  }
}
