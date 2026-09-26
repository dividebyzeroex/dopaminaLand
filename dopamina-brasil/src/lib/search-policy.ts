/** Search terms excluded from the public product comparison. This is a product policy, not legal advice. */
const blockedPatterns = [
  /\b(?:cocaina|crack|heroina|metanfetamina|ecstasy|mdma|lsd|maconha|cannabis|haxixe|anabolizante)\b/,
  /\b(?:arma\s+de\s+fogo|pistola|revolver|fuzil|metralhadora|municao|explosivo|bomba\s+caseira)\b/,
  /\b(?:documento\s+falso|identidade\s+falsa|cartao\s+clonado|dados\s+roubados)\b/,
  /\b(?:pornografia|porno|pornografico|sexo\s+explicito|pedofilia|putaria)\b/,
  /\b(?:caralho|porra|merda|foda(?:-se)?|cuzao|filho\s+da\s+puta|vai\s+tomar\s+no\s+cu)\b/,
];

export function isBlockedSearch(input: string): boolean {
  const normalized = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[._*\-]+/g, " ").replace(/\s+/g, " ").trim();
  return blockedPatterns.some(pattern => pattern.test(normalized));
}
