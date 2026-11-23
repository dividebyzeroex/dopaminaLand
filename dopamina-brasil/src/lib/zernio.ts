import { createHash } from "node:crypto";

/** Chamadas à API do Zernio usadas pelo bot Raio-X. Nunca lança: devolve o status para quem decide. */
const BASE = "https://zernio.com/api/v1/inbox";
export type SendResult = { ok: boolean; status: number; error?: string };

async function post(path: string, body: unknown, idempotencyKey: string): Promise<SendResult> {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) return { ok: false, status: 0, error: "ZERNIO_API_KEY ausente" };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return { ok: true, status: res.status };
    const error = (await res.text().catch(() => "")).slice(0, 200);
    console.error("zernio: falha", path.replace(/\/[^/]*$/, "/…"), res.status, error);
    return { ok: false, status: res.status, error };
  } catch (e) {
    console.error("zernio: erro de rede", e);
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "erro" };
  }
}

const enc = encodeURIComponent;
export const sendDirect = (conversationId: string, accountId: string, message: string, idempotencyKey: string) =>
  post(`/conversations/${enc(conversationId)}/messages`, { accountId, message }, idempotencyKey);
export const sendPrivateReply = (postId: string, commentId: string, accountId: string, message: string, idempotencyKey: string) =>
  post(`/comments/${enc(postId)}/${enc(commentId)}/private-reply`, { accountId, message }, idempotencyKey);
export const sendPublicReply = (postId: string, commentId: string, accountId: string, message: string, idempotencyKey: string) =>
  post(`/comments/${enc(postId)}`, { accountId, message, commentId }, idempotencyKey);

/** Hash estável da conversa: liga "avisar" ao último pedido sem guardar o identificador. */
export const convoHash = (conversationId: string) =>
  createHash("sha256").update(`${process.env.ZERNIO_WEBHOOK_SECRET ?? ""}:${conversationId}`).digest("hex").slice(0, 32);
