import { Suspense } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import studio from "@/components/studio.module.css";
import styles from "@/components/home.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import SiteFooter from "@/components/price/SiteFooter";
import SearchBox from "@/components/price/SearchBox";
import VerdictBadge from "@/components/price/VerdictBadge";
import HeroExample, { pickExample } from "@/components/price/HeroExample";
import ThermometerGrid from "@/components/price/ThermometerGrid";
import { ThermometerSkeleton } from "@/components/price/Thermometer";
import { getThermometer, sortMaquiadoFirst, thermometerSourceNote } from "@/lib/featured";
import { blackFridayLabel } from "@/lib/black-friday";

export const revalidate = 10800;

async function Example() {
  const items = await getThermometer().catch(() => []);
  const item = items.length ? pickExample(items) : null;
  return item ? <HeroExample item={item} /> : null;
}

async function Thermometer() {
  const items = await getThermometer().catch(() => []);
  if (!items.length) return <p className={styles.footnote}>Não foi possível montar o termômetro agora. Pesquise um produto acima.</p>;
  return <>
    <ThermometerGrid items={sortMaquiadoFirst(items)} limit={8} />
    <p className={styles.footnote}>
      {thermometerSourceNote(items)} A linha mostra o menor preço do dia entre as lojas.{" "}
      <Link href="/black-friday" style={{ color: "inherit" }}>Ver todos os {items.length} produtos</Link>
    </p>
  </>;
}

export default function HomePage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Link href="/black-friday" className={styles.pill}><span className={styles.pillDot} aria-hidden="true" />{blackFridayLabel()}</Link>
          <h1 className={styles.title}>Desconto de verdade <span>ou maquiagem?</span></h1>
          <p className={styles.lead}>Cole o link ou digite o produto. Mostramos quanto ele costuma custar, se subiu antes de “cair” e onde está mais barato agora.</p>
          <div id="busca"><SearchBox placeholder="Ex.: PlayStation 5 Slim ou link da loja" suggestions={["iPhone 16", "PlayStation 5", "Air Fryer", "Kindle"]} /></div>
          <ul className={styles.trust}>
            {["Histórico diário de 40 dias", "Regras abertas", "Nenhum veredito pago"].map(text => <li key={text}><Check size={16} color="#1d7a4b" strokeWidth={2.2} aria-hidden="true" />{text}</li>)}
          </ul>
        </div>
      </section>

      <div className={`${styles.head} ${styles.headTight}`} id="termometro">
        <div><span className={styles.kicker}>Termômetro · o que está sendo procurado agora</span><h2>Os mais buscados, com veredito.</h2></div>
        <p>Descontos maquiados primeiro. Toque num produto para ver o gráfico completo e as lojas.</p>
      </div>
      <Suspense fallback={<ThermometerSkeleton count={8} />}><Thermometer /></Suspense>

      <div className={styles.head}>
        <div><span className={styles.kicker}>Na prática</span><h2>O veredito, na prática.</h2></div>
      </div>
      <div className={styles.practice}>
        <Suspense fallback={<div className={styles.example} aria-hidden="true" style={{ minHeight: 420 }} />}><Example /></Suspense>
      <section className={styles.questions} aria-label="O que respondemos">
        {[
          ["01", "Está barato hoje?", "Comparamos com o preço típico do próprio produto, não com o “de” riscado da loja."],
          ["02", "Já esteve mais barato?", "Mostramos o menor preço do período e quanto falta para chegar nele."],
          ["03", "Subiu antes de cair?", "Se o preço foi inflado nas semanas anteriores, o selo avisa: desconto maquiado."],
        ].map(([n, title, text]) => <div key={n} className={styles.question}><span>{n}</span><h2>{title}</h2><p>{text}</p></div>)}
      </section>
      </div>


      <div className={styles.head} id="regras"><h2>Como julgamos, sem letra miúda.</h2></div>
      <section className={styles.rules}>
        <div className={styles.rule}><VerdictBadge tone="good" label="Desconto real" /><p>No menor preço do período e pelo menos 3% abaixo do preço típico (mediana).</p></div>
        <div className={styles.rule}><VerdictBadge tone="bad" label="Desconto maquiado" /><p>Subiu 8% ou mais nas duas semanas anteriores e hoje só voltou ao patamar normal.</p></div>
        <div className={styles.rule}><VerdictBadge tone="warn" label="Acima do normal" /><p>Pelo menos 5% acima do preço típico. Vale esperar ou procurar outra loja.</p></div>
      </section>
      <Link href="/black-friday#como-julgamos" className={styles.more}>Ver as 6 regras e a fonte dos dados →</Link>

      <section className={styles.cta}>
        <div>
          <h2>Viu uma oferta?<br />Cole o link antes de pagar.</h2>
          <p>Funciona com links de Amazon, Mercado Livre, Magalu, KaBuM! e outras lojas.</p>
        </div>
        <div className={styles.ctaSearch}><SearchBox id="cta-search" placeholder="https://loja.com.br/produto…" /></div>
      </section>
      <SiteFooter />
    </div>
  </main>;
}
