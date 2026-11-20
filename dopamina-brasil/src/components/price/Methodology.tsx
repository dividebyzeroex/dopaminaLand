import studio from "../studio.module.css";
import styles from "../bf.module.css";
import VerdictBadge from "./VerdictBadge";
import { MIN_DAYS, VERDICT_RULES } from "@/lib/price-verdict";

const toneOf = (kind: string) => (kind === "menor" || kind === "abaixo" ? "good" : kind === "maquiado" ? "bad" : kind === "acima" ? "warn" : "neutral") as "good" | "bad" | "warn" | "neutral";

/** As regras do veredito, iguais para todas as datas e produtos. */
export default function Methodology() {
  return <>
    <div className={studio.sectionHead} id="como-julgamos"><div><span className={studio.eyebrow}>Metodologia aberta</span><h2>Como julgamos<br />cada preço.</h2></div><p>Regras simples, aplicadas igual para todos os produtos e em qualquer data. Não recebemos nada para mudar um veredito.</p></div>
    <section className={styles.rules}>
      {VERDICT_RULES.map(rule => <article key={rule.kind} className={styles.rule}><VerdictBadge tone={toneOf(rule.kind)} label={rule.label} small /><p>{rule.rule}</p></article>)}
    </section>
    <section className={studio.strip} aria-label="Detalhes do cálculo" style={{ marginBottom: 60 }}>
      <article><span>01</span><div><h3>Menor preço do dia</h3><p>Usamos o menor preço entre todas as lojas que vendem o mesmo modelo, dia a dia.</p></div></article>
      <article><span>02</span><div><h3>Preço típico = mediana</h3><p>A mediana ignora picos isolados. É o valor que o produto “costuma” custar no período.</p></div></article>
      <article><span>03</span><div><h3>Mínimo de {MIN_DAYS} dias</h3><p>Com menos histórico do que isso, dizemos que não dá para afirmar. Frete, cupom e cashback ficam de fora.</p></div></article>
    </section>
  </>;
}
