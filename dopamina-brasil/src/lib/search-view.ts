/**
 * Como a lista de busca é apresentada: ficha curta extraída do título,
 * versões do mesmo modelo agrupadas e ordenação. Funções puras, testadas em
 * tests/search-view.test.ts.
 */

export type Order = "relevancia" | "menor-preco" | "maior-preco";
export const ORDERS: { id: Order; label: string }[] = [
  { id: "relevancia", label: "Relevância" },
  { id: "menor-preco", label: "Menor preço" },
  { id: "maior-preco", label: "Maior preço" },
];
export const parseOrder = (value: unknown): Order => ORDERS.some(o => o.id === value) ? value as Order : "relevancia";

const fold = (text: string) => text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
const pretty = (raw: string) => raw.replace(".", ",");

/**
 * Até 3 dados que diferenciam modelos parecidos: armazenamento, capacidade,
 * tela, potência e voltagem. Nunca inventa: só o que está escrito no título.
 */
export function extractSpecs(name: string): string[] {
  const t = fold(name);
  const out: string[] = [];
  const storage = t.match(/\b(\d{2,4})\s?(gb|tb)\b(?!\s*(?:de\s+)?ram)/);
  if (storage) out.push(`${storage[1]} ${storage[2].toUpperCase()}`);
  const ram = t.match(/\b(\d{1,2})\s?gb\s*(?:de\s+)?ram\b/);
  if (ram) out.push(`${ram[1]} GB RAM`);
  const liters = t.match(/\b(\d{1,2}(?:[.,]\d{1,2})?)\s?(?:l|lt|litros?)\b/);
  if (liters && Number(liters[1].replace(",", ".")) > 0) out.push(`${pretty(liters[1])} L`);
  const screen = t.match(/\b(\d{2}(?:[.,]\d)?)\s?(?:"|''|polegadas|pol\b)/);
  if (screen) out.push(`${pretty(screen[1])}"`);
  const watts = t.match(/\b(\d{2,5})\s?w\b/);
  if (watts) out.push(`${watts[1]} W`);
  const volt = t.match(/\b(bivolt|110\s?v|127\s?v|220\s?v)\b/);
  if (volt) out.push(volt[1] === "bivolt" ? "Bivolt" : volt[1].replace(/\s/, "").toUpperCase());
  return [...new Set(out)].slice(0, 3);
}

const COLORS = "preto|preta|branco|branca|prata|cinza|grafite|azul|vermelho|vermelha|rosa|verde|dourado|dourada|roxo|roxa|amarelo|amarela|lilas|bege|inox|titanio|meia noite|estelar|black|white|silver|gray|grey|blue|red|pink|green|gold|purple|midnight|starlight";
const VARIANT = new RegExp(`\\b(?:${COLORS}|bivolt|110\\s?v|127\\s?v|220\\s?v|cor|na cor)\\b`, "g");

/** Chave do modelo: o título sem cor e voltagem (as "versões" do mesmo produto). */
export function modelKey(name: string): string {
  return fold(name).replace(VARIANT, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export type Grouped<T> = { item: T; versions: number };

/** Agrupa versões mantendo a posição da primeira ocorrência e o menor preço do grupo como representante. */
export function groupVersions<T extends { name: string; price: number }>(items: T[]): Grouped<T>[] {
  const groups = new Map<string, Grouped<T>>();
  for (const item of items) {
    const key = modelKey(item.name);
    const group = groups.get(key);
    if (!group) groups.set(key, { item, versions: 0 });
    else {
      group.versions++;
      if (item.price > 0 && (item.price < group.item.price || !(group.item.price > 0))) group.item = item;
    }
  }
  return [...groups.values()];
}

export function sortGroups<T extends { price: number }>(groups: Grouped<T>[], order: Order): Grouped<T>[] {
  if (order === "relevancia") return groups;
  const dir = order === "menor-preco" ? 1 : -1;
  // Sem preço vai para o fim nas duas ordens.
  return [...groups].sort((a, b) => {
    const pa = a.item.price > 0 ? a.item.price : null;
    const pb = b.item.price > 0 ? b.item.price : null;
    if (pa === null || pb === null) return pa === null ? (pb === null ? 0 : 1) : -1;
    return (pa - pb) * dir;
  });
}
