import { readJsonObject } from "@/lib/request-body";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { UAParser } from 'ua-parser-js';
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
    const { session_id } = body;
    const device_info = body.device_info && typeof body.device_info === "object" && !Array.isArray(body.device_info)
      ? body.device_info as Record<string, unknown> : {};

    if (typeof session_id !== "string" || !session_id.trim() || session_id.length > 200) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400, headers: corsHeaders });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ error: "Serviço indisponível." }, { status: 503 });
    const supabase = getServiceSupabase();
    const validSessionId = ensureUuid(session_id);

    // Extract headers for location and IP
    const city = request.headers.get('x-vercel-ip-city') || 'Desconhecido';
    const state = request.headers.get('x-vercel-ip-country-region') || 'Desconhecido';
    const country = request.headers.get('x-vercel-ip-country') || 'BR';

    // Parse User-Agent
    const userAgentStr = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgentStr);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const allowedKeys = ["userAgent", "language", "screen", "timezone", "deviceMemory", "hardwareConcurrency", "connectionType", "dataSaver", "prefersDarkMode", "utm_source", "utm_medium", "utm_campaign", "referrer"];
    const safeDeviceInfo = Object.fromEntries(Object.entries(device_info).filter(([key, value]) =>
      allowedKeys.includes(key) && ["string", "number", "boolean"].includes(typeof value)
    ).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 500) : value]));
    const enrichedDeviceInfo = {
      ...safeDeviceInfo,
      city,
      state,
      country,
      os_name: os.name || 'Desconhecido',
      os_version: os.version || '0.0',
      browser_name: browser.name || 'Desconhecido',
      device_type: device.type || 'desktop',
      device_model: device.model || 'Desconhecido'
    };

    const { error } = await supabase
      .from('sessions')
      .upsert({ session_id: validSessionId, device_info: enrichedDeviceInfo }, { onConflict: 'session_id' });

    if (error) {
      console.error('Error saving session:', error);
      return NextResponse.json({ error: "Não foi possível processar a solicitação" }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('Error tracking session:', err);
    return NextResponse.json({ error: "Não foi possível processar a solicitação" }, { status: 500, headers: corsHeaders });
  }
}
