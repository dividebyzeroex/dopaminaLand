import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download } from "lucide-react";
import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import VerdictBadge from "@/components/price/VerdictBadge";
import PriceHistoryChart from "@/components/price/PriceHistoryChart";
import ProductVisual from "@/components/ProductVisual";
import { analyzeProduct } from "@/lib/analysis";
import { isSafeProductPath } from "@/lib/buscape";
import { VERDICT_RULES } from "@/lib/price-verdict";
import { brl, dateTime, shortDate, signedPct } from "@/lib/format";

type Props = { params: Promise<{ slug: string[] }> };

export const revalidate = 10800;

// Nenhuma página pré-gerada no build: cada produto é gerado no 1º acesso e fica em cache (ISR).
export async function generateStaticParams() {
  return [];
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const path = slug.map(part => decodeURIComponent(part).toLowerCase()).join("/");
  if (!isSafeProductPath(path)) return null;
  return analyzeProduct(path);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return { title: "Produto não encontrado", robots: { index: false } };
  const { product, verdict } = data;
  const price = product.bestPrice ? ` por ${brl(product.bestPrice)}` : "";
  const title = `${product.name}: histórico de preço e se vale comprar`;
  const description = `${product.name}${price} hoje. ${verdict.label}: ${verdict.headline} Veja o gráfico de ${verdict.days} dias e compare ${product.storeCount ?? "as"} lojas.`;
  return {
    title,
    description,
    alternates: { canonical: `/produto/${product.path}` },
    openGraph: { title, description, images: product.image ? [product.image] : undefined, type: "website", locale: "pt_BR" },
  };
}

export default async function ProductPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { product, history, verdict } = data;
  const today = product.checkedAt.slice(0, 10);
  const vsMin = verdict.min && verdict.current ? (verdict.current - verdict.min) / verdict.min : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : undefined,
    description: product.description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: product.bestPrice ? {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: product.bestPrice,
      highPrice: product.offers.at(-1)?.price ?? product.bestPrice,
      offerCount: product.offerCount ?? product.offers.length,
    } : undefined,
  };

  return <main className={studio.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className={studio.wrap}>
      <SiteHeader />
      <nav className={styles.crumbs} aria-label="Navegação"><Link href="/">Início</Link><span>/</span>{product.category && <><span>{product.category}</span><span>/</span></>}<span aria-current="page">{product.name}</span></nav>

      <section className={styles.productHero}>
        <div className={styles.productVisualBox}><ProductVisual src={product.image} name={product.name} priority /></div>
        <div>
          <span className={studio.eyebrow}>{product.brand || product.category || "Produto"}</span>
          <h1 className={styles.productTitle}>{product.name}</h1>
          <div className={styles.priceRow}>
            <strong>{product.bestPrice ? brl(product.bestPrice) : "—"}</strong>
            <VerdictBadge tone={verdict.tone} label={verdict.label} />
          </div>
          <p className={studio.caption}>
            Menor preço agora{product.bestStore ? ` na ${product.bestStore}` : ""}
            {product.storeCount ? ` · ${product.storeCount} ${product.storeCount === 1 ? "loja" : "lojas"}, ${product.offerCount ?? product.offers.length} ofertas` : ""}
          </p>
          <div className={`${styles.verdict} ${styles[verdict.tone]}`} style={{ marginTop: 22 }}>
            <span className={styles.verdictMeta}>Veredito Black Friday</span>
            <p className={styles.verdictHeadline}>{verdict.headline}</p>
            <p className={styles.verdictDetail}>{verdict.detail}</p>
            <p className={styles.verdictMeta}>Consulta: {dateTime(product.checkedAt)} · <Link href="/black-friday#como-julgamos" style={{ color: "inherit" }}>como julgamos</Link></p>
          </div>
        </div>
      </section>

      {verdict.median && <section className={styles.stats} aria-label="Resumo do histórico">
        <div className={styles.stat}><span>Hoje</span><strong>{brl(verdict.current)}</strong><small>menor preço entre as lojas</small></div>
        <div className={styles.stat}><span>Preço típico</span><strong>{brl(verdict.median)}</strong><small className={verdict.vsMedian! < 0 ? styles.down : verdict.vsMedian! > 0 ? styles.up : ""}>{signedPct(verdict.vsMedian!)} hoje vs. típico</small></div>
        <div className={styles.stat}><span>Mínimo</span><strong>{brl(verdict.min!)}</strong><small>{vsMin !== null && vsMin > 0.001 ? `hoje está ${signedPct(vsMin)} acima` : "hoje empata com o mínimo"}</small></div>
        <div className={styles.stat}><span>Máximo</span><strong>{brl(verdict.max!)}</strong><small>{verdict.days} dias desde {verdict.since ? shortDate(verdict.since) : "—"}</small></div>
      </section>}

      <div className={styles.two}>
        <section className={styles.chartPanel} aria-label="Histórico de preço">
          <div className={styles.chartHead}><h3>Histórico de preço</h3><span>{history.length} dias · eixo ajustado à variação</span></div>
          <PriceHistoryChart points={history} current={product.bestPrice} median={verdict.median} min={verdict.min} today={today} />
        </section>
        <section aria-label="Ofertas por loja">
          <div className={styles.storeList}>
            <div className={styles.chartHead} style={{ padding: "18px 0 6px" }}><h3>Onde comprar</h3><span>ordenado por preço</span></div>
            {product.offers.length === 0 && <p className={studio.note}>A fonte não listou ofertas individuais agora.</p>}
            {product.offers.map(offer => <div key={offer.id} className={styles.storeRow}>
              <div className={styles.storeName}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {offer.logo ? <img src={offer.logo} alt="" loading="lazy" /> : null}
                <div>{offer.store}<small>{offer.marketplace ? "Marketplace (vendedor parceiro)" : "Loja oficial / venda direta"}</small></div>
              </div>
              <div className={styles.storePrice}>{brl(offer.price)}{offer.installments && offer.installmentValue ? <small>ou {offer.installments}x {brl(offer.installmentValue)}</small> : null}</div>
              <a className={styles.storeLink} href={offer.url} target="_blank" rel="noopener noreferrer nofollow">Ir à loja <ArrowUpRight size={13} /></a>
            </div>)}
            <p className={studio.note} style={{ marginTop: 6, marginBottom: 14 }}>
              {product.offerCount && product.offerCount > product.offers.length ? <>Mostrando {product.offers.length} de {product.offerCount} ofertas. <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Ver todas na fonte</a>. </> : null}
              Links levam à loja via Buscapé. Confira frete, vendedor e condições antes de pagar.
            </p>
          </div>
        </section>
      </div>

      <div className={studio.sectionHead}><div><span className={studio.eyebrow} id="regras">Transparência</span><h2>Como chegamos<br />neste veredito.</h2></div><p>Sem “inteligência” mágica: comparamos o preço de hoje com o que este mesmo produto custou nos dias anteriores.</p></div>
      <section className={styles.rules}>
        {VERDICT_RULES.filter(rule => rule.kind !== "insuficiente").map(rule => {
          const tone = rule.kind === "menor" || rule.kind === "abaixo" ? "good" : rule.kind === "maquiado" ? "bad" : rule.kind === "acima" ? "warn" : "neutral";
          return <article key={rule.kind} className={styles.rule} style={rule.kind === verdict.kind ? { outline: "2px solid #20211f" } : undefined}><VerdictBadge tone={tone} label={rule.label} small /><p>{rule.rule}</p></article>;
        })}
        <article className={styles.rule}><span className={studio.eyebrow}>Fonte</span><p>Série diária do menor preço entre as lojas, publicada pelo Buscapé, somada ao histórico que gravamos a cada consulta. Frete, cupons e cashback não entram no cálculo.</p></article>
      </section>

      <section className={studio.feature}>
        <div>
          <span className={studio.eyebrow}>Outra ideia em mente?</span>
          <h2>Pesquise outro<br />produto.</h2>
          <div style={{ maxWidth: 440 }} className={styles.darkSearch}><SearchBox id="product-page-search" /></div>
          <Link href={`/relatorio?q=${encodeURIComponent(product.name)}`} className={studio.textLink}><Download size={15} /> Baixar relatório em PDF <ArrowUpRight size={15} /></Link>
        </div>
        <div className={studio.diagram} aria-hidden="true"><div className={studio.diagramInner}><strong>dopamina.</strong><i /><i /><i /><span>RELATÓRIO DE PREÇOS</span></div></div>
      </section>
      <SiteFooter />
    </div>
  </main>;
}
