import { unstable_cache } from "next/cache";
import { analyzeProduct, mapLimit } from "./analysis";
import type { SearchHit } from "./buscape";
import type { Verdict } from "./price-verdict";
import { displaySeries } from "./series";
import { trendingEntries, type TrendingSource } from "./trending";
import { EVENTS, type EventId } from "./events";

export type ThermometerItem = { group: string; source: TrendingSource; checkedAt: string; hit: SearchHit; verdict: Verdict; storeCount: number | null; image?: string; name: string; series: number[]; history: { date: string; price: number }[] };

const ORDER: Record<Verdict["kind"], number> = { menor: 0, abaixo: 1, maquiado: 2, acima: 3, comum: 4, insuficiente: 5 };

/**
 * Termômetro do momento. `eventId` personaliza a lista para a data comercial em
 * campanha (o id entra na chave do cache: cada evento tem a sua lista).
 */
export const getThermometer = unstable_cache(async (eventId: EventId | null = null): Promise<ThermometerItem[]> => {
  // A lista muda com o interesse real (buscas no Dopamina, ideias da data e mais populares do Buscapé).
  const entries = await trendingEntries(EVENTS.find(e => e.id === eventId) ?? null);
  const results = await mapLimit(entries, 2, async (item): Promise<ThermometerItem | null> => {
    const analysis = await analyzeProduct(item.path).catch(() => null);
    if (!analysis) return null;
    const { product, verdict, history } = analysis;
    const shown = displaySeries(history, product.bestPrice, product.checkedAt.slice(0, 10));
    return {
      group: item.group,
      source: item.source,
      checkedAt: product.checkedAt,
      series: shown.slice(-40).map(p => p.price),
      history: shown,
      verdict,
      storeCount: product.storeCount,
      image: product.image,
      name: product.name,
      hit: {
        path: product.path, name: product.name, price: product.bestPrice ?? verdict.current, image: product.image,
        storeCount: product.storeCount, rating: product.rating, reviews: null, category: product.category,
        store: null, cashback: null, sourceUrl: product.sourceUrl,
      },
    };
  });
  return results
    .filter((x): x is ThermometerItem => x !== null)
    .sort((a, b) => ORDER[a.verdict.kind] - ORDER[b.verdict.kind] || (a.verdict.vsMedian ?? 0) - (b.verdict.vsMedian ?? 0));
}, ["thermometer-v5"], { revalidate: 10800 });

const MAQUIADO_FIRST: Record<Verdict["kind"], number> = { maquiado: 0, menor: 1, abaixo: 2, acima: 3, comum: 4, insuficiente: 5 };

/** Home: descontos maquiados primeiro (do maior aumento antes da "queda" para o menor), depois os demais. */
export function sortMaquiadoFirst(items: ThermometerItem[]): ThermometerItem[] {
  const inflation = (i: ThermometerItem) => (i.verdict.recentPeak && i.verdict.baseline ? i.verdict.recentPeak / i.verdict.baseline : 0);
  return [...items].sort((a, b) =>
    MAQUIADO_FIRST[a.verdict.kind] - MAQUIADO_FIRST[b.verdict.kind]
    || inflation(b) - inflation(a)
    || (a.verdict.vsMedian ?? 0) - (b.verdict.vsMedian ?? 0));
}

/** Texto honesto sobre a composição da lista atual. */
export function thermometerSourceNote(items: ThermometerItem[]): string {
  const own = items.filter(i => i.source === "dopamina").length;
  const market = items.filter(i => i.source === "buscape").length;
  const latest = items.reduce((max, i) => (i.checkedAt > max ? i.checkedAt : max), "");
  const time = latest ? new Date(latest).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }) : null;
  const gifts = items.filter(i => i.source === "evento").length;
  const parts = [
    own ? `${own} ${own === 1 ? "mais buscado" : "mais buscados"} no Dopamina` : null,
    gifts ? `${gifts} ${gifts === 1 ? "ideia" : "ideias"} de presente da data` : null,
    market ? `${market} ${market === 1 ? "mais popular" : "mais populares"} do mercado agora (Buscapé)` : null,
  ].filter(Boolean);
  const origin = parts.length ? `Lista de agora: ${parts.length > 1 ? `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}` : parts[0]}.` : "Lista de reserva enquanto as fontes de tendência não respondem.";
  return `${origin}${time ? ` Atualizada às ${time}; renova a cada 3 horas.` : ""}`;
}
