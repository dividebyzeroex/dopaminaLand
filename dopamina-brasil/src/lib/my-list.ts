/**
 * "Minha lista": produtos salvos neste aparelho (localStorage), sem cadastro.
 * Criar um alerta também salva o produto, então lista e alertas andam juntos.
 * As funções puras (parse, change) são testadas em tests/my-list.test.ts.
 */

export type SavedItem = {
  path: string;
  name: string;
  image?: string;
  /** Menor preço no momento em que a pessoa salvou. */
  price: number;
  savedAt: string;
};

export const LIST_KEY = "dopamina:lista";
export const LIST_MAX = 60;

export function parseList(raw: string | null): SavedItem[] {
  try {
    const list = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return [];
    return list.filter((x): x is SavedItem => x && typeof x.path === "string" && typeof x.name === "string" && typeof x.price === "number" && x.price > 0 && typeof x.savedAt === "string");
  } catch { return []; }
}

/** Adiciona ou mantém (sem trocar o preço de quando salvou). Mais recente primeiro. */
export function withItem(list: SavedItem[], item: SavedItem): SavedItem[] {
  const existing = list.find(x => x.path === item.path);
  const merged = existing ? { ...item, price: existing.price, savedAt: existing.savedAt, image: item.image ?? existing.image } : item;
  return [merged, ...list.filter(x => x.path !== item.path)].slice(0, LIST_MAX);
}

export const withoutItem = (list: SavedItem[], path: string) => list.filter(x => x.path !== path);

export type ChangeSinceSaved = { kind: "down" | "up" | "same"; pct: number; diff: number };

/** Variação desde que salvou; até 0,5% conta como "mesmo preço". */
export function changeSinceSaved(saved: number, now: number): ChangeSinceSaved {
  const pct = (now - saved) / saved;
  const kind = Math.abs(pct) < 0.005 ? "same" : pct < 0 ? "down" : "up";
  return { kind, pct, diff: now - saved };
}
