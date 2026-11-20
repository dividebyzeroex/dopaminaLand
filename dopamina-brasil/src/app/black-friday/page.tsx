import type { Metadata } from "next";
import { Suspense } from "react";
import studio from "@/components/studio.module.css";
import styles from "@/components/bf.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import VerdictBadge from "@/components/price/VerdictBadge";
import Thermometer, { ThermometerSkeleton } from "@/components/price/Thermometer";
import { MIN_DAYS, VERDICT_RULES } from "@/lib/price-verdict";

export const revalidate = 10800;

export const metadata: Metadata = {
  title: "Black Friday 2026: termômetro de descontos reais e maquiados",
  description: "Veredito honesto para os produtos mais procurados da Black Friday: veja quais estão realmente abaixo do preço normal e quais subiram antes de “cair”.",
  alternates: { canonical: "/black-friday" },
};

const toneOf = (kind: string) => (kind === "menor" || kind === "abaixo" ? "good" : kind === "maquiado" ? "bad" : kind === "acima" ? "warn" : "neutral") as "good" | "bad" | "warn" | "neutral";

export default function BlackFridayPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <section style={{ padding: "56px 0 20px", maxWidth: 720 }}>
        <span className={studio.eyebrow}>Black Friday 2026 · 27 de novembro</span>
        <h1 className={studio.title} style={{ fontSize: "clamp(44px, 6vw, 80px)" }}>Desconto de verdade<br /><em>ou maquiagem?</em></h1>
        <p className={studio.intro} style={{ maxWidth: 520 }}>Comparamos o preço de hoje com o histórico de cada produto. Se ele subiu antes para depois “cair”, a gente avisa.</p>
        <SearchBox id="bf-search" suggestions={["PlayStation 5 Slim", "iPhone 15", "Air Fryer"]} />
      </section>

      <div className={studio.sectionHead}><div><span className={studio.eyebrow}>Termômetro · o que está sendo procurado agora</span><h2>Os mais procurados,<br />com veredito.</h2></div><p>A lista acompanha o que as pessoas procuram e muda a cada 3 horas. Primeiro os descontos reais, depois os maquiados e os que estão acima do normal.</p></div>
      <Suspense fallback={<ThermometerSkeleton count={8} />}><Thermometer /></Suspense>

      <div className={studio.sectionHead} id="como-julgamos"><div><span className={studio.eyebrow}>Metodologia aberta</span><h2>Como julgamos<br />cada preço.</h2></div><p>Regras simples, aplicadas igual para todos os produtos. Não recebemos nada para mudar um veredito.</p></div>
      <section className={styles.rules}>
        {VERDICT_RULES.map(rule => <article key={rule.kind} className={styles.rule}><VerdictBadge tone={toneOf(rule.kind)} label={rule.label} small /><p>{rule.rule}</p></article>)}
      </section>
      <section className={studio.strip} aria-label="Detalhes do cálculo" style={{ marginBottom: 60 }}>
        <article><span>01</span><div><h3>Menor preço do dia</h3><p>Usamos o menor preço entre todas as lojas que vendem o mesmo modelo, dia a dia.</p></div></article>
        <article><span>02</span><div><h3>Preço típico = mediana</h3><p>A mediana ignora picos isolados. É o valor que o produto “costuma” custar no período.</p></div></article>
        <article><span>03</span><div><h3>Mínimo de {MIN_DAYS} dias</h3><p>Com menos histórico do que isso, dizemos que não dá para afirmar. Frete, cupom e cashback ficam de fora.</p></div></article>
      </section>
      <SiteFooter />
    </div>
  </main>;
}
