import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, event_type, product_id, price_displayed, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: 'session_id and event_type are required' }, { status: 400 });
    }

    let { error } = await supabase
      .from('intent_events')
      .insert({
        session_id,
        event_type,
        product_id: product_id || null,
        price_displayed: price_displayed || null,
        metadata: metadata || {}
      });

    if (error && error.code === '23503') {
      // Foreign key violation: session doesn't exist yet (race condition or adblock)
      // Create a fallback session to satisfy the constraint
      await supabase.from('sessions').insert({
        session_id,
        device_info: { fallback: true, os_name: 'Unknown', browser_name: 'Unknown' }
      });

      // Retry event insertion
      const retry = await supabase.from('intent_events').insert({
        session_id,
        event_type,
        product_id: product_id || null,
        price_displayed: price_displayed || null,
        metadata: metadata || {}
      });
      error = retry.error;
    }

    if (error) {
      console.error('Error saving intent event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error tracking intent event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
