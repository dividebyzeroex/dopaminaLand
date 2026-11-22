import { after, NextRequest, NextResponse } from "next/server";
import { getProduct, normalizeQuery, queryFromUrl, searchProducts } from "@/lib/buscape";
import { computeVerdict, decisionOf } from "@/lib/price-verdict";
import { blockedMessage, checkSearch } from "@/lib/search-policy";
import { rateLimit } from "@/lib/rate-limit";
import {
  askMessage, blockedReply, buildFoundReply, errorMessage, limitMessage, notFoundMessage,
  parseComment, parseIncoming, parseRequest, verifySignature,
} from "@/lib/raiox-reply";

/**
 * Webhook do Zernio (`message.received`): lê o pedido "raiox ...", busca o
 * histórico e responde na mesma conversa. Responde 2xx na hora e processa depois.
 */
export const maxDuration = 60;

const seen = new Map<string, number>();
function firstTime(id: string): boolean {
  const now = Date.now();
  for (const [k, t] of seen) if (now - t > 3_600_000) seen.delete(k);
  if (seen.has(id)) return false;
  seen.set(id, now);
  return true;
}

async function buildReply(text: string, senderId: string): Promise<string> {
  const request = parseRequest(text);
  if (request.kind === "empty") return askMessage();
  if (!rateLimit(`zernio:${senderId}`, 6, 60_000).ok) return limitMessage();

  const raw = request.kind === "link" ? queryFromUrl(request.url) : request.query;
  const query = raw ? normalizeQuery(raw) : "";
  if (query.length < 2) return notFoundMessage();
  const policy = checkSearch(query);
  if (policy.blocked) return blockedReply(blockedMessage(policy.reason));

  const [first] = await searchProducts(query.toLowerCase());
  if (!first) return notFoundMessage();
  const detail = first.path ? await getProduct(first.path).catch(() => null) : null;
  const price = detail?.bestPrice ?? first.price;
  if (!(price > 0)) return notFoundMessage();
  const verdict = detail ? computeVerdict(detail.history, price) : null;
  return buildFoundReply({
    name: detail?.name ?? first.name,
    price,
    productPath: first.path ?? null,
    decision: decisionOf(verdict?.kind ?? "insuficiente"),
    headline: verdict?.headline ?? "Ainda não há histórico suficiente para um veredito.",
    detail: verdict?.detail ?? "",
    days: verdict?.days ?? 0,
  });
}

async function send(conversationId: string, accountId: string, message: string, eventId: string) {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) { console.error("zernio: ZERNIO_API_KEY ausente"); return; }
  const res = await fetch(`https://zernio.com/api/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": eventId },
    body: JSON.stringify({ accountId, message }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) console.error("zernio: envio falhou", res.status, (await res.text().catch(() => "")).slice(0, 200));
}

async function sendPrivateReply(c: { postId: string; commentId: string; accountId: string }, message: string, eventId: string) {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) { console.error("zernio: ZERNIO_API_KEY ausente"); return; }
  const url = `https://zernio.com/api/v1/inbox/comments/${encodeURIComponent(c.postId)}/${encodeURIComponent(c.commentId)}/private-reply`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": eventId },
    body: JSON.stringify({ accountId: c.accountId, message }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) console.error("zernio: resposta privada falhou", res.status, (await res.text().catch(() => "")).slice(0, 200));
}

export async function POST(req: NextRequest) {
  const secret = process.env.ZERNIO_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-zernio-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const comment = parseComment(payload);
  if (comment) {
    if (!firstTime(comment.eventId)) return NextResponse.json({ ok: true, ignored: true });
    after(async () => {
      let reply: string;
      try { reply = await buildReply(comment.text, comment.authorId); }
      catch (error) { console.error("zernio: consulta falhou", error); reply = errorMessage(); }
      await sendPrivateReply(comment, reply, comment.eventId).catch(e => console.error("zernio: resposta privada", e));
    });
    return NextResponse.json({ ok: true });
  }

  const incoming = parseIncoming(payload);
  if (!incoming || !firstTime(incoming.eventId)) return NextResponse.json({ ok: true, ignored: true });

  after(async () => {
    let reply: string;
    try { reply = await buildReply(incoming.text, incoming.senderId); }
    catch (error) { console.error("zernio: consulta falhou", error); reply = errorMessage(); }
    await send(incoming.conversationId, incoming.accountId, reply, incoming.eventId).catch(e => console.error("zernio: envio", e));
  });
  return NextResponse.json({ ok: true });
}
