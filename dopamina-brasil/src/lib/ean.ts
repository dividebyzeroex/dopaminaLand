/**
 * Códigos de barras de produto (EAN-13, EAN-8, UPC-A). Validação pelo dígito
 * verificador, para não consultar serviços com leituras erradas da câmera.
 * Testado em tests/ean.test.ts.
 */
export function normalizeGtin(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  const body = digits.slice(0, -1);
  const check = Number(digits.at(-1));
  let sum = 0;
  // Da direita para a esquerda, pesos 3 e 1 alternados (padrão GS1).
  for (let i = 0; i < body.length; i++) sum += Number(body[body.length - 1 - i]) * (i % 2 === 0 ? 3 : 1);
  const expected = (10 - (sum % 10)) % 10;
  if (expected !== check) return null;
  // UPC-A (12) vira EAN-13 com zero à esquerda: é como a maioria das bases guarda.
  return digits.length === 12 ? `0${digits}` : digits;
}

/** Limpa o nome vindo das bases de código de barras para virar termo de busca. */
export function nameToQuery(name: string): string {
  return name
    .replace(/\b(?:cx|und|unid|un|pct|c\/\d+)\b\.?/gi, " ")
    .replace(/[^\p{L}\p{N}\s.,"-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
