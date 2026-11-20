import { NextRequest, NextResponse } from "next/server";
import { checkSearch } from "@/lib/search-policy";
import { getProduct, normalizeQuery, queryFromUrl, searchProducts } from "@/lib/buscape";
import { computeVerdict } from "@/lib/price-verdict";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * API pública usada pelo site, pelo relatório em PDF e pela extensão do navegador.
 * O CORS continua aberto porque a extensão roda dentro das páginas das lojas;
 * a proteção contra abuso é o limite por IP e o cache das consultas.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const SITE = "https://www.dopaminado.com.br";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function fail(error: string, status: number, extra: Record<string, string> = {}) {
  return NextResponse.json({ success: false, error }, { status, headers: { ...corsHeaders, ...extra } });
}

export async function GET(req: NextRequest) {
  const limit = rateLimit(`ph:${clientIp(req.headers)}`, 30, 60_000);
  if (!limit.ok) return fail("Muitas consultas em pouco tempo. Tente novamente em instantes.", 429, { "Retry-After": String(limit.retryAfter) });

  const { searchParams } = req.nextUrl;
  const inputUrl = searchParams.get("url");
  const raw = searchParams.get("q") || searchParams.get("query") || (inputUrl ? queryFromUrl(inputUrl) : null);
  const query = raw ? normalizeQuery(raw) : "";
  if (query.length < 2) return fail('Informe o parâmetro "q" ou "url".', 400);
  if (checkSearch(query).blocked) return fail("Esta pesquisa não é permitida.", 400);

  const informed = Number.parseFloat(searchParams.get("current_price") || searchParams.get("storePrice") || "");

  try {
    const hits = await searchProducts(query.toLowerCase());
    const [first, ...rest] = hits;
    if (!first) return fail("Preço verificável indisponível para esta busca.", 404);

    const detail = first.path ? await getProduct(first.path).catch(() => null) : null;
    const scrapedPrice = detail?.bestPrice ?? first.price;
    const verdict = detail ? computeVerdict(detail.history, scrapedPrice) : null;

    const hasComparison = Number.isFinite(informed) && informed > 0;
    const observed = hasComparison ? informed : scrapedPrice;
    const diff = hasComparison ? Math.max(0, ((observed - scrapedPrice) / observed) * 100) : 0;
    const isAlert = hasComparison && observed > scrapedPrice;

    return NextResponse.json({
      success: true,
      query,
      scraped_name: detail?.name ?? first.name,
      image: detail?.image ?? first.image,
      scraped_price: scrapedPrice,
      current_price: observed,
      overpriced_percent: Number(diff.toFixed(1)),
      savings: hasComparison ? Number(Math.max(0, observed - scrapedPrice).toFixed(2)) : 0,
      has_comparison: hasComparison,
      checked_at: detail?.checkedAt ?? new Date().toISOString(),
      url: first.sourceUrl,
      product_url: first.path ? `${SITE}/produto/${first.path}` : null,
      is_fomo_alert: isAlert,
      message: !hasComparison
        ? "Preço encontrado nesta consulta. Confira o produto, frete e condições na loja antes de comprar."
        : isAlert
          ? `Encontramos um resultado ${diff.toFixed(1)}% mais barato. Confira se é o mesmo produto e as condições da oferta.`
          : "O preço informado está próximo do resultado encontrado nesta consulta.",
      verdict: verdict && { kind: verdict.kind, label: verdict.label, headline: verdict.headline, detail: verdict.detail, days: verdict.days, median: verdict.median, min: verdict.min },
      price_history: detail?.history ?? [],
      market_alternatives: rest.slice(0, 5).map(hit => ({ name: hit.name, price: hit.price, link: hit.sourceUrl, image: hit.image })),
    }, { headers: { ...corsHeaders, "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return fail("Não foi possível consultar preços agora.", 502);
  }
}
