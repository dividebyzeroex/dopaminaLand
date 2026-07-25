import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UAParser } from 'ua-parser-js';
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

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, device_info, mock_gender } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400, headers: corsHeaders });
    }

    const validSessionId = ensureUuid(session_id);

    // Extract headers for location and IP
    const city = request.headers.get('x-vercel-ip-city') || 'Desconhecido';
    const state = request.headers.get('x-vercel-ip-country-region') || 'Desconhecido';
    const country = request.headers.get('x-vercel-ip-country') || 'BR';
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';

    // Parse User-Agent
    const userAgentStr = request.headers.get('user-agent') || device_info?.userAgent || '';
    const parser = new UAParser(userAgentStr);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const enrichedDeviceInfo = {
      ...device_info,
      city,
      state,
      country,
      ip,
      os_name: os.name || 'Desconhecido',
      os_version: os.version || '0.0',
      browser_name: browser.name || 'Desconhecido',
      device_type: device.type || 'desktop',
      device_model: device.model || 'Desconhecido',
      mock_gender: mock_gender || 'Não Informado'
    };

    const { error } = await supabase
      .from('sessions')
      .upsert({ session_id: validSessionId, device_info: enrichedDeviceInfo }, { onConflict: 'session_id' });

    if (error) {
      console.error('Error saving session:', error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error tracking session:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
