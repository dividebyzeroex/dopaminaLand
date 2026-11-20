import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { loadEvents, loadVisitors } from '@/lib/server/load';
import { buildVisits, kpisOf, liveOf, prepareEvents, startOfLocalDay } from '@/lib/analytics/core';

/** Painel "Ao vivo": últimos 30 min com presença (inclui heatmap) + resumo de hoje. Consultado a cada ~10 s. */
export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const now = Date.now();
  try {
    const [recent, today] = await Promise.all([
      loadEvents(now - 30 * 60_000, now, true),
      loadEvents(startOfLocalDay(now), now),
    ]);
    const recentEvents = prepareEvents(recent.rows);
    const todayEvents = prepareEvents(today.rows);
    const visitors = await loadVisitors([...recentEvents, ...todayEvents].map(e => e.session_id));
    const todayVisits = buildVisits(todayEvents, visitors);

    return NextResponse.json({
      now,
      ...liveOf(recentEvents, visitors, now),
      today: kpisOf(todayVisits),
      todayTerms: todayVisits.flatMap(v => v.searches).sort((a, b) => b.ts - a.ts).slice(0, 12).map(s => ({ ts: s.ts, term: s.term, results: s.results })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Falha ao ler eventos' }, { status: 500 });
  }
}
