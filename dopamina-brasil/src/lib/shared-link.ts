/**
 * Extrai o link de produto de um texto compartilhado ou colado.
 * Apps de loja costumam mandar "Olha isso! https://..." no campo de texto,
 * e não no campo url. Testado em tests/shared-link.test.ts.
 */
export function extractLink(...parts: (string | null | undefined)[]): string | null {
  for (const part of parts) {
    const match = part?.match(/https?:\/\/[^\s<>"']+/i);
    if (match) return match[0].replace(/[).,;!?]+$/, "");
  }
  return null;
}

/** O que buscar a partir do que foi compartilhado: o link, ou o texto (título do produto). */
export function sharedQuery(input: { url?: string | null; text?: string | null; title?: string | null }): string | null {
  const link = extractLink(input.url, input.text, input.title);
  if (link) return link;
  const text = (input.text || input.title || "").replace(/\s+/g, " ").trim();
  return text.length >= 2 ? text.slice(0, 120) : null;
}
