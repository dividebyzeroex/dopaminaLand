import { NextResponse } from 'next/server';
import { checkPassword, clearSessionCookie, isAuthenticated, passwordConfigured, setSessionCookie } from '@/lib/server/auth';

export async function GET() {
  return NextResponse.json({ authenticated: await isAuthenticated(), passwordConfigured: passwordConfigured() });
}

export async function POST(request: Request) {
  let password = '';
  try { password = String((await request.json()).password ?? ''); } catch {}
  if (!password || !checkPassword(password)) {
    // Pequeno atraso para encarecer tentativas em sequência.
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  }
  await setSessionCookie();
  return NextResponse.json({ authenticated: true, passwordConfigured: passwordConfigured() });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ authenticated: false });
}
