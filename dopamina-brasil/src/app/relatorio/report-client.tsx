'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Download, Loader2 } from 'lucide-react';
import { buildPriceReportPdf } from '@/lib/report-pdf';

type Offer = { name: string; price: number; link: string };
type Result = { success: boolean; scraped_name: string; scraped_price: number; url: string; market_alternatives: Offer[]; checked_at: string };
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

  const offers = result ? [{ name: result.scraped_name, price: result.scraped_price, link: result.url }, ...(result.market_alternatives || [])]
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

  return <main className="relative min-h-[100dvh] bg-[#080914] px-4 py-7 text-white sm:px-8">
    <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-80 w-full bg-violet-700/15 blur-[100px]" />
    <div className="relative mx-auto max-w-4xl"><div className="flex items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={17} /> Nova busca</Link><span className="font-[var(--font-display)] text-xl font-bold tracking-[-.06em]">dopamina<span className="text-violet-400">.</span></span></div>
      <div className="mt-14 rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/15 to-white/[.03] p-6 sm:p-10"><span className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200">Relatório gratuito</span><h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">Sua pesquisa, pronta para levar.</h1><p className="mt-4 text-sm text-slate-300">Busca: {query}</p><p className="mt-2 text-xs text-slate-400">{result ? `Consulta: ${new Date(result.checked_at).toLocaleString('pt-BR')} · Fonte: Buscapé` : 'Consultando resultados atuais…'}</p><button onClick={() => void download()} disabled={!offers.length || downloading} className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#141026] transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{downloading ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />} Baixar relatório em PDF · grátis</button></div>
      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</p>}
      {!result && !error && <p className="mt-8 text-sm text-slate-300">Consultando ofertas…</p>}
      {result && <section className="mt-10"><h2 className="font-[var(--font-display)] text-2xl font-semibold">Resultados desta consulta</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">Preços podem mudar. Os resultados podem incluir modelos diferentes; confira produto, vendedor, frete e pagamento na fonte.</p><ol className="mt-6 grid gap-3 sm:grid-cols-2">{offers.map((offer, index) => <li key={`${offer.link}-${index}`} className="rounded-2xl border border-white/10 bg-white/[.055] p-5"><span className="text-xs text-violet-200">Resultado {index + 1}</span><p className="mt-3 min-h-10 text-sm font-medium text-slate-200">{offer.name}</p><p className="mt-3 text-2xl font-semibold">{money(offer.price)}</p><a href={offer.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm text-violet-200 hover:text-white">Conferir na fonte <ArrowUpRight size={15} /></a></li>)}</ol><p className="mt-8 text-xs leading-relaxed text-slate-500">Comparação pontual dos resultados de busca, sem histórico de preços, previsão de queda ou garantia de economia. O arquivo PDF reflete o horário exibido acima.</p></section>}
    </div>
  </main>;
}
