import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { loadVisitorEvents, loadVisitors } from '@/lib/server/load';
import { buildVisits, describe, placeOf, prepareEvents } from '@/lib/analytics/core';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Histórico completo de um visitante, dividido em visitas, para a linha do tempo. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Visitante inválido' }, { status: 400 });

  try {
    const events = prepareEvents(await loadVisitorEvents(id));
    const visitors = await loadVisitors([id]);
    const who = visitors.get(id)!;
    const visits = buildVisits(events, new Map([[id, { ...who, isBot: false }]]));
    return NextResponse.json({
      visitor: { id, place: placeOf(who), device: who.device, os: who.os, browser: who.browser, firstSeen: who.firstSeen, isBot: who.isBot },
      visits: visits.map(v => ({
        id: v.id, start: v.start, end: v.end, durationSec: v.durationSec, source: v.source, landing: v.landing,
        pageviews: v.pageviews, searches: v.searches.length, products: v.products.length, clicks: v.clicks.length,
        timeline: v.events.map(e => describe(e, true)).filter(Boolean),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Falha ao ler o visitante' }, { status: 500 });
  }
}
