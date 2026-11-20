import { checkSearch, sanitizeQueryForStorage } from "../src/lib/search-policy.ts";

let fail = 0;
const expectBlocked = (q: string, reason?: string) => {
  const r = checkSearch(q);
  const ok = r.blocked && (!reason || r.reason === reason);
  if (!ok) fail++;
  console.log(ok ? "ok  " : "FAIL", `barra: "${q}"`, ok ? "" : `→ ${JSON.stringify(r)}`);
};
const expectAllowed = (q: string) => {
  const r = checkSearch(q);
  if (r.blocked) fail++;
  console.log(!r.blocked ? "ok  " : "FAIL", `libera: "${q}"`, r.blocked ? `→ ${r.reason}` : "");
};

// Ofensivos, inclusive disfarçados
expectBlocked("porra", "ofensivo");
expectBlocked("P0RR4", "ofensivo");
expectBlocked("porrrrra", "ofensivo");
expectBlocked("p o r r a", "ofensivo");
expectBlocked("p.o.r.r.a", "ofensivo");
expectBlocked("CARALHO de iphone", "ofensivo");
expectBlocked("fdp", "ofensivo");
expectBlocked("vai tomar no cu", "ofensivo");
// Ódio
expectBlocked("viado", "odio");
expectBlocked("camiseta suástica", "odio");
expectBlocked("símbolo nazista", "odio");
// Sexual / menores
expectBlocked("pornô", "sexual");
expectBlocked("novinha pelada", "sexual");
expectBlocked("pedofilia", "sexual");
// Ilegal
expectBlocked("maconha", "ilegal");
expectBlocked("cartão clonado", "ilegal");
expectBlocked("revólver 38", "ilegal");
expectBlocked("pistola 9mm", "ilegal");
expectBlocked("munição .40", "ilegal");
expectBlocked("hackear whatsapp", "ilegal");
// Violência e autolesão
expectBlocked("como matar alguém", "violencia");
expectBlocked("como se matar", "autolesao");

// Produtos legítimos que NÃO podem ser barrados
for (const q of [
  "iPhone 16", "cueca boxer", "pistola de cola quente", "pistola de pintura", "revólver de brinquedo",
  "nerf fuzil", "pistola de água", "batom nude", "sandália nude", "O Idiota Dostoiévski", "veado de pelúcia",
  "como matar barata", "veneno para cupim", "computador", "Scunci", "putter de golfe", "Puma tênis",
  "bichon frisé ração", "macaco hidráulico", "consulta cpf serasa", "cuíca instrumento", "caixa de som JBL",
  "Microsoft Excel", "Dyson", "bomba de água", "dinamômetro", "Cuisinart", "mascote",
]) expectAllowed(q);

// Nunca gravar o termo bloqueado como foi digitado
const stored = sanitizeQueryForStorage("p0rr4 de iphone");
if (stored !== "[bloqueada:ofensivo]") fail++;
console.log(stored === "[bloqueada:ofensivo]" ? "ok  " : "FAIL", "armazenamento substitui termo bloqueado", stored);
process.exit(fail);
