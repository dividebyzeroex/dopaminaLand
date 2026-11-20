/**
 * Política de busca: termos ofensivos ou que violam regras são barrados na
 * entrada (caixa de busca, /busca, APIs) e nunca aparecem em listas públicas
 * (termômetro, buscas recentes) nem ficam gravados como foram digitados.
 *
 * Política de produto, não parecer jurídico. Testado em tests/search-policy.test.ts.
 *
 * Normalização contra disfarces comuns: acentos, maiúsculas, números/símbolos no
 * lugar de letras (p0rr4, $exo, @), letras repetidas (porrrra), letras separadas
 * (p o r r a, p.o.r.r.a) e pontuação entre palavras.
 */

export type BlockReason = "ofensivo" | "odio" | "sexual" | "ilegal" | "violencia" | "autolesao";
export type PolicyResult = { blocked: false } | { blocked: true; reason: BlockReason };

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "i" };

/** Texto base: sem acentos, minúsculo, sem pontuação, espaços simples. */
function base(input: string): string {
  return input.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Variações do texto para pegar disfarces, sem perder a forma original. */
export function variants(input: string): string[] {
  const plain = base(input).replace(/[^a-z0-9@$!|\s]+/g, " ").replace(/\s+/g, " ").trim();
  const leet = plain.replace(/[0134578@$!|]/g, c => LEET[c] ?? c).replace(/\s+/g, " ").trim();
  // "p o r r a" / "p.o.r.r.a" → "porra": junta sequências de letras isoladas.
  const joined = leet.replace(/\b(?:[a-z] ){2,}[a-z]\b/g, m => m.replace(/ /g, ""));
  // "porrrra" → "porra" (mantém letras dobradas legítimas como "rr", "ss").
  const squeezed = joined.replace(/([a-z])\1{2,}/g, "$1$1");
  // "poorra" → "pora": versão sem nenhuma repetição, só para termos que não perdem sentido.
  const single = joined.replace(/([a-z])\1+/g, "$1");
  return [...new Set([plain, leet, joined, squeezed, single])];
}

type Rule = { reason: BlockReason; pattern: RegExp };

const w = (words: string) => new RegExp(`(?:^|\\s)(?:${words})(?=\\s|$)`);

/**
 * Listas por categoria. Palavras curtas ou ambíguas usam fronteira de palavra
 * (w) para não barrar produtos legítimos ("cueca", "pistola de cola quente").
 */
const RULES: Rule[] = [
  // Palavrões e insultos fortes (insultos leves como "idiota" ficam de fora: são títulos de livros e filmes)
  { reason: "ofensivo", pattern: w("porra|caralh[oa]s?|merdas?|fod[ae]r?|foda ?se|fodid[oa]s?|fudid[oa]s?|put[ao]s?|putaria|puteiro|cu|cuz[aã]o|cuzinho|arrombad[oa]s?|buceta|boceta|xoxota|xereca|piroca|caceta|punheta|siririca|vagabund[oa]s?|desgracad[oa]s?|filh[oa] da puta|fdp|vsf|vtnc|pqp|krl|vai tomar no cu|vai se foder") },
  // Ódio e discriminação (inclui símbolos nazistas, cuja divulgação é crime no Brasil)
  { reason: "odio", pattern: w("viad[oa]s?|bichon?a|sapat[aã]o|traveco|retardad[oa]s?|mongoloide|negr[oa] imund[oa]|judeu imundo|nazis(?:mo|ta)s?|suastica|simbolo nazista|heil hitler|ku klux klan|supremacia branca") },
  // Conteúdo sexual explícito e envolvendo menores ("nude" sozinho fica liberado: batom nude, sandália nude)
  { reason: "sexual", pattern: w("porn[oô]?|pornografi(?:a|co)|sexo explicito|nudes vazad[oa]s?|pack de nudes|pack do pezinho|mulher pelada|mulheres peladas|novinhas? pelad[oa]s?|xvideos|onlyfans vazad[oa]|pedofil(?:ia|o)|cp infantil|abuso infantil|estupro") },
  // Drogas e fraudes
  { reason: "ilegal", pattern: w("cocaina|crack|heroina|metanfetamina|ecstasy|mdma|lsd|maconha|cannabis|haxixe|skunk|lanca perfume|lolo|ketamina|anabolizantes?|bomba caseira|fazer bomba caseira|explosivos?|documento falso|identidade falsa|cnh falsa|diploma falso|nota falsa|notas falsas|dinheiro falso|cartao clonado|cartoes clonados|dados roubados|cc full|painel de consulta|hackear (?:whatsapp|instagram|conta|celular)|clonar (?:whatsapp|cartao)|espionar celular") },
  // Violência contra pessoas ("como matar barata" e afins seguem liberados)
  { reason: "violencia", pattern: w("matar (?:alguem|uma pessoa|pessoas|meu \\w+|minha \\w+)|assassinar|esquartejar") },
  // Autolesão: além de barrar, mostramos onde buscar ajuda (CVV 188)
  { reason: "autolesao", pattern: w("como se matar|me matar|quero morrer|suicidio|suicidar|cometer suicidio|automutilacao|me cortar") },
];

/** Armas de fogo e munição; brinquedos, airsoft e acessórios seguem liberados. */
const WEAPONS = w("arma de fogo|armas de fogo|revolver|revolveres|fuzil|fuzis|metralhadora|submetralhadora|municao|municoes|pistola (?:9mm|380|40|taurus|imbel|glock)|silenciador de arma");
const WEAPON_SAFE = /(?:^|\s)(?:brinquedo|airsoft|nerf|espoleta|gel|agua|pressao|spring|replica|decorativ[oa]|chaveiro|fantasia|cola|pintura|calor|ar quente|lego|playmobil)(?:\s|$)/;

export function checkSearch(input: string): PolicyResult {
  if (!input) return { blocked: false };
  for (const text of variants(input)) {
    for (const rule of RULES) if (rule.pattern.test(text)) return { blocked: true, reason: rule.reason };
    if (WEAPONS.test(text) && !WEAPON_SAFE.test(text)) return { blocked: true, reason: "ilegal" };
  }
  return { blocked: false };
}

export function isBlockedSearch(input: string): boolean {
  return checkSearch(input).blocked;
}

/** Mensagem neutra para a pessoa (nunca repete o termo digitado). */
export function blockedMessage(reason: BlockReason): string {
  if (reason === "autolesao") return "Se você está passando por um momento difícil, não precisa enfrentar isso sozinho. Fale com o CVV, de graça e 24 horas: ligue 188 ou acesse cvv.org.br.";
  return "Esta pesquisa não é permitida. Busque um produto pelo nome ou modelo.";
}

/** Para gravar em logs/analytics: o termo bloqueado nunca é armazenado como foi digitado. */
export function sanitizeQueryForStorage(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const result = checkSearch(input);
  return result.blocked ? `[bloqueada:${result.reason}]` : input.slice(0, 200);
}
