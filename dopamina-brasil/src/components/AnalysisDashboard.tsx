"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Clock3, Download, Search, ShieldCheck, Sparkles } from "lucide-react";
import type { SearchResult } from "./SuperSearchHero";

const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

type Props = { data: SearchResult; onReset: () => void; onSearch?: (query: string) => void; isReloading?: boolean; error?: string };

export default function AnalysisDashboard({ data, onReset, onSearch, isReloading, error }: Props) {
  const [input, setInput] = useState("");
  const offers = useMemo(() => [
    { name: data.scraped_name, price: data.scraped_price, link: data.url },
    ...(data.market_alternatives || []),
  ].filter(offer => offer.name && Number.isFinite(offer.price) && offer.price > 0 && /^https:\/\//i.test(offer.link)).sort((a, b) => a.price - b.price), [data]);
  const prices = offers.map(offer => offer.price);
  const min = prices[0] ?? 0;
  const max = prices.at(-1) ?? 0;
  const median = prices.length ? prices.length % 2 ? prices[(prices.length - 1) / 2] : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2 : 0;
  const spread = max - min;
  const timestamp = new Date(data.checked_at);
  const checked = Number.isNaN(timestamp.getTime()) ? "agora" : timestamp.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return <main className="min-h-[100dvh] bg-[#080914] text-white selection:bg-violet-400/40">
    <div aria-hidden className="pointer-events-none fixed -left-40 top-12 h-[450px] w-[450px] rounded-full bg-violet-800/25 blur-[110px]" />
    <div aria-hidden className="pointer-events-none fixed -right-48 top-72 h-[400px] w-[400px] rounded-full bg-cyan-700/15 blur-[100px]" />
    <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-8 sm:pt-9">
      <header className="flex flex-wrap items-center justify-between gap-4"><button onClick={onReset} className="flex items-center gap-2 font-[var(--font-display)] text-xl font-bold tracking-[-.06em]">dopamina<span className="text-violet-400">.</span></button><button onClick={onReset} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={16} /> Nova busca</button></header>

      <div className="mt-10 max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><Sparkles size={13} /> ANÁLISE DA BUSCA</span><h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-[-.055em] sm:text-6xl">Uma visão mais clara <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">do preço.</span></h1><p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">{data.query || data.scraped_name} · {offers.length} {offers.length === 1 ? "resultado observado" : "resultados observados"}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-400"><Clock3 size={14} /> Consulta: {checked} · Fonte: Buscapé</p></div>

      <form className="mt-8 flex max-w-xl gap-2 rounded-2xl border border-white/10 bg-white/[.07] p-2" onSubmit={event => { event.preventDefault(); if (input.trim()) onSearch?.(input.trim()); }}><label className="sr-only" htmlFor="another-product">Pesquisar outro produto</label><div className="flex min-w-0 flex-1 items-center gap-2 px-2"><Search size={17} className="text-violet-300" /><input id="another-product" value={input} onChange={event => setInput(event.target.value)} placeholder="Pesquisar outro produto" className="min-w-0 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400" /></div><button disabled={!input.trim() || isReloading} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Buscar</button></form>
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}

      <section aria-label="Indicadores desta busca" className="mt-9 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Menor valor da amostra", value: currency(min), note: "Entre os resultados exibidos", shade: "from-violet-500/20" },
          { label: "Mediana da amostra", value: currency(median), note: `${offers.length} ${offers.length === 1 ? "resultado" : "resultados"} nesta consulta`, shade: "from-fuchsia-500/20" },
          { label: "Amplitude observada", value: currency(spread), note: "Maior valor menos menor valor", shade: "from-cyan-500/20" },
        ].map((metric, index) => <motion.div key={metric.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }} className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${metric.shade} to-white/[.03] p-5 backdrop-blur-sm sm:p-6`}><p className="text-xs font-medium text-slate-300">{metric.label}</p><p className="mt-3 font-[var(--font-display)] text-[clamp(1.7rem,4vw,2.65rem)] font-semibold tracking-tight">{metric.value}</p><p className="mt-2 text-xs text-slate-400">{metric.note}</p></motion.div>)}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-[26px] border border-white/10 bg-white/[.055] p-5 sm:p-7" aria-labelledby="comparison-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="comparison-title" className="font-[var(--font-display)] text-xl font-semibold">Mapa de preços</h2><p className="mt-1 text-xs text-slate-400">Cada barra representa um resultado encontrado agora.</p></div><span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">{offers.length} observações</span></div>
          <div className="mt-8 space-y-6">{offers.map((offer, index) => <div key={`${offer.link}-${index}`}><div className="mb-2 flex items-start justify-between gap-3 text-sm"><span className="min-w-0 max-w-[65%] truncate text-slate-200" title={offer.name}>{index + 1}. {offer.name}</span><strong className="shrink-0 font-semibold">{currency(offer.price)}</strong></div><div role="img" aria-label={`${offer.name}: ${currency(offer.price)}`} className="h-3 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(8, max ? (offer.price / max) * 100 : 0)}%` }} transition={{ duration: .65, delay: index * .1 }} className={`h-full rounded-full bg-gradient-to-r ${index === 0 ? "from-violet-400 via-fuchsia-400 to-pink-400" : "from-sky-500/80 to-cyan-300/80"}`} /></div></div>)}</div>
          <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-slate-400">A escala compara preços de resultados da busca. Modelos, especificações e vendedores podem ser diferentes; a diferença entre barras não representa economia garantida.</div>
        </section>
        <section className="flex flex-col justify-between rounded-[26px] border border-violet-300/20 bg-gradient-to-br from-violet-500/20 via-[#18122e] to-[#10182b] p-6 sm:p-7"><div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-300/15 text-violet-200"><Download size={22} /></div><h2 className="mt-7 font-[var(--font-display)] text-2xl font-semibold leading-tight">Seu relatório, sem custo.</h2><p className="mt-3 text-sm leading-relaxed text-slate-300">Leve a análise em PDF com resultados, fonte e horário. Uma nova consulta é feita ao abrir o relatório.</p></div><a href={`/relatorio?q=${encodeURIComponent(data.query || data.scraped_name)}`} className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#141026] transition hover:bg-violet-100">Abrir e baixar PDF <ArrowUpRight size={17} /></a></section>
      </div>

      <section className="mt-10" aria-labelledby="offers-title"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="offers-title" className="font-[var(--font-display)] text-2xl font-semibold sm:text-3xl">Resultados para conferir</h2><p className="mt-1 text-sm text-slate-400">Ordenados pelo valor exibido na consulta.</p></div><span className="flex items-center gap-1.5 text-xs text-emerald-300"><ShieldCheck size={16} /> Links da fonte</span></div><div className="grid gap-3 sm:grid-cols-2">{offers.map((offer, index) => <article key={`${offer.link}-${index}`} className="group rounded-[22px] border border-white/10 bg-white/[.055] p-5 transition hover:border-violet-300/30 hover:bg-white/[.09]"><div className="flex items-start justify-between gap-4"><span className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-slate-300">Resultado {index + 1}</span>{index === 0 && <span className="text-[11px] font-medium text-violet-200">Menor nesta amostra</span>}</div><h3 className="mt-5 min-h-10 line-clamp-2 text-sm font-medium leading-snug text-slate-200">{offer.name}</h3><p className="mt-4 font-[var(--font-display)] text-2xl font-semibold">{currency(offer.price)}</p><a href={offer.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-violet-200 hover:text-white">Conferir na fonte <ArrowUpRight size={16} /></a></article>)}</div></section>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-slate-500">Consulta pontual, sem histórico ou previsão de preços. Confira modelo, frete, disponibilidade e forma de pagamento antes da compra.</p>
    </div>
  </main>;
}
