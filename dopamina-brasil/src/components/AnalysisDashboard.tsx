"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, Download } from "lucide-react";
import type { SearchResult } from "./SuperSearchHero";
import ProductVisual from "./ProductVisual";
import styles from "./studio.module.css";

const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
type Props = { data: SearchResult; onReset: () => void; onSearch?: (query: string) => void; isReloading?: boolean; error?: string };

export default function AnalysisDashboard({ data, onReset, onSearch, isReloading, error }: Props) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(0);
  const offers = [{ name: data.scraped_name, price: data.scraped_price, link: data.url, image: data.image }, ...(data.market_alternatives || [])]
    .filter(offer => offer.name && Number.isFinite(offer.price) && offer.price > 0 && /^https:\/\//i.test(offer.link)).sort((a, b) => a.price - b.price);
  const min = offers[0]?.price ?? 0;
  const max = offers.at(-1)?.price ?? 0;
  const count = offers.length;
  const median = count ? count % 2 ? offers[(count - 1) / 2].price : (offers[count / 2 - 1].price + offers[count / 2].price) / 2 : 0;
  const spread = max - min;
  const selectedOffer = offers[Math.min(selected, Math.max(0, count - 1))];
  const heroOffer = offers[0];
  const timestamp = new Date(data.checked_at);
  const checked = Number.isNaN(timestamp.getTime()) ? "Horário não informado" : timestamp.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const reportHref = `/relatorio?q=${encodeURIComponent(data.query || data.scraped_name)}`;

  return <main className={styles.shell} aria-busy={isReloading}>
    <div className={styles.wrap}>
      <header className={styles.nav}><button onClick={onReset} className={styles.brand}>dopamina</button><button onClick={onReset} className={styles.back}><ArrowLeft size={15} /> Nova pesquisa</button></header>
      <div className={isReloading ? styles.loading : styles.reveal}>
        <section className={styles.resultHero}>
          <div className={styles.resultVisual}><span className={styles.eyebrow}>Em foco · Menor valor da amostra</span><ProductVisual key={heroOffer?.image || data.query} src={heroOffer?.image} name={heroOffer?.name || data.scraped_name} priority /></div>
          <div><span className={styles.eyebrow}>Sua pesquisa, em perspectiva</span><h1 className={styles.resultTitle}>{heroOffer?.name || data.scraped_name}</h1><p className={styles.caption}>Busca: {data.query} · {count} resultados encontrados</p><p className={styles.heroPrice}>{currency(min)}</p><p className={styles.caption}>Menor preço entre os resultados desta consulta.</p>{heroOffer && <a href={heroOffer.link} target="_blank" rel="noopener noreferrer" className={styles.blueLink}>Conferir na fonte <ArrowUpRight size={16} /></a>}<p className={styles.note}>Fonte: Buscapé · {checked}<br />Confira modelo, vendedor, frete e condições de pagamento.</p></div>
        </section>
        <section className={styles.metrics} aria-label="Indicadores da amostra">
          <div className={styles.metric}><label>Valor central</label><strong>{currency(median)}</strong><p className={styles.caption}>Mediana dos resultados</p></div>
          <div className={styles.metric}><label>Amplitude</label><strong>{currency(spread)}</strong><p className={styles.caption}>Maior menos menor preço</p></div>
          <div className={styles.metric}><label>Resultados observados</label><strong>{String(count).padStart(2, "0")}</strong><p className={styles.caption}>Nesta consulta</p></div>
        </section>
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Leitura de preços</span><h2>O detalhe faz<br />a diferença.</h2></div><p>Os gráficos retratam esta busca. Compare as especificações: os resultados podem incluir modelos diferentes.</p></div>
        <section className={styles.charts} aria-label="Análise gráfica de preços">
          <div className={styles.panel}><div className={styles.panelTop}><h3>Comparativo de valores</h3><span>BRL · consulta atual</span></div><div className={styles.chart}>{offers.map((offer, index) => <button key={`${offer.link}-${index}`} className={styles.chartItem} aria-pressed={selected === index} aria-label={`Resultado ${index + 1}: ${offer.name}, ${currency(offer.price)}`} onClick={() => setSelected(index)}><strong>{currency(offer.price)}</strong><span className={styles.bar} style={{ height: `${max ? offer.price / max * 82 : 0}%`, animationDelay: `${index * .08}s` }} /></button>)}</div><div className={styles.chartLabels}>{offers.map((offer, index) => <span key={`${offer.link}-${index}`}>0{index + 1}</span>)}</div><div className={styles.chartDetail} aria-live="polite">{selectedOffer ? <><strong>{currency(selectedOffer.price)}</strong> · {selectedOffer.name}</> : "Nenhum resultado disponível."}</div><p className={styles.note}>Toque em uma barra para ver o resultado correspondente. Escala linear a partir de zero.</p></div>
          <div className={styles.panel}><div className={styles.panelTop}><h3>Distribuição da amostra</h3><span>{count} observações</span></div><p className={styles.rangeValue}>{min > 0 ? `${((spread / min) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "—"}</p><p className={styles.caption}>Variação do menor ao maior valor observado.</p><div className={styles.rangeTrack} role="img" aria-label={`Preços entre ${currency(min)} e ${currency(max)}. Amplitude ${currency(spread)}.`}>{offers.map((offer, index) => <span key={`${offer.link}-${index}`} className={styles.rangeDot} title={`${offer.name}: ${currency(offer.price)}`} style={{ left: `${spread ? (offer.price - min) / spread * 100 : 50}%`, top: `${17 + (index % 2) * 7}px` }} />)}<div className={styles.rangeEnds}><span>{currency(min)}</span><span>{currency(max)}</span></div></div><p className={styles.note}>{count < 2 ? "Um único resultado não permite avaliar a dispersão dos preços." : "Pontos próximos indicam valores semelhantes. Cada ponto corresponde a um resultado da consulta."}</p><p className={styles.note}>A variação não representa economia garantida nem histórico de preços.</p></div>
        </section>
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Da análise à escolha</span><h2>Explore os resultados.</h2></div><p>Ordenados por preço. Imagens e informações fornecidas pela fonte da pesquisa.</p></div>
        <section className={styles.offers} aria-label="Resultados encontrados">{offers.map((offer, index) => <article key={`${offer.link}-${index}`} className={styles.offer}><div className={styles.offerVisual}><span className={styles.tag}>{index === 0 ? "Menor nesta amostra" : `Resultado 0${index + 1}`}</span><ProductVisual src={offer.image} name={offer.name} /></div><h3>{offer.name}</h3><strong>{currency(offer.price)}</strong><a href={offer.link} target="_blank" rel="noopener noreferrer">Ver resultado <ArrowUpRight size={15} /></a></article>)}</section>
        <section className={styles.feature}><div><span className={styles.eyebrow}>Para guardar. Para compartilhar.</span><h2>Sua análise.<br />No seu tempo.</h2><p>Baixe gratuitamente o relatório em PDF com preços, horário e links. Uma nova consulta será feita ao abri-lo.</p><Link href={reportHref} className={styles.textLink}><Download size={15} /> Abrir relatório gratuito <ArrowUpRight size={15} /></Link></div><div className={styles.diagram} aria-hidden="true"><div className={styles.diagramInner}><strong>dopamina.</strong><i /><i /><i /><span>RELATÓRIO DE PREÇOS</span></div></div></section>
      </div>
      <section style={{ marginBottom: 45 }}><span className={styles.eyebrow}>Outra ideia em mente?</span><div className={styles.resultSearch}><form className={styles.search} onSubmit={event => { event.preventDefault(); if (input.trim()) { setSelected(0); onSearch?.(input.trim()); } }}><Search size={17} /><label htmlFor="another-product" className="sr-only">Pesquisar outro produto</label><input id="another-product" value={input} onChange={event => setInput(event.target.value)} placeholder="Pesquisar outro produto" /><button aria-label="Pesquisar" disabled={!input.trim() || isReloading}><ArrowRight size={18} /></button></form></div>{isReloading && <p role="status" className={styles.status}>Consultando preços…</p>}{error && <p role="alert" className={styles.error}>{error}</p>}</section>
      <footer className={styles.footer}><span>© Dopamina · Comprar com clareza.</span><span>Consulta pontual. Preços e disponibilidade podem mudar.</span></footer>
    </div>
  </main>;
}
