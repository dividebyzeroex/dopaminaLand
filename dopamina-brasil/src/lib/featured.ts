import { unstable_cache } from "next/cache";
import { analyzeProduct, mapLimit } from "./analysis";
import type { SearchHit } from "./buscape";
import type { Verdict } from "./price-verdict";
import { displaySeries } from "./series";

/**
 * Produtos mais procurados na Black Friday, fixados pelo endereço do produto.
 * Endereço fixo evita resultados errados (acessórios no lugar do produto) e
 * economiza uma requisição por item. Revisar a lista a cada campanha.
 */
export const FEATURED = [
  { group: "Celulares", path: "celular/smartphone-apple-iphone-15-128gb-camera-dupla" },
  { group: "Celulares", path: "celular/smartphone-apple-iphone-16-128gb-camera-dupla" },
  { group: "Celulares", path: "celular/celular-samsung-galaxy-s24-fe-5g-128gb-8-gb" },
  { group: "Games", path: "console-de-video-game/console-playstation-5-slim-1tb-sony-4k-hdr" },
  { group: "Games", path: "console-de-video-game/console-portatil-switch-com-joy-con-nintendo-64gb" },
  { group: "Áudio", path: "fone-de-ouvido-e-headset/fone-de-ouvido-bluetooth-com-microfone-apple-airpods-pro-3-geracao" },
  { group: "Áudio", path: "caixa-de-som-bluetooth/caixa-de-som-bluetooth-jbl-flip-6" },
  { group: "Relógios", path: "smartwatch/smartwatch-apple-watch-se-3-44-0-mm-gps" },
  { group: "Casa", path: "fritadeira/fritadeira-eletrica-sem-oleo-mondial-afn-40-fb-capacidade-4l" },
  { group: "Leitura", path: "leitor-de-livro-digital/e-reader-kindle-16-gb-6-11-geracao-kindle" },
  { group: "Informática", path: "notebook/notebook-lenovo-ideapad-1-82x5s00500-amd-ryzen-5-7520u-15-6-8gb-ssd-512-gb-linux" },
  { group: "Games", path: "console-de-video-game/console-switch-2-com-joy-con-nintendo" },
];

export type ThermometerItem = { group: string; hit: SearchHit; verdict: Verdict; storeCount: number | null; image?: string; name: string; series: number[]; history: { date: string; price: number }[] };

const ORDER: Record<Verdict["kind"], number> = { menor: 0, abaixo: 1, maquiado: 2, acima: 3, comum: 4, insuficiente: 5 };

export const getThermometer = unstable_cache(async (): Promise<ThermometerItem[]> => {
  const results = await mapLimit(FEATURED, 2, async (item): Promise<ThermometerItem | null> => {
    const analysis = await analyzeProduct(item.path).catch(() => null);
    if (!analysis) return null;
    const { product, verdict, history } = analysis;
    const shown = displaySeries(history, product.bestPrice, product.checkedAt.slice(0, 10));
    return {
      group: item.group,
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
}, ["bf-thermometer-v3"], { revalidate: 10800 });

const MAQUIADO_FIRST: Record<Verdict["kind"], number> = { maquiado: 0, menor: 1, abaixo: 2, acima: 3, comum: 4, insuficiente: 5 };

/** Home: descontos maquiados primeiro (do maior aumento antes da "queda" para o menor), depois os demais. */
export function sortMaquiadoFirst(items: ThermometerItem[]): ThermometerItem[] {
  const inflation = (i: ThermometerItem) => (i.verdict.recentPeak && i.verdict.baseline ? i.verdict.recentPeak / i.verdict.baseline : 0);
  return [...items].sort((a, b) =>
    MAQUIADO_FIRST[a.verdict.kind] - MAQUIADO_FIRST[b.verdict.kind]
    || inflation(b) - inflation(a)
    || (a.verdict.vsMedian ?? 0) - (b.verdict.vsMedian ?? 0));
}
