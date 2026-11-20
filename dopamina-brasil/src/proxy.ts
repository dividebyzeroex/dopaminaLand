import { NextResponse, type NextRequest } from "next/server";
import { checkSearch } from "@/lib/search-policy";

/**
 * Barra buscas ofensivas ou proibidas antes de a página ser montada: o termo
 * sai da URL (histórico, links compartilhados, Google Analytics) e nunca chega
 * ao HTML. A página /busca mostra só uma mensagem neutra.
 */
export function proxy(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.next();
  const policy = checkSearch(q);
  if (!policy.blocked) return NextResponse.next();
  const target = new URL("/busca", request.url);
  target.search = "";
  target.searchParams.set("bloqueada", policy.reason);
  return NextResponse.redirect(target, 303);
}

export const config = {
  matcher: ["/busca", "/relatorio"],
};
