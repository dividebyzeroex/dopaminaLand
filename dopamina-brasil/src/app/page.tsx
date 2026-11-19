import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import ProductVisual from "@/components/ProductVisual";
import Thermometer, { ThermometerSkeleton } from "@/components/price/Thermometer";

export const revalidate = 10800;

export default function HomePage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <Link href="/black-friday" className={styles.ribbon} style={{ textDecoration: "none" }}>
        <span><span className={styles.ribbonDot} aria-hidden="true" /><strong>Black Friday 27/11.</strong> Antes de comprar, veja se o desconto é real.</span>
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>Abrir termômetro <ArrowUpRight size={14} /></span>
      </Link>

      <section className={studio.hero}>
        <div className={studio.reveal}>
          <span className={studio.eyebrow}>Histórico de preços · Veredito honesto</span>
          <h1 className={studio.title}>O desconto é real?<br /><em>A gente checa<br />o histórico.</em></h1>
          <p className={studio.intro}>Digite o produto ou cole o link da oferta. Mostramos quanto ele costuma custar, o menor preço do período e onde está mais barato agora.</p>
          <SearchBox suggestions={["iPhone 15", "PlayStation 5 Slim", "Smart TV 55 4K"]} />
        </div>
        <div className={`${studio.heroArt} ${studio.reveal}`} style={{ animationDelay: ".12s" }}>
          <div className={studio.artTop}><span>Exemplo de veredito</span><span>Black Friday 2026</span></div>
          <div className={studio.artCircle} aria-hidden="true" />
          <ProductVisual priority src="/produtos/macbook-pro-14-m4-pro-12cpu-16gpu-48gb-r-2.png" name="MacBook Pro visto de frente" />
          <div className={studio.artBottom}>
            <div><h2>Desconto maquiado?</h2><p>Detectamos quando o preço sobe antes de “cair”.</p></div>
            <Link className={studio.roundButton} href="/black-friday#como-julgamos" aria-label="Como julgamos os preços"><ArrowUpRight size={21} strokeWidth={1.25} /></Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className={studio.strip} aria-label="Como funciona">
        {[
          { n: "01", title: "Busque o modelo exato", text: "Separamos as versões: PS5 Slim não é comparado com PS5 Pro." },
          { n: "02", title: "Veja o histórico real", text: "Gráfico diário do menor preço entre as lojas, com o preço típico e o mínimo." },
          { n: "03", title: "Decida com um veredito", text: "Desconto real, preço comum, acima do normal ou desconto maquiado." },
        ].map(item => <article key={item.n}><span>{item.n}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
      </section>

      <div className={studio.sectionHead}><div><span className={studio.eyebrow}>Termômetro da Black Friday</span><h2>Os mais buscados,<br />com veredito.</h2></div><p>Atualizado a cada 3 horas. <Link href="/black-friday" style={{ color: "inherit" }}>Ver todos os produtos e a metodologia →</Link></p></div>
      <Suspense fallback={<ThermometerSkeleton count={4} />}><Thermometer limit={4} /></Suspense>

      <section className={studio.feature}>
        <div>
          <span className={studio.eyebrow}>Sem letra miúda</span>
          <h2>Regras abertas.<br />Nenhum veredito pago.</h2>
          <p>Comparamos o preço de hoje com o que o próprio produto custou nos dias anteriores. Sem previsões mágicas: se o histórico for curto, dizemos que não dá para afirmar.</p>
          <Link className={studio.textLink} href="/black-friday#como-julgamos">Ver como julgamos <ArrowUpRight size={16} /></Link>
        </div>
        <div className={studio.diagram} aria-hidden="true"><div className={studio.diagramInner}><strong>dopamina.</strong><i /><i /><i /><span>HISTÓRICO DE PREÇOS</span></div></div>
      </section>
      <SiteFooter />
    </div>
  </main>;
}
