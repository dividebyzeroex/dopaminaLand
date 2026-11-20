import { readJsonObject } from "@/lib/request-body";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { NextResponse } from 'next/server';
import { sanitizeQueryForStorage } from '@/lib/search-policy';
import { getServiceSupabase } from '@/lib/supabase';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function ensureUuid(input: unknown): string {
  if (typeof input === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
    return input;
  }
  const hash = crypto.createHash('md5').update(String(input || 'default')).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(16, 19)}-${hash.slice(19, 31)}`;
}

const isUuid = (str: unknown) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  if (!rateLimit(`telemetry:${clientIp(request.headers)}`, 120, 60_000).ok) {
    return NextResponse.json({ error: "Muitas solicitações." }, { status: 429 });
  }
  try {
    const body = await readJsonObject(request).catch(() => null);
    if (!body) return NextResponse.json({ error: "JSON inválido ou muito grande." }, { status: 400 });
    const { session_id, event_type, product_id, price_displayed } = body;
    // Buscas ofensivas ou proibidas não são gravadas como foram digitadas.
    const metadata = body.metadata && typeof body.metadata === "object" && "query" in body.metadata
      ? { ...body.metadata, query: sanitizeQueryForStorage(body.metadata.query) }
      : body.metadata;

    if (typeof session_id !== "string" || !session_id.trim() || session_id.length > 200 || typeof event_type !== "string" || !event_type.trim() || event_type.length > 80) {
      return NextResponse.json({ error: 'session_id and event_type are required' }, { status: 400, headers: corsHeaders });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ error: "Serviço indisponível." }, { status: 503 });
    const supabase = getServiceSupabase();
    const validSessionId = ensureUuid(session_id);
    const validProductId = isUuid(product_id) ? product_id : null;
    const enrichedMetadata = {
      ...(metadata && typeof metadata === "object" ? metadata : {}),
      raw_session_id: session_id,
      ...(product_id && !isUuid(product_id) ? { store_name: product_id } : {})
    };

    let { error } = await supabase
      .from('intent_events')
      .insert({
        session_id: validSessionId,
        event_type,
        product_id: validProductId,
        price_displayed: price_displayed || null,
        metadata: enrichedMetadata
      });

    if (error && (error.code === '23503' || error.code === '22P02')) {
      // Foreign key or constraint race condition: session doesn't exist yet
      await supabase.from('sessions').insert({
        session_id: validSessionId,
        device_info: { fallback: true, os_name: 'Unknown', browser_name: 'Unknown' }
      });

      // Retry event insertion
      const retry = await supabase.from('intent_events').insert({
        session_id: validSessionId,
        event_type,
        product_id: validProductId,
        price_displayed: price_displayed || null,
        metadata: enrichedMetadata
      });
      error = retry.error;
    }

    if (error) {
      console.error('Error saving intent event:', error);
      return NextResponse.json({ error: "Não foi possível processar a solicitação" }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('Error tracking intent event:', err);
    return NextResponse.json({ error: "Não foi possível processar a solicitação" }, { status: 500, headers: corsHeaders });
  }
}
