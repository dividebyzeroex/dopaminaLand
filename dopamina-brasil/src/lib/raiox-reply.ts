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
  return query.length >= 2 && !isGreeting(query) ? { kind: "query", query } : { kind: "empty" };
}

export type RaioxFound = {
  name: string; price: number; productPath: string | null; now?: Date;
  decision: string; headline: string; detail: string; days: number;
  /** Linhas logo abaixo do título (ex.: aviso de meta atingida). */
  lead?: string[];
  /** Convite para pedir aviso de preço (desligado na própria mensagem de alerta). Padrão: ligado. */
  hint?: boolean;
};

/** Convite curto para o alerta; mais direto quando o veredito é esperar. */
export const alertHint = (decision: string) =>
  decision.startsWith("Espere")
    ? "Vale esperar. Responda avisar e eu te chamo quando o preço cair."
    : "Quer aviso quando o preço baixar? Responda: avisar";

export function buildFoundReply(r: RaioxFound): string {
  const lines = [
    "Raio-X Dopamina",
    "",
    ...(r.lead?.length ? [...r.lead, ""] : []),
    r.name,
    `${brl(r.price)}, menor preço entre as lojas`,
    "",
    r.decision,
    r.headline,
  ];
  if (r.detail) lines.push(r.detail);
  if (r.productPath) lines.push("", `Gráfico e histórico: ${SITE}/produto/${r.productPath}`);
  if (r.productPath && r.hint !== false) lines.push("", alertHint(r.decision));
  lines.push("", SIGNATURE, `Dados de ${r.days} dias, consultado em ${dayMonth(r.now ?? new Date())}. ${DISCLAIMER}`);
  return lines.join("\n");
}

/** Boas-vindas e pedido sem produto: explica o que o bot faz, com os dois comandos. */
export const askMessage = () =>
  [
    "Raio-X Dopamina", "",
    "Eu mostro o histórico de preço de um produto e digo se o desconto é real.", "",
    "1. Mande raiox + o link da loja ou o nome. Exemplo: raiox airfryer 5l",
    "2. Depois responda avisar, e eu te chamo quando o preço cair.", "",
    "Grátis, sem cadastro e nenhum veredito pago.", "",
    SIGNATURE,
  ].join("\n");

/** Cumprimentos e pedidos de ajuda: não são produto, recebem as boas-vindas. */
export function isGreeting(text: string): boolean {
  const t = text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  return t.length <= 30 && /^(oi+|ola+|opa|eai|e ai|hey|hello|bom dia|boa tarde|boa noite|ajuda|ajudar|help|menu|comecar|iniciar|start|como funciona|como usar|o que voce faz|quem e voce)( tudo bem| tudo bom| td bem)?$/.test(t);
}

export const notFoundMessage = () =>
  ["Raio-X Dopamina", "", "Não achei esse produto com preço verificável. Tente o nome completo, com modelo e capacidade.", `Ou pesquise em ${SITE}`, "", SIGNATURE].join("\n");

export const errorMessage = () =>
  ["Raio-X Dopamina", "", "Não consegui consultar os preços agora. Tente de novo em alguns minutos.", "", SIGNATURE].join("\n");

export const limitMessage = () =>
  ["Raio-X Dopamina", "", "Muitas consultas seguidas. Espere um minuto e mande de novo.", "", SIGNATURE].join("\n");

export const blockedReply = (message: string) => ["Raio-X Dopamina", "", message].join("\n");

/** Número em reais como a pessoa escreve: "1500", "1.500", "1.500,90", "R$ 1500". */
export function parseBrl(text: string): number | null {
  const m = text.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+\.\d{1,2})(?!\d)/i);
  if (!m) return null;
  const raw = m[1];
  const normalized = /^\d{1,3}(?:\.\d{3})+/.test(raw) ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) && value >= 1 && value <= 1_000_000 ? Math.round(value * 100) / 100 : null;
}

export type Command = { kind: "watch"; target: number | null } | { kind: "stop" };

/** "avisar", "avisar 1500", "meta 1.500", "parar". Qualquer outro texto é um pedido de Raio-X. */
export function parseCommand(text: string): Command | null {
  const t = text.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  if (/^(parar|cancelar|sair|desativar)\b/.test(t) && t.length <= 40) return { kind: "stop" };
  const m = t.match(/^(?:me\s+)?(avisar|avisa|aviso|alerta|alertar|meta)\b(.*)$/);
  if (!m || m[2].length > 40) return null;
  return { kind: "watch", target: parseBrl(m[2]) };
}

/** Sem valor, o alerta é para 5% abaixo do preço de hoje, arredondado para baixo. */
export const defaultTarget = (price: number) => Math.floor(price * 0.95);

const head = (...lines: string[]) => ["Raio-X Dopamina", "", ...lines, "", SIGNATURE].join("\n");
export const watchSetMessage = (name: string, target: number, price: number, auto: boolean) =>
  head(
    `Combinado. Aviso você por aqui quando ${name} chegar a ${brl(target)}${auto ? " (5% abaixo de hoje)" : ""}. Hoje: ${brl(price)}.`,
    "Para outro valor, responda: meta 1500. Para parar: parar.",
    "Se o Instagram bloquear o envio, o aviso chega na sua próxima mensagem para cá.",
  );
export const watchAlreadyMessage = (name: string, target: number, price: number) =>
  head(`${name} já está em ${brl(price)}, abaixo da meta de ${brl(target)}.`, "Confira o histórico antes de decidir: responda raiox + o nome para ver o veredito.");
export const watchNoContextMessage = () =>
  head("Para avisar, preciso saber o produto. Mande primeiro: raiox + o link ou o nome.", "Depois responda: avisar.");
export const watchStopMessage = (count: number) =>
  head(count > 0 ? `Pronto. Parei ${count === 1 ? "o aviso" : `os ${count} avisos`}.` : "Você não tem avisos ativos.");

export const publicCommentReply = () => "Te mandei o Raio-X no Direct. Se não aparecer, olhe as Solicitações de mensagem. Antes da dopamina, o histórico.";

export function buildTargetReply(r: RaioxFound & { target: number }): string {
  return buildFoundReply({ ...r, hint: false, lead: [`Alerta de preço: chegou na sua meta de ${brl(r.target)}.`] });
}
