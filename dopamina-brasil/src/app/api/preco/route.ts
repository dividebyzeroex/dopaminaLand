import { NextRequest, NextResponse } from "next/server";
import { getProduct, isSafeProductPath } from "@/lib/buscape";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Preço atual de um produto, usado pela checagem de alertas feita no próprio aparelho. */
export async function GET(req: NextRequest) {
  if (!rateLimit(`preco:${clientIp(req.headers)}`, 60, 60_000).ok) return NextResponse.json({ ok: false, error: "Muitas consultas." }, { status: 429 });
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!isSafeProductPath(path)) return NextResponse.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  const product = await getProduct(path).catch(() => null);
  if (!product?.bestPrice) return NextResponse.json({ ok: false, error: "Preço indisponível agora." }, { status: 502 });
  return NextResponse.json(
    { ok: true, path: product.path, name: product.name, price: product.bestPrice, store: product.bestStore, checkedAt: product.checkedAt },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
