'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Download, Loader2 } from 'lucide-react';
import { buildPriceReportPdf } from '@/lib/report-pdf';
import ProductVisual from '@/components/ProductVisual';
import styles from '@/components/studio.module.css';

type Offer = { name: string; price: number; link: string; image?: string };
type Result = { image?: string; success: boolean; scraped_name: string; scraped_price: number; url: string; market_alternatives: Offer[]; checked_at: string };
const money = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

export default function ReportClient({ query }: { query: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/price-history?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Não foi possível consultar ofertas agora. Tente novamente mais tarde.');
        return response.json();
      })
      .then(data => { if (!data.success) throw new Error('Não há preços verificáveis para esta busca.'); setResult(data); })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [query]);

  const offers = result ? [{ name: result.scraped_name, price: result.scraped_price, link: result.url, image: result.image }, ...(result.market_alternatives || [])]
    .filter(o => o.name && Number.isFinite(o.price) && o.price > 0 && /^https:\/\//i.test(o.link)).sort((a, b) => a.price - b.price) : [];

  async function download() {
    if (!result || !offers.length) return;
    setDownloading(true);
    try {
      const bytes = buildPriceReportPdf({ query, checkedAt: result.checked_at, offers });
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `dopamina-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally { setDownloading(false); }
  }

  return <main className={styles.shell}>
    <div className={styles.wrap}>
      <header className={styles.nav}><Link href="/" className={styles.brand}>dopamina</Link><Link href="/" className={styles.back}><ArrowLeft size={15} /> Nova busca</Link></header>
      <section className={`${styles.reportHero} ${styles.reveal}`}><span className={styles.eyebrow}>Seu relatório · Gratuito</span><h1>Uma escolha<br />bem documentada.</h1><p className={styles.intro}>Sua pesquisa de {query}, organizada para consultar e compartilhar.</p><p className={styles.note}>{result ? `Consulta: ${new Date(result.checked_at).toLocaleString('pt-BR')} · Fonte: Buscapé` : 'Consultando os resultados atuais…'}</p><button onClick={() => void download()} disabled={!offers.length || downloading} className={`${styles.blueLink} ${styles.reportButton}`}>{downloading ? <Loader2 size={17} className={styles.spin} /> : <Download size={17} />} Baixar PDF gratuito</button></section>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {!result && !error && <p role="status" className={styles.status}>Consultando ofertas…</p>}
      {result && <><div className={styles.sectionHead}><div><span className={styles.eyebrow}>O retrato da sua pesquisa</span><h2>Resultados encontrados.</h2></div><p>Os resultados podem incluir modelos diferentes. Confira as especificações e condições na fonte.</p></div><section className={styles.offers} aria-label="Resultados do relatório">{offers.map((offer, index) => <article key={`${offer.link}-${index}`} className={styles.offer}><div className={styles.offerVisual}><span className={styles.tag}>Resultado 0{index + 1}</span><ProductVisual src={offer.image} name={offer.name} /></div><h3>{offer.name}</h3><strong>{money(offer.price)}</strong><a href={offer.link} target="_blank" rel="noopener noreferrer">Conferir na fonte <ArrowUpRight size={15} /></a></article>)}</section></>}
      <footer className={styles.footer}><span>© Dopamina · Comprar com clareza.</span><span>O PDF registra os valores da consulta. Preços e disponibilidade podem mudar.</span></footer>
    </div>
  </main>;
}
