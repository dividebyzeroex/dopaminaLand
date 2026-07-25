import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function ensureUuid(input: any): string {
  if (typeof input === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
    return input;
  }
  const hash = crypto.createHash('md5').update(String(input || 'default')).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-a${hash.slice(16, 19)}-${hash.slice(19, 31)}`;
}

const isUuid = (str: any) =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, event_type, product_id, price_displayed, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: 'session_id and event_type are required' }, { status: 400, headers: corsHeaders });
    }

    const validSessionId = ensureUuid(session_id);
    const validProductId = isUuid(product_id) ? product_id : null;
    const enrichedMetadata = {
      ...(metadata || {}),
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
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error tracking intent event:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
