import { adminAccess } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const denied = adminAccess(request);
  if (denied) return denied;
  const params = new URL(request.url).searchParams;
  const start = params.get("startDate");
  const end = params.get("endDate");
  if ([start, end].some(value => value && !Number.isFinite(Date.parse(value)))
      || (start && end && Date.parse(start) > Date.parse(end))) {
    return Response.json({ error: "Período inválido." }, { status: 400 });
  }
  try {
    const db = getServiceSupabase();
    let sessions = db.from("sessions").select("*", { count: "exact" }).order("started_at", { ascending: false }).limit(1000);
    let events = db.from("intent_events").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(1000);
    let bookmarklets = db.from("intent_events").select("id", { count: "exact", head: true }).eq("event_type", "bookmarklet_installed");
    let audits = db.from("intent_events").select("id", { count: "exact", head: true }).eq("event_type", "dark_pattern_audit");
    if (start) {
      sessions = sessions.gte("started_at", start); events = events.gte("created_at", start);
      bookmarklets = bookmarklets.gte("created_at", start); audits = audits.gte("created_at", start);
    }
    if (end) {
      sessions = sessions.lte("started_at", end); events = events.lte("created_at", end);
      bookmarklets = bookmarklets.lte("created_at", end); audits = audits.lte("created_at", end);
    }
    const [s, e, b, a, p] = await Promise.all([
      sessions, events, bookmarklets, audits,
      db.from("products").select("id, name, short_name, image_url").limit(1000),
    ]);
    if ([s, e, b, a].some(result => result.error)) throw new Error("Consulta indisponível");
    return Response.json({
      sessions: s.data ?? [], sessionCount: s.count ?? 0,
      events: e.data ?? [], eventCount: e.count ?? 0,
      bookmarkletCount: b.count ?? 0, auditCount: a.count ?? 0, products: p.data ?? [],
      truncated: (s.count ?? 0) > (s.data?.length ?? 0) || (e.count ?? 0) > (e.data?.length ?? 0),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível consultar os dados." }, { status: 503 });
  }
}
