import { after, NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/buscape";
import { adminDb } from "@/lib/push";
import { lookup, type Outcome } from "@/lib/raiox-engine";
import { flushConversation } from "@/lib/raiox-watch";
import {
  defaultTarget, errorMessage, parseComment, parseCommand, parseIncoming, publicCommentReply,
  verifySignature, watchAlreadyMessage, watchNoContextMessage, watchSetMessage, watchStopMessage,
} from "@/lib/raiox-reply";
import { convoHash, sendDirect, sendPrivateReply, sendPublicReply } from "@/lib/zernio";

/**
 * Webhook do Zernio: `message.received` (Direct) e `comment.received` (comentário "raiox").
 * Responde 2xx na hora e processa depois. Pedidos viram métricas (raiox_requests);
 * "avisar"/"meta X" criam alertas (raiox_watches) entregues pela checagem horária.
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

async function record(channel: string, source: "dm" | "comment", conversationId: string, o: Outcome | { outcome: "error" }) {
  const db = adminDb();
  if (!db) return;
  const full = o as Outcome;
  const { error } = await db.from("raiox_requests").insert({
    channel, source, outcome: o.outcome, convo: convoHash(conversationId),
    query: full.query ?? null, product_path: full.path ?? null, product_name: full.name?.slice(0, 200) ?? null,
    price: full.price ?? null, verdict: full.verdict ?? null,
  });
  if (error) console.error("raiox: métrica não gravada", error.message);
}

/** "avisar", "meta 1500" e "parar" no Direct. Devolve o texto da resposta. */
async function handleCommand(cmd: NonNullable<ReturnType<typeof parseCommand>>, conversationId: string, accountId: string): Promise<string> {
  const db = adminDb();
  if (!db) return errorMessage();
  if (cmd.kind === "stop") {
    const { data } = await db.from("raiox_watches").update({ stopped_at: new Date().toISOString() })
      .eq("conversation_id", conversationId).is("stopped_at", null).is("delivered_at", null).select("id");
    return watchStopMessage(data?.length ?? 0);
  }
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data: last } = await db.from("raiox_requests").select("product_path, product_name")
    .eq("convo", convoHash(conversationId)).eq("outcome", "found").not("product_path", "is", null)
    .gt("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!last?.product_path) return watchNoContextMessage();

  const detail = await getProduct(last.product_path).catch(() => null);
  const price = detail?.bestPrice;
  if (!price) return errorMessage();
  const name = detail?.name ?? last.product_name ?? "o produto";
  const target = cmd.target ?? defaultTarget(price);
  if (target >= price) return watchAlreadyMessage(name, target, price);

  const { error } = await db.from("raiox_watches").upsert({
    account_id: accountId, conversation_id: conversationId, product_path: last.product_path, product_name: name.slice(0, 200),
    target_price: target, price_at_request: price, hit_at: null, hit_price: null, delivered_at: null, stopped_at: null,
    attempts: 0, last_error: null, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  }, { onConflict: "conversation_id,product_path" });
  if (error) { console.error("raiox: alerta não gravado", error.message); return errorMessage(); }
  return watchSetMessage(name, target, price, cmd.target === null);
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
  const platform = (payload as { message?: { platform?: string }; comment?: { platform?: string } })?.message?.platform
    ?? (payload as { comment?: { platform?: string } })?.comment?.platform ?? "instagram";

  const comment = parseComment(payload);
  if (comment) {
    if (!firstTime(comment.eventId)) return NextResponse.json({ ok: true, ignored: true });
    after(async () => {
      let out: Outcome | { outcome: "error"; text: string };
      try { out = await lookup(comment.text, comment.authorId); }
      catch (error) { console.error("raiox: consulta falhou", error); out = { outcome: "error", text: errorMessage() }; }
      const dm = await sendPrivateReply(comment.postId, comment.commentId, comment.accountId, out.text, comment.eventId);
      await record(platform, "comment", comment.commentId, out).catch(() => {});
      // Só avisa publicamente que mandou o Direct se o envio privado deu certo.
      if (dm.ok) await sendPublicReply(comment.postId, comment.commentId, comment.accountId, publicCommentReply(), `${comment.eventId}:pub`);
    });
    return NextResponse.json({ ok: true });
  }

  const incoming = parseIncoming(payload);
  if (!incoming || !firstTime(incoming.eventId)) return NextResponse.json({ ok: true, ignored: true });

  after(async () => {
    const cmd = parseCommand(incoming.text);
    let text: string;
    let out: Outcome | { outcome: "error" } | null = null;
    try {
      if (cmd) text = await handleCommand(cmd, incoming.conversationId, incoming.accountId);
      else { const r = await lookup(incoming.text, incoming.senderId); text = r.text; out = r; }
    } catch (error) {
      console.error("raiox: consulta falhou", error);
      text = errorMessage(); out = { outcome: "error" };
    }
    await sendDirect(incoming.conversationId, incoming.accountId, text, incoming.eventId);
    if (out) await record(platform, "dm", incoming.conversationId, out).catch(() => {});
    // A pessoa escreveu: a janela de mensagens está aberta, entrega alertas que ficaram pendentes.
    const db = adminDb();
    if (db) await flushConversation(db, incoming.conversationId).catch(e => console.error("raiox: flush", e));
  });
  return NextResponse.json({ ok: true });
}
