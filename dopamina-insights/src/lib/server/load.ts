import { serverSupabase, fetchAll } from './supabase';
import { NOISE_EVENTS, toVisitor, type RawEvent, type RawSession, type Visitor } from '@/lib/analytics/core';

const EVENT_COLUMNS = 'id, session_id, event_type, product_id, price_displayed, metadata, created_at';

/** Eventos entre `from` e `to` (ms). `includeNoise` traz também heatmap/visibilidade (usado no Ao vivo). */
export async function loadEvents(from: number, to: number, includeNoise = false) {
  const db = serverSupabase();
  return fetchAll<RawEvent>((a, b) => {
    let q = db.from('intent_events').select(EVENT_COLUMNS)
      .gte('created_at', new Date(from).toISOString())
      .lte('created_at', new Date(to).toISOString());
    if (!includeNoise) q = q.not('event_type', 'in', `(${NOISE_EVENTS.join(',')})`);
    return q.order('created_at', { ascending: true }).order('id', { ascending: true }).range(a, b);
  });
}

/** Perfil (dispositivo, local, origem) dos visitantes citados nos eventos. */
export async function loadVisitors(ids: Iterable<string>): Promise<Map<string, Visitor>> {
  const db = serverSupabase();
  const unique = [...new Set(ids)];
  const map = new Map<string, Visitor>();
  for (let i = 0; i < unique.length; i += 150) {
    const chunk = unique.slice(i, i + 150);
    const { data, error } = await db.from('sessions').select('session_id, started_at, device_info').in('session_id', chunk);
    if (error) throw new Error(error.message);
    for (const s of (data ?? []) as RawSession[]) map.set(s.session_id, toVisitor(s, s.session_id));
  }
  for (const id of unique) if (!map.has(id)) map.set(id, toVisitor(undefined, id));
  return map;
}

export async function loadVisitorEvents(visitorId: string) {
  const db = serverSupabase();
  const { data, error } = await db.from('intent_events').select(EVENT_COLUMNS)
    .eq('session_id', visitorId)
    .not('event_type', 'in', `(${NOISE_EVENTS.join(',')})`)
    .order('created_at', { ascending: false }).limit(3000);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawEvent[]).reverse();
}
