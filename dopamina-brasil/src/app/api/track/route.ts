import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, eventType, productId, priceDisplayed, metadata } = body;

    if (!sessionId || !eventType) {
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
