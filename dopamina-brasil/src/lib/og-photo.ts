/** Baixa a foto do produto antes de desenhar a imagem; se falhar, a imagem sai sem foto em vez de quebrar. */
export async function photo(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch { return null; }
}
