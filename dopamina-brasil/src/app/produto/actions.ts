"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { getProduct, isSafeProductPath, productTag } from "@/lib/buscape";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** A partir de quanto tempo a pessoa pode pedir uma nova consulta do preço. */
const REFRESH_AFTER_MIN = 20;

/**
 * "Atualizar preço": descarta a consulta guardada deste produto e refaz na hora.
 * Só vale se a consulta atual tiver mais de 20 min (e com limite por IP), para
 * ninguém usar o botão para disparar consultas em massa na fonte.
 */
export async function refreshProductPrice(path: string): Promise<{ ok: boolean; reason?: "recent" | "limit" | "invalid" }> {
  if (!isSafeProductPath(path)) return { ok: false, reason: "invalid" };
  if (!rateLimit(`refresh:${clientIp(await headers())}`, 6, 10 * 60_000).ok) return { ok: false, reason: "limit" };
  const current = await getProduct(path).catch(() => null);
  if (current && Date.now() - Date.parse(current.checkedAt) < REFRESH_AFTER_MIN * 60_000) return { ok: false, reason: "recent" };
  updateTag(productTag(path));
  revalidatePath(`/produto/${path}`);
  return { ok: true };
}
