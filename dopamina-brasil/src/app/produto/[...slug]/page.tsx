import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import VerdictBadge from "@/components/price/VerdictBadge";
import PriceHistoryChart from "@/components/price/PriceHistoryChart";
import ShareVerdict from "@/components/price/ShareVerdict";
import TrackOnce from "@/components/price/TrackOnce";
import AlertButton from "@/components/pwa/AlertButton";
import InstallBanner from "@/components/pwa/InstallBanner";
import ProductVisual from "@/components/ProductVisual";
import { analyzeProduct } from "@/lib/analysis";
import { isSafeProductPath } from "@/lib/buscape";
import { VERDICT_RULES } from "@/lib/price-verdict";
import { brl, dateTime, shortDate, signedPct } from "@/lib/format";
import { activeEvent, EVERGREEN } from "@/lib/events";

type Props = { params: Promise<{ slug: string[] }> };

const SITE = "https://www.dopaminado.com.br";

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
    // Imagem de compartilhamento gerada em /og/produto/... (selo, preço e gráfico).
    openGraph: { title, description, type: "website", locale: "pt_BR", images: [{ url: `/og/produto/${product.path}`, width: 1200, height: 630, alt: `${verdict.label}: ${product.name}` }] },
    twitter: { card: "summary_large_image", title, description, images: [`/og/produto/${product.path}`] },
  };
}

export default async function ProductPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { product, history, verdict } = data;
  const today = product.checkedAt.slice(0, 10);
  const vsMin = verdict.min && verdict.current ? (verdict.current - verdict.min) / verdict.min : null;
  const price = product.bestPrice ? brl(product.bestPrice) : "";
  const shareText = verdict.kind === "maquiado"
    ? `Esse desconto é maquiado: ${product.name} por ${price} subiu antes de "cair". Veja o histórico:`
    : verdict.kind === "insuficiente"
      ? `${product.name} por ${price}. Veja o histórico de preço e as lojas:`
      : `${verdict.label}: ${product.name} por ${price}${verdict.vsMedian !== null ? ` (${signedPct(verdict.vsMedian)} vs. o preço típico)` : ""}. Veja o histórico:`;

  // Uma linha por loja (a mais barata); as demais ofertas da mesma loja viram contagem.
  const byStore = new Map<string, { offer: (typeof product.offers)[number]; more: number }>();
  for (const offer of product.offers) {
    const key = `${offer.store.trim().toLowerCase()}|${offer.marketplace}`;
    const seen = byStore.get(key);
    if (!seen) byStore.set(key, { offer, more: 0 });
    else { seen.more++; if (offer.price < seen.offer.price) seen.offer = offer; }
  }
  const stores = [...byStore.values()].sort((a, b) => a.offer.price - b.offer.price);
  const best = stores[0]?.offer;

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

  return <main className={`${studio.shell} ${styles.withBar}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className={studio.wrap}>
      <SiteHeader />
      <TrackOnce event="product_view" product={product.name} price={product.bestPrice} metadata={{
        product_path: product.path,
        brand: product.brand ?? null,
        category: product.category ?? null,
        best_store: product.bestStore ?? null,
        store_count: product.storeCount ?? null,
        verdict: verdict.kind,
        vs_median: verdict.vsMedian ?? null,
      }} />
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
            <span className={styles.verdictMeta}>{activeEvent()?.event.copy.verdictLabel ?? EVERGREEN.verdictLabel}</span>
            <p className={styles.verdictHeadline}>{verdict.headline}</p>
            <p className={styles.verdictDetail}>{verdict.detail}</p>
            <p className={styles.verdictMeta}>Consulta: {dateTime(product.checkedAt)} · <Link href="/metodologia" style={{ color: "inherit" }}>como julgamos</Link></p>
          </div>
          {/* No celular o alerta fica na barra fixa; aqui só no desktop. */}
          <div className={styles.desktopOnly} style={{ marginTop: 16 }}><AlertButton path={product.path} name={product.name} price={product.bestPrice} /></div>
          <ShareVerdict url={`${SITE}/produto/${product.path}`} productName={product.name} text={shareText} />
          <InstallBanner />
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
            {stores.map(({ offer, more }, index) => <div key={offer.id} className={styles.storeRow}>
              <div className={styles.storeName}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {offer.logo ? <img src={offer.logo} alt="" loading="lazy" /> : null}
                <div>{offer.store}<small>{offer.marketplace ? "Marketplace (vendedor parceiro)" : "Loja oficial / venda direta"}{more ? ` · +${more} ${more === 1 ? "oferta" : "ofertas"} nesta loja` : ""}</small></div>
              </div>
              <div className={styles.storePrice}>{brl(offer.price)}{offer.installments && offer.installmentValue ? <small>ou {offer.installments}x {brl(offer.installmentValue)}</small> : null}</div>
              <a className={styles.storeLink} href={offer.url} target="_blank" rel="noopener noreferrer nofollow" data-track="offer" data-store={offer.store} data-price={offer.price} data-product={product.name} data-product-path={product.path} data-position={index + 1}>Ir à loja <ArrowUpRight size={13} /></a>
            </div>)}
            <p className={studio.note} style={{ marginTop: 6, marginBottom: 14 }}>
              {product.offerCount && product.offerCount > product.offers.length ? <>Mostrando {product.offers.length} de {product.offerCount} ofertas. <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Ver todas na fonte</a>. </> : null}
              Links levam à loja via Buscapé. Confira frete, vendedor e condições antes de pagar.
            </p>
          </div>
        </section>
      </div>

      <details className={styles.why} id="regras">
        <summary><span>Por que “{verdict.label}”?</span><small>Ver as regras do veredito</small></summary>
        <p className={styles.whyIntro}>Sem “inteligência” mágica: comparamos o preço de hoje com o que este mesmo produto custou nos dias anteriores. <Link href="/metodologia">Metodologia completa</Link>.</p>
        <section className={styles.rules}>
          {VERDICT_RULES.filter(rule => rule.kind !== "insuficiente").map(rule => {
            const tone = rule.kind === "menor" || rule.kind === "abaixo" ? "good" : rule.kind === "maquiado" ? "bad" : rule.kind === "acima" ? "warn" : "neutral";
            return <article key={rule.kind} className={styles.rule} style={rule.kind === verdict.kind ? { outline: "2px solid #20211f" } : undefined}><VerdictBadge tone={tone} label={rule.label} small /><p>{rule.rule}</p></article>;
          })}
          <article className={styles.rule}><span className={studio.eyebrow}>Fonte</span><p>Série diária do menor preço entre as lojas, publicada pelo Buscapé, somada ao histórico que gravamos a cada consulta. Frete, cupons e cashback não entram no cálculo.</p></article>
        </section>
      </details>

      <section className={styles.again} aria-labelledby="again-title">
        <h2 id="again-title">Pesquise outro produto</h2>
        <div className={styles.darkSearch}><SearchBox id="product-page-search" /></div>
      </section>
      <SiteFooter />
    </div>
    {/* Celular: as duas ações que importam sempre ao alcance do polegar. */}
    <div className={styles.actionBar} role="region" aria-label="Ações do produto">
      <AlertButton path={product.path} name={product.name} price={product.bestPrice} compact />
      {best
        ? <a className={styles.actionStore} href={best.url} target="_blank" rel="noopener noreferrer nofollow" data-track="offer" data-store={best.store} data-price={best.price} data-product={product.name} data-product-path={product.path} data-position={1} data-placement="barra-fixa">Ir à loja · {brl(best.price)} <ArrowUpRight size={16} aria-hidden="true" /></a>
        : <a className={styles.actionStore} href={product.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">Ver ofertas <ArrowUpRight size={16} aria-hidden="true" /></a>}
    </div>
  </main>;
}
