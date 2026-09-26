"use client";

import { useState } from "react";
import Link from "next/link";
import ProductVisual from "./ProductVisual";
import styles from "./studio.module.css";
import { ArrowRight, ArrowUpRight, Loader2, Search } from "lucide-react";
import AnalysisDashboard from "./AnalysisDashboard";
import { trackEvent } from "@/lib/tracking";
import { isBlockedSearch } from "@/lib/search-policy";

type Offer = { name: string; price: number; link: string; image?: string };
export type SearchResult = {
  success: boolean;
  query: string;
  scraped_name: string;
  image?: string;
  scraped_price: number;
  current_price: number;
  url: string;
  checked_at: string;
  market_alternatives: Offer[];
};

const suggestions = ["iPhone 15", "PlayStation 5", "Notebook Samsung"];

export default function SuperSearchHero() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);

  async function search(value: string) {
    const term = value.trim();
    if (!term || loading) return;
    if (isBlockedSearch(term)) { setError("Esta pesquisa não é permitida. Busque outro produto."); return; }
    setQuery(term);
    setError("");
    setLoading(true);
    try {
      const parameter = /^https?:\/\//i.test(term) ? "url" : "q";
      const response = await fetch(`/api/price-history?${parameter}=${encodeURIComponent(term)}`);
      const payload = await response.json();
      if (!response.ok || !payload.success || !Number.isFinite(payload.scraped_price)) {
        throw new Error("Não conseguimos consultar preços verificáveis agora. Tente outro produto em instantes.");
      }
      setResult(payload);
      trackEvent("super_search", "search_executed", payload.scraped_price, { query: term, results: 1 + (payload.market_alternatives?.length || 0) });
    } catch {
      setError("Não conseguimos consultar preços verificáveis agora. Tente outro produto em instantes.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <AnalysisDashboard data={result} onReset={() => { setResult(null); setError(""); }} onSearch={search} isReloading={loading} error={error} />;
  }

  return <main className={styles.shell}>
    <div className={styles.wrap}>
      <header className={styles.nav}><Link href="/" className={styles.brand}>dopamina</Link><div className={styles.navLinks}><a href="#como-funciona">Como funciona</a><span className={styles.navNote}>Comprar com clareza</span></div></header>
      <section className={styles.hero}>
        <div className={styles.reveal}><span className={styles.eyebrow}>Inteligência para a sua próxima compra</span><h1 className={styles.title}>O desejo é seu.<br /><em>A decisão,<br />bem informada.</em></h1><p className={styles.intro}>Encontre preços, enxergue as diferenças e escolha com mais tranquilidade. Tudo começa com uma busca.</p>
          <form className={styles.search} onSubmit={event => { event.preventDefault(); void search(query); }}><Search size={18} strokeWidth={1.5} /><label htmlFor="product-search" className="sr-only">Produto ou link da oferta</label><input id="product-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você tem em mente?" /><button aria-label="Analisar produto" type="submit" disabled={loading || !query.trim()}>{loading ? <Loader2 size={18} className={styles.spin} /> : <><span>Analisar</span><ArrowRight size={18} /></>}</button></form>
          {loading && <p role="status" className={styles.status}>Consultando os preços da sua busca…</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
          <div className={styles.suggestions}><span>Explore</span>{suggestions.map(item => <button key={item} disabled={loading} onClick={() => void search(item)}>{item}</button>)}</div>
        </div>
        <div className={`${styles.heroArt} ${styles.reveal}`} style={{ animationDelay: ".12s" }}><div className={styles.artTop}><span>Objetos de desejo</span><span>01 / Tecnologia</span></div><div className={styles.artCircle} aria-hidden="true" /><ProductVisual priority src="/produtos/macbook-pro-14-m4-pro-12cpu-16gpu-48gb-r-2.png" name="MacBook Pro visto de frente" /><div className={styles.artBottom}><div><h2>Design que desperta.</h2><p>Uma escolha que merece ser pesquisada.</p></div><button className={styles.roundButton} onClick={() => void search("MacBook Pro 14 M4")} aria-label="Pesquisar MacBook Pro"><ArrowUpRight size={21} strokeWidth={1.25} /></button></div></div>
      </section>
      <section id="como-funciona" className={styles.strip} aria-label="Como funciona">{[{ n: "01", title: "Encontre seu próximo desejo", text: "Digite o produto ou cole o link que chamou sua atenção." }, { n: "02", title: "Veja os preços com perspectiva", text: "Compare os resultados e explore a distribuição dos valores." }, { n: "03", title: "Leve a análise com você", text: "Baixe um relatório gratuito com os preços e links da consulta." }].map(item => <article key={item.n}><span>{item.n}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</section>
      <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Menos ruído. Mais contexto.</span><h2>Uma boa compra começa<br />antes do carrinho.</h2></div><p>Preços observados, fontes acessíveis e uma leitura visual feita para facilitar sua decisão.</p></div>
      <section className={styles.feature}><div><span className={styles.eyebrow}>Seu relatório, sem custo</span><h2>Pesquise agora.<br />Decida no seu tempo.</h2><p>Guarde os resultados em um PDF com data, preços e links. Para comparar, compartilhar ou simplesmente pensar melhor.</p><a className={styles.textLink} href="#product-search">Começar uma análise <ArrowUpRight size={16} /></a></div><div className={styles.diagram} aria-hidden="true"><div className={styles.diagramInner}><strong>dopamina.</strong><i /><i /><i /><span>RELATÓRIO DE PREÇOS</span></div></div></section>
      <footer className={styles.footer}><span>© Dopamina · Uma compra mais consciente.</span><span>Preços e disponibilidade sujeitos à fonte. <Link href="/legal">Termos e privacidade</Link></span></footer>
    </div>
  </main>;
}
