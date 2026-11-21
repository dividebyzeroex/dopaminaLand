import { NextRequest, NextResponse } from "next/server";
import { sharedQuery } from "@/lib/shared-link";

/**
 * Destino do "Compartilhar" do Android (share_target do manifesto): o app da loja
 * manda o link e a pessoa cai direto no veredito. A política de busca (proxy.ts)
 * continua valendo no redirecionamento para /busca.
 */
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const query = sharedQuery({ url: p.get("url"), text: p.get("text"), title: p.get("title") });
  const target = new URL(query ? "/busca" : "/", req.url);
  target.search = "";
  if (query) { target.searchParams.set("q", query); target.searchParams.set("origem", "compartilhar"); }
  return NextResponse.redirect(target, 303);
}
