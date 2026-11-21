import { NextRequest, NextResponse } from "next/server";
import { isSafeProductPath } from "@/lib/buscape";
import { analyzeProduct } from "@/lib/analysis";
import { decisionOf } from "@/lib/price-verdict";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Preço atual de um produto, usado pela checagem de alertas feita no próprio aparelho. */
export async function GET(req: NextRequest) {
  if (!rateLimit(`preco:${clientIp(req.headers)}`, 60, 60_000).ok) return NextResponse.json({ ok: false, error: "Muitas consultas." }, { status: 429 });
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!isSafeProductPath(path)) return NextResponse.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  // analyzeProduct devolve null também para conteúdo adulto (não exibimos).
  const analysis = await analyzeProduct(path).catch(() => null);
  if (!analysis?.product.bestPrice) return NextResponse.json({ ok: false, error: "Preço indisponível agora." }, { status: 404 });
  const { product, verdict } = analysis;
  return NextResponse.json(
    {
      ok: true, path: product.path, name: product.name, image: product.image ?? null, price: product.bestPrice, store: product.bestStore, checkedAt: product.checkedAt,
      verdict: { kind: verdict.kind, tone: verdict.tone, label: verdict.label, decision: decisionOf(verdict.kind) },
    },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
