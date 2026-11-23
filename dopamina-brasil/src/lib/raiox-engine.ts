import { getProduct, normalizeQuery, queryFromUrl, searchProducts } from "./buscape";
import { computeVerdict, decisionOf } from "./price-verdict";
import { blockedMessage, checkSearch, sanitizeQueryForStorage } from "./search-policy";
import { rateLimit } from "./rate-limit";
import { askMessage, blockedReply, buildFoundReply, limitMessage, notFoundMessage, parseRequest } from "./raiox-reply";

/** Motor do Raio-X: do texto da pessoa ao texto da resposta, mais o que registrar nas métricas. */
export type Outcome = {
  text: string;
  outcome: "found" | "ask" | "not_found" | "blocked" | "limit";
  query?: string; path?: string; name?: string; price?: number; verdict?: string;
};

export async function lookup(text: string, senderKey: string): Promise<Outcome> {
  const request = parseRequest(text);
  // "none" não chega aqui (o webhook filtra antes), mas se chegar: boas-vindas, nunca uma busca.
  if (request.kind === "empty" || request.kind === "none") return { text: askMessage(), outcome: "ask" };
  if (!rateLimit(`zernio:${senderKey}`, 6, 60_000).ok) return { text: limitMessage(), outcome: "limit" };

  const raw = request.kind === "link" ? queryFromUrl(request.url) : request.query;
  const query = raw ? normalizeQuery(raw) : "";
  const stored = sanitizeQueryForStorage(query);
  if (query.length < 2) return { text: notFoundMessage(), outcome: "not_found", query: stored };
  const policy = checkSearch(query);
  if (policy.blocked) return { text: blockedReply(blockedMessage(policy.reason)), outcome: "blocked", query: stored };

  const [first] = await searchProducts(query.toLowerCase());
  if (!first) return { text: notFoundMessage(), outcome: "not_found", query: stored };
  const detail = first.path ? await getProduct(first.path).catch(() => null) : null;
  const price = detail?.bestPrice ?? first.price;
  if (!(price > 0)) return { text: notFoundMessage(), outcome: "not_found", query: stored };
  const verdict = detail ? computeVerdict(detail.history, price) : null;
  const name = detail?.name ?? first.name;
  return {
    outcome: "found", query: stored, path: first.path ?? undefined, name, price, verdict: verdict?.kind ?? "insuficiente",
    text: buildFoundReply({
      name, price, productPath: first.path ?? null,
      decision: decisionOf(verdict?.kind ?? "insuficiente"),
      headline: verdict?.headline ?? "Ainda não há histórico suficiente para um veredito.",
      detail: verdict?.detail ?? "", days: verdict?.days ?? 0,
    }),
  };
}
