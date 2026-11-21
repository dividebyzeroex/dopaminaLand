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
  /** Lista de presente (ex.: "natal-2026"), quando a pessoa separou o item para uma data. */
  gift?: string;
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
  const merged = existing ? { ...item, price: existing.price, savedAt: existing.savedAt, image: item.image ?? existing.image, gift: item.gift ?? existing.gift } : item;
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

// ── Listas de presente por data ──────────────────────────────────────────────

/** Datas em que as pessoas compram presente (Black Friday e Consumidor não entram). */
export const GIFT_EVENT_IDS = ["natal", "maes", "namorados", "pais", "criancas"] as const;

export type GiftOccasion = { key: string; name: string; date: string; daysLeft: number };

/** Próxima data de presente a partir de ocorrências do calendário (já ordenadas por data). */
export function nextGiftOccasion(occurrences: { event: { id: string; name: string }; date: string; daysLeft: number }[]): GiftOccasion | null {
  const next = occurrences.find(o => (GIFT_EVENT_IDS as readonly string[]).includes(o.event.id) && o.daysLeft >= 0);
  return next ? { key: `${next.event.id}-${next.date.slice(0, 4)}`, name: `${next.event.name} ${next.date.slice(0, 4)}`, date: next.date, daysLeft: next.daysLeft } : null;
}

export function withGift(list: SavedItem[], path: string, gift: string | null): SavedItem[] {
  return list.map(x => (x.path === path ? { ...x, gift: gift ?? undefined } : x));
}

/** Total da lista: quanto custava quando salvou, quanto custa agora (só itens com preço atual). */
export function giftTotals(items: { price: number; now: number | null }[]) {
  const priced = items.filter(x => x.now !== null && x.now > 0);
  const saved = priced.reduce((sum, x) => sum + x.price, 0);
  const now = priced.reduce((sum, x) => sum + (x.now as number), 0);
  return { count: items.length, priced: priced.length, saved, now, diff: now - saved };
}
