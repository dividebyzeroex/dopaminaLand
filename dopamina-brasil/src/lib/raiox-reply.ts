import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Peças puras do bot "Raio-X" no Instagram/WhatsApp (webhook do Zernio):
 * assinatura, leitura da mensagem recebida, pedido do usuário e texto da resposta.
 * Testadas em tests/raiox-reply.test.ts.
 */

const extractLink = (text: string): string | null => {
  const m = text.match(/https?:\/\/[^\s<>"']+/i);
  return m ? m[0].replace(/[).,;!?]+$/, "") : null;
};

const SITE = "https://www.dopaminado.com.br";
export const SIGNATURE = "Antes da dopamina, o histórico.";
export const DISCLAIMER = "Preços mudam ao longo do dia; confira na loja antes de pagar.";

const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const dayMonth = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });

/** HMAC-SHA256 hex do corpo bruto, comparado em tempo constante. */
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim().toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

export type Incoming = { eventId: string; conversationId: string; accountId: string; senderId: string; text: string };

/** Só mensagens de entrada de pessoas, fora do modo "standby" (humano atendendo). */
export function parseIncoming(payload: unknown): Incoming | null {
  const p = payload as {
    id?: string; event?: string; test?: boolean;
    message?: { conversationId?: string; direction?: string; text?: string | null; sender?: { id?: string } };
    account?: { accountId?: string; id?: string };
    metadata?: { standby?: boolean };
  } | null;
  if (!p || p.event !== "message.received" || !p.id) return null;
  const m = p.message;
  if (!m || m.direction !== "incoming" || !m.conversationId) return null;
  if (p.metadata?.standby === true) return null;
  const text = typeof m.text === "string" ? m.text.trim() : "";
  const accountId = p.account?.accountId || p.account?.id;
  if (!text || !accountId) return null;
  return { eventId: p.id, conversationId: m.conversationId, accountId, senderId: m.sender?.id || m.conversationId, text };
}

export type IncomingComment = { eventId: string; postId: string; commentId: string; accountId: string; authorId: string; text: string };

/** Comentário novo de outra pessoa (Instagram/Facebook) que pede o Raio-X pela palavra-chave. */
export function parseComment(payload: unknown): IncomingComment | null {
  const p = payload as {
    id?: string; event?: string;
    comment?: { id?: string; postId?: string; platformPostId?: string; platform?: string; text?: string | null; isReply?: boolean; author?: { id?: string; isOwnAccount?: boolean } };
    account?: { accountId?: string; id?: string };
  } | null;
  if (!p || p.event !== "comment.received" || !p.id || !p.comment) return null;
  const c = p.comment;
  if (c.platform !== "instagram" && c.platform !== "facebook") return null;
  if (c.isReply || c.author?.isOwnAccount) return null;
  const text = typeof c.text === "string" ? c.text.trim() : "";
  if (!/\braio[\s-]?x\b/i.test(text)) return null;
  const postId = c.platformPostId || c.postId;
  const accountId = p.account?.accountId || p.account?.id;
  if (!c.id || !postId || !accountId) return null;
  return { eventId: p.id, postId, commentId: c.id, accountId, authorId: c.author?.id || c.id, text };
}

export type RaioxRequest = { kind: "link"; url: string } | { kind: "query"; query: string } | { kind: "empty" };

/** Tira a palavra-chave ("raiox", "raio-x", "raio x") e entende link ou nome do produto. */
export function parseRequest(text: string): RaioxRequest {
  const link = extractLink(text);
  if (link) return { kind: "link", url: link };
  const query = text.replace(/^\s*(?:@\w+\s*)?raio[\s-]?x\b[\s:,.\-–—]*/i, "").replace(/\s+/g, " ").trim().slice(0, 120);
  return query.length >= 2 ? { kind: "query", query } : { kind: "empty" };
}

export type RaioxFound = {
  name: string; price: number; productPath: string | null; now?: Date;
  decision: string; headline: string; detail: string; days: number;
};

export function buildFoundReply(r: RaioxFound): string {
  const lines = [
    "Raio-X Dopamina",
    "",
    r.name,
    `${brl(r.price)}, menor preço entre as lojas`,
    "",
    r.decision,
    r.headline,
  ];
  if (r.detail) lines.push(r.detail);
  if (r.productPath) lines.push("", `Gráfico e histórico: ${SITE}/produto/${r.productPath}`);
  lines.push("", SIGNATURE, `Dados de ${r.days} dias, consultado em ${dayMonth(r.now ?? new Date())}. ${DISCLAIMER}`);
  return lines.join("\n");
}

export const askMessage = () =>
  ["Raio-X Dopamina", "", "Me manda o link do produto (ou o nome) e eu devolvo o histórico de preço e o veredito.", "Exemplo: raiox iPhone 15 128GB", "", SIGNATURE].join("\n");

export const notFoundMessage = () =>
  ["Raio-X Dopamina", "", "Não achei esse produto com preço verificável. Tente o nome completo, com modelo e capacidade.", `Ou pesquise em ${SITE}`, "", SIGNATURE].join("\n");

export const errorMessage = () =>
  ["Raio-X Dopamina", "", "Não consegui consultar os preços agora. Tente de novo em alguns minutos.", "", SIGNATURE].join("\n");

export const limitMessage = () =>
  ["Raio-X Dopamina", "", "Muitas consultas seguidas. Espere um minuto e mande de novo.", "", SIGNATURE].join("\n");

export const blockedReply = (message: string) => ["Raio-X Dopamina", "", message].join("\n");
