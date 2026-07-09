import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, device_info } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('sessions')
      .upsert({ session_id, device_info }, { onConflict: 'session_id' });

    if (error) {
      console.error('Error saving session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error tracking session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
