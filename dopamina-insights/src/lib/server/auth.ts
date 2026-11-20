import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Login do painel: senha verificada no servidor e cookie assinado (HMAC), httpOnly.
 * Antes, a senha ficava no JavaScript enviado ao navegador e o acesso era um flag no localStorage.
 *
 * Configure INSIGHTS_PASSWORD (e opcionalmente INSIGHTS_SECRET) na Vercel.
 * Sem INSIGHTS_PASSWORD, vale a senha antiga do painel para ninguém ficar trancado do lado de fora;
 * o painel mostra um aviso pedindo a configuração.
 */
const COOKIE = 'insights_session';
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dias
const LEGACY_PASSWORD = 'dopamina2026';

function password() {
  return process.env.INSIGHTS_PASSWORD || LEGACY_PASSWORD;
}

export function passwordConfigured() {
  return Boolean(process.env.INSIGHTS_PASSWORD);
}

function secret() {
  // Trocar a senha invalida todos os cookies emitidos com a anterior.
  return process.env.INSIGHTS_SECRET || `insights:${password()}`;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(candidate: string) {
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${password()}`));
}

export function makeToken(now = Date.now()) {
  const exp = Math.floor(now / 1000) + MAX_AGE;
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [v, exp, sig] = parts;
  if (v !== 'v1' || !safeEqual(sig, sign(`${v}.${exp}`))) return false;
  return Number(exp) * 1000 > now;
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export async function setSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, makeToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Para rotas de API: devolve uma resposta 401 quando não autenticado, ou null quando liberado. */
export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}
