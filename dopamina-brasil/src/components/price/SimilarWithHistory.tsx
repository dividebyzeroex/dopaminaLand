import { analyzeHit, createLimiter } from "@/lib/analysis";
import { searchProducts } from "@/lib/buscape";
import { extractSpecs } from "@/lib/search-view";
import { displaySeries } from "@/lib/series";
import ProductCard from "./ProductCard";
import styles from "../bf.module.css";

/** Termo para achar modelos parecidos: as primeiras palavras do nome (marca e linha). */
export function similarQuery(name: string): string {
  return name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).slice(0, 4).join(" ");
}

/**
 * Produto sem histórico suficiente: em vez de deixar a pessoa sem resposta, mostra
 * até 3 modelos parecidos que já têm veredito.
 */
export default async function SimilarWithHistory({ path, name }: { path: string; name: string }) {
  const hits = await searchProducts(similarQuery(name).toLowerCase()).catch(() => []);
  const candidates = hits.filter(hit => hit.path && hit.path !== path).slice(0, 6);
  const run = createLimiter(2);
  const analyzed = await Promise.all(candidates.map(hit => run(() => analyzeHit(hit)).catch(() => null)));
  const withVerdict = analyzed.filter(r => r?.verdict && r.verdict.kind !== "insuficiente" && r.product).slice(0, 3);
  if (!withVerdict.length) return null;
  return <section className={styles.similar} aria-labelledby="similares-title">
    <h2 id="similares-title">Modelos parecidos com veredito</h2>
    <div className={styles.list}>
      {withVerdict.map(r => {
        const { hit, product, verdict } = r!;
        return <ProductCard key={hit.sourceUrl} hit={hit} verdict={verdict} layout="row" name={product!.name} image={product!.image} price={product!.bestPrice} storeCount={product!.storeCount}
          specs={extractSpecs(product!.name)} series={displaySeries(product!.history, product!.bestPrice, product!.checkedAt.slice(0, 10)).slice(-40).map(p => p.price)} />;
      })}
    </div>
  </section>;
}
