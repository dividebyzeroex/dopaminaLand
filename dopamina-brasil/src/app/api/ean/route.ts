import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { nameToQuery, normalizeGtin } from "@/lib/ean";
import { checkSearch } from "@/lib/search-policy";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Código de barras → nome do produto, para o leitor da loja física.
 * A fonte de preços (Buscapé) não busca por código, então traduzimos antes:
 * 1. Cosmos (Bluesoft), base brasileira de GTIN — precisa de COSMOS_TOKEN;
 * 2. UPCitemdb (plano gratuito, limite diário baixo);
 * 3. Open Food Facts (alimentos e mercado).
 * O resultado de cada código fica em cache por 30 dias.
 */
const UA = "Dopamina/1.0 (+https://www.dopaminado.com.br)";

async function json(url: string, headers: Record<string, string> = {}) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json", ...headers }, signal: AbortSignal.timeout(6000), cache: "no-store" });
  return r.ok ? r.json() : null;
}

async function lookupUncached(code: string): Promise<{ name: string; source: string }> {
  const token = process.env.COSMOS_TOKEN;
  if (token) {
    const d = await json(`https://api.cosmos.bluesoft.com.br/gtins/${code}.json`, { "X-Cosmos-Token": token }).catch(() => null);
    if (typeof d?.description === "string" && d.description.trim()) return { name: d.description, source: "cosmos" };
  }
  const u = await json(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`).catch(() => null);
  const title = u?.items?.[0]?.title;
  if (typeof title === "string" && title.trim()) return { name: title, source: "upcitemdb" };
  const off = await json(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands`).catch(() => null);
  const name = off?.product?.product_name;
  if (typeof name === "string" && name.trim()) return { name: [name, off.product.brands?.split(",")[0]].filter(Boolean).join(" "), source: "openfoodfacts" };
  // Erro em vez de null: o cache não guarda falhas (um limite diário estourado hoje
  // não pode marcar o código como "desconhecido" por 30 dias).
  throw new Error("código não encontrado");
}

const lookup = (code: string) => unstable_cache(() => lookupUncached(code), ["ean-v1", code], { revalidate: 30 * 86400 })();

export async function GET(req: NextRequest) {
  if (!rateLimit(`ean:${clientIp(req.headers)}`, 20, 60_000).ok) return NextResponse.json({ ok: false, error: "Muitas leituras seguidas. Tente em instantes." }, { status: 429 });
  const code = normalizeGtin(req.nextUrl.searchParams.get("code") ?? "");
  if (!code) return NextResponse.json({ ok: false, error: "Código de barras inválido. Tente ler de novo." }, { status: 400 });
  const found = await lookup(code).catch(() => null);
  if (!found) return NextResponse.json({ ok: false, code, error: "Não encontramos este código. Digite o nome do produto." }, { status: 404 });
  const query = nameToQuery(found.name);
  if (checkSearch(query).blocked) return NextResponse.json({ ok: false, error: "Produto não disponível." }, { status: 404 });
  return NextResponse.json({ ok: true, code, name: found.name, query, source: found.source }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
}
