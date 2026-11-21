import webpush from "web-push";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Infra dos alertas: banco (service role) e Web Push (chaves VAPID).
 * Sem as variáveis, `alertsAvailable()` é false e a interface explica que os
 * alertas ainda não estão ativos, em vez de fingir que salvou.
 */

let configured: boolean | null = null;

function configurePush(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contato@dopaminado.com.br";
  configured = Boolean(pub && priv);
  if (configured) {
    try { webpush.setVapidDetails(subject, pub!, priv!); }
    catch { configured = false; }
  }
  return configured;
}

let admin: SupabaseClient | null | undefined;
export function adminDb(): SupabaseClient | null {
  if (admin !== undefined) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  admin = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return admin;
}

export function alertsAvailable(): boolean {
  return configurePush() && adminDb() !== null;
}

export type StoredSubscription = { id: string; endpoint: string; p256dh: string; auth: string };
/** `kind: "destaques"` faz o service worker mostrar o botão "Parar destaques". */
export type PushPayload = { title: string; body: string; url: string; tag?: string; image?: string; kind?: "alerta" | "destaques" };

/** Envia um push. Retorna "gone" quando a inscrição não existe mais (o app foi removido). */
export async function sendPush(sub: StoredSubscription, payload: PushPayload): Promise<"sent" | "gone" | "error"> {
  if (!configurePush()) return "error";
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24, urgency: "normal" },
    );
    return "sent";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    return status === 404 || status === 410 ? "gone" : "error";
  }
}

/** Aceita só endpoints https dos serviços de push conhecidos. */
export function isValidEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && /(^|\.)(googleapis\.com|mozilla\.com|push\.apple\.com|notify\.windows\.com|mozaws\.net)$/.test(url.hostname);
  } catch { return false; }
}
