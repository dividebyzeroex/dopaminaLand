import { readJsonObject } from "@/lib/request-body";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeQueryForStorage } from "@/lib/search-policy";
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!rateLimit(`telemetry:${clientIp(req.headers)}`, 120, 60_000).ok) {
    return NextResponse.json({ error: "Muitas solicitações." }, { status: 429 });
  }
  try {
    const body = await readJsonObject(req).catch(() => null);
    if (!body) return NextResponse.json({ error: "JSON inválido ou muito grande." }, { status: 400 });
    const { sessionId, eventType, productId, priceDisplayed } = body;
    const metadata = body.metadata && typeof body.metadata === "object" && "query" in body.metadata
      ? { ...body.metadata, query: sanitizeQueryForStorage(body.metadata.query) }
      : body.metadata;

    if (typeof sessionId !== "string" || sessionId.length > 200 || typeof eventType !== "string" || eventType.length > 80) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Ensure session exists
    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert({ session_id: sessionId }, { onConflict: 'session_id', ignoreDuplicates: true });

    if (sessionError) {
      console.error('Session upsert error:', sessionError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Insert intent event
    const { error: eventError } = await supabase
      .from('intent_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        product_id: productId || null,
        price_displayed: priceDisplayed || null,
        metadata: metadata || {}
      });

    if (eventError) {
      console.error('Event insert error:', eventError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Intent track error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
