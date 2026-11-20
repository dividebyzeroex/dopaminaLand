import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import ProductCard from "@/components/price/ProductCard";
import { analyzeSearch } from "@/lib/analysis";
import { ACCESSORY, foldText, normalizeQuery, queryFromUrl } from "@/lib/buscape";
import { redirect } from "next/navigation";
import { blockedMessage, checkSearch } from "@/lib/search-policy";
import { displaySeries } from "@/lib/series";

type Props = { searchParams: Promise<{ q?: string | string[]; bloqueada?: string }> };

const REASONS = ["ofensivo", "odio", "sexual", "ilegal", "violencia", "autolesao"] as const;

async function readQuery(searchParams: Props["searchParams"]) {
  const raw = (await searchParams).q;
  const value = normalizeQuery(Array.isArray(raw) ? raw[0] ?? "" : raw ?? "");
  return /^https?:\/\//i.test(value) ? queryFromUrl(value) ?? "" : value;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await readQuery(searchParams);
  const blocked = Boolean((await searchParams).bloqueada) || (query ? checkSearch(query).blocked : false);
  return {
    title: blocked ? "Busca não permitida" : query ? `Preço de ${query}: histórico e veredito` : "Buscar produto",
    // Páginas de busca não devem ser indexadas; as de produto sim.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await readQuery(searchParams);
  const policy = query ? checkSearch(query) : ({ blocked: false } as const);
  // O termo bloqueado sai da URL (histórico, links compartilhados, analytics).
  if (policy.blocked) redirect(`/busca?bloqueada=${policy.reason}`);
  const flagged = (await searchParams).bloqueada;
  const reason = REASONS.find(r => r === flagged);
  const blocked = Boolean(reason);
  let results: Awaited<ReturnType<typeof analyzeSearch>> = [];
  let failed = false;
  if (query.length >= 2 && !blocked) {
    try { results = await analyzeSearch(query); } catch { failed = true; }
  }

  const analyzed = results.filter(r => r.verdict);
  const onlyAccessories = results.length > 0 && !ACCESSORY.test(foldText(query)) && results.every(r => ACCESSORY.test(foldText(r.hit.name)));
  const real = analyzed.filter(r => r.verdict!.kind === "menor" || r.verdict!.kind === "abaixo").length;
  const fake = analyzed.filter(r => r.verdict!.kind === "maquiado").length;

  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section style={{ padding: "44px 0 10px", maxWidth: 640 }}>
        <span className={studio.eyebrow}>Sua busca</span>
        <h1 className={studio.resultTitle}>{blocked ? "Busca não permitida" : query || "O que você quer comprar?"}</h1>
        <SearchBox key={blocked ? "bloqueada" : query} defaultValue={blocked ? "" : query} id="search-again" />
      </section>

      {reason && <div className={styles.empty} role="alert"><h2>Não podemos mostrar resultados para essa busca.</h2><p>{blockedMessage(reason)}</p></div>}
      {failed && <div className={styles.empty}><span className={studio.eyebrow}>Fonte indisponível</span><h2>Não conseguimos consultar os preços agora.</h2><p>A fonte de preços não respondeu. Tente novamente em alguns instantes.</p></div>}
      {!failed && !blocked && query && results.length === 0 && <div className={styles.empty}><span className={studio.eyebrow}>Nada encontrado</span><h2>Nenhum preço verificável para “{query}”.</h2><p>Tente um nome mais curto ou o modelo do produto (ex.: “Galaxy S24 128GB”).</p></div>}

      {onlyAccessories && <p className={styles.ribbon} role="note">A fonte só trouxe acessórios para “{query}”. Tente o nome completo do modelo, como “Samsung Galaxy S24 FE 128GB”.</p>}
      {results.length > 0 && <>
        <div className={studio.sectionHead}>
          <div><span className={studio.eyebrow}>{results.length} produtos · ordem de relevância da fonte</span><h2>Escolha o modelo exato.</h2></div>
          <p>{analyzed.length > 0
            ? `Analisamos o histórico dos ${analyzed.length} primeiros: ${real} com preço abaixo do normal${fake ? `, ${fake} com desconto maquiado` : ""}. Abra um produto para ver o gráfico e as lojas.`
            : "Abra um produto para ver o histórico de preço e as ofertas por loja."}</p>
        </div>
        <section className={styles.grid} aria-label="Resultados" style={{ marginBottom: 56 }}>
          {results.map(({ hit, product, verdict }) => <ProductCard key={hit.sourceUrl} hit={hit} verdict={verdict} name={product?.name} image={product?.image} price={product?.bestPrice} storeCount={product?.storeCount}
            series={product ? displaySeries(product.history, product.bestPrice, product.checkedAt.slice(0, 10)).slice(-40).map(p => p.price) : undefined} />)}
        </section>
      </>}
      <SiteFooter />
    </div>
  </main>;
}
