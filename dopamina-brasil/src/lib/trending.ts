import { createClient } from "@supabase/supabase-js";
import { ACCESSORY, foldText, getPopularProducts, normalizeQuery, searchProducts } from "./buscape";
import { isBlockedSearch } from "./search-policy";
import { mapLimit } from "./analysis";
import { pickRotating } from "./rotation";
import type { CommerceEvent } from "./events";

/**
 * De onde vem a lista do termômetro, em ordem de prioridade:
 *  1. buscas feitas no próprio Dopamina nos últimos 7 dias (cada termo precisa de
 *     pelo menos 2 visitantes diferentes, para ninguém conseguir manipular a lista);
 *  2. ideias de presente da data comercial em campanha (Natal, Dia das Mães...), se houver;
 *  3. os produtos mais populares do Buscapé agora;
 *  4. uma reserva fixa, usada só se as fontes acima falharem.
 * Máximo de 2 produtos por categoria, para a lista não virar seis versões de PS5.
 * Os 8 mais fortes ficam fixos; as últimas vagas revezam a cada 3 horas.
 */

export type TrendingSource = "dopamina" | "evento" | "buscape" | "reserva";
export type TrendingEntry = { path: string; group: string; source: TrendingSource };

const TOTAL = 12;
const FROM_OWN_SEARCHES = 4;
const FROM_EVENT = 6; // ideias de presente da data em campanha
const PER_CATEGORY = 2;
const MIN_PRICE = 80; // abaixo disso a data comercial quase não muda a decisão
const FIXED_TOP = 8; // vagas fixas para os mais populares; o restante reveza
const ROTATION_MS = 3 * 3600_000;

export const RESERVE: TrendingEntry[] = [
  { group: "Celulares", path: "celular/smartphone-apple-iphone-16-128gb-camera-dupla", source: "reserva" },
  { group: "Games", path: "console-de-video-game/console-playstation-5-slim-1tb-sony-4k-hdr", source: "reserva" },
  { group: "Áudio", path: "fone-de-ouvido-e-headset/fone-de-ouvido-bluetooth-com-microfone-apple-airpods-pro-3-geracao", source: "reserva" },
  { group: "Áudio", path: "caixa-de-som-bluetooth/caixa-de-som-bluetooth-jbl-flip-6", source: "reserva" },
  { group: "Casa", path: "fritadeira/fritadeira-eletrica-sem-oleo-mondial-afn-40-fb-capacidade-4l", source: "reserva" },
  { group: "Leitura", path: "leitor-de-livro-digital/e-reader-kindle-16-gb-6-11-geracao-kindle", source: "reserva" },
  { group: "Relógios", path: "smartwatch/smartwatch-apple-watch-se-3-44-0-mm-gps", source: "reserva" },
  { group: "Games", path: "console-de-video-game/console-portatil-switch-com-joy-con-nintendo-64gb", source: "reserva" },
  { group: "Informática", path: "notebook/notebook-lenovo-ideapad-1-82x5s00500-amd-ryzen-5-7520u-15-6-8gb-ssd-512-gb-linux", source: "reserva" },
  { group: "Celulares", path: "celular/celular-samsung-galaxy-s24-fe-5g-128gb-8-gb", source: "reserva" },
];

/** Nome curto de categoria para o card ("Celular e Smartphone" -> "Celulares"). */
function groupName(category: string | null, path: string): string {
  const c = foldText(category ?? path.split("/")[0]);
  if (/celular|smartphone/.test(c)) return "Celulares";
  if (/console|video.?game|controle|joystick/.test(c)) return "Games";
  if (/\btv\b|televis/.test(c)) return "TV";
  if (/fone|headset|caixa.de.som|soundbar|audio/.test(c)) return "Áudio";
  if (/notebook|computador|monitor|tablet/.test(c)) return "Informática";
  if (/smartwatch|relogio/.test(c)) return "Relógios";
  if (/ar.condicionado|ventilador/.test(c)) return "Climatização";
  if (/geladeira|lava|fogao|forno|micro.?ondas|secadora|freezer/.test(c)) return "Eletrodomésticos";
  if (/aspirador|fritadeira|cafeteira|liquidificador|mixer|panela|airfryer/.test(c)) return "Casa";
  if (/livro|kindle|e.?reader/.test(c)) return "Leitura";
  return category ? category.split(/\s+e\s+|,/)[0].trim() : "Outros";
}

/** Termos mais buscados no Dopamina (por visitantes distintos), mais recentes primeiro em caso de empate. */
async function ownTopQueries(days = 7, limit = 8): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from("intent_events")
    .select("session_id, metadata, created_at")
    .eq("event_type", "super_search")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error || !data) return [];

  const visitors = new Map<string, { label: string; sessions: Set<string> }>();
  for (const row of data) {
    const raw = typeof row.metadata?.query === "string" ? row.metadata.query : "";
    if (!raw || /^https?:\/\//i.test(raw) || raw.startsWith("[")) continue;
    const label = normalizeQuery(raw);
    const key = foldText(label);
    if (key.length < 3 || isBlockedSearch(label)) continue;
    const entry = visitors.get(key) ?? { label, sessions: new Set<string>() };
    entry.sessions.add(String(row.session_id ?? row.metadata?.raw_session_id ?? ""));
    visitors.set(key, entry);
  }
  return [...visitors.values()]
    .filter(v => v.sessions.size >= 2)
    .sort((a, b) => b.sessions.size - a.sessions.size)
    .slice(0, limit)
    .map(v => v.label);
}

/** Cada termo vira o 1º produto (não acessório, acima do preço mínimo) encontrado. */
async function resolveQueries(queries: string[], source: TrendingSource): Promise<TrendingEntry[]> {
  const resolved = await mapLimit(queries, 2, async (query): Promise<TrendingEntry | null> => {
    const hits = await searchProducts(query.toLowerCase()).catch(() => []);
    const hit = hits.find(h => h.path && h.price >= MIN_PRICE && (ACCESSORY.test(foldText(query)) || !ACCESSORY.test(foldText(h.name))));
    return hit?.path ? { path: hit.path, group: groupName(hit.category, hit.path), source } : null;
  });
  return resolved.filter((e): e is TrendingEntry => e !== null);
}

export async function trendingEntries(event: CommerceEvent | null = null, now = new Date()): Promise<TrendingEntry[]> {
  // 1. O que os nossos visitantes procuram.
  const own = (await resolveQueries(await ownTopQueries().catch(() => []), "dopamina")).slice(0, FROM_OWN_SEARCHES);
  // 2. Ideias de presente da data em campanha. Ficam à frente dos populares,
  //    mas sem tirar vaga das buscas reais dos visitantes.
  const gifts = event?.giftQueries.length ? (await resolveQueries(event.giftQueries, "evento")).slice(0, FROM_EVENT) : [];

  // 3. O que o mercado procura agora.
  const popular: TrendingEntry[] = (await getPopularProducts().catch(() => []))
    .filter(p => (p.price === null || p.price >= MIN_PRICE) && !ACCESSORY.test(foldText(p.name)))
    .map(p => ({ path: p.path, group: groupName(p.category, p.path), source: "buscape" as const }));

  const chosen = pickRotating<TrendingEntry>([...own, ...gifts], popular, { total: TOTAL, fixedTop: FIXED_TOP, perGroup: PER_CATEGORY, window: Math.floor(now.getTime() / ROTATION_MS) });

  // 4. Reserva, só para completar.
  return chosen.length >= TOTAL ? chosen : pickRotating<TrendingEntry>(chosen, RESERVE, { total: TOTAL, fixedTop: TOTAL, perGroup: PER_CATEGORY, window: 0 });
}
