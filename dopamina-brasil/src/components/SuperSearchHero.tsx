"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Download, Loader2, Search, Sparkles } from "lucide-react";
import AnalysisDashboard from "./AnalysisDashboard";
import { trackEvent } from "@/lib/tracking";
import { isBlockedSearch } from "@/lib/search-policy";

type Offer = { name: string; price: number; link: string; image?: string };
export type SearchResult = {
  success: boolean;
  query: string;
  scraped_name: string;
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

  return <main className="relative min-h-[100dvh] overflow-hidden bg-[#080914] text-white selection:bg-violet-400/40">
    <div aria-hidden className="pointer-events-none absolute -left-44 top-10 h-[450px] w-[450px] rounded-full bg-violet-700/25 blur-[110px]" />
    <div aria-hidden className="pointer-events-none absolute -right-48 top-60 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[110px]" />
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

    <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 pb-12 pt-7 sm:px-8 sm:pt-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-[var(--font-display)] text-xl font-bold tracking-[-.06em]">dopamina<span className="text-violet-400">.</span></Link>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/65">Comparador aberto · relatório grátis</span>
      </header>

      <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.12fr_.88fr] lg:gap-20">
        <section>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-200"><Sparkles size={14} /> Sua próxima compra começa com clareza</div>
            <h1 className="max-w-2xl font-[var(--font-display)] text-[clamp(3.2rem,9vw,6.6rem)] font-semibold leading-[.96] tracking-[-.075em]">Preço bom é <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">preço conferido.</span></h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">Compare resultados encontrados agora, entenda a diferença entre eles e leve um relatório gratuito para decidir com calma.</p>
          </motion.div>

          <form onSubmit={event => { event.preventDefault(); void search(query); }} className="mt-9 rounded-[24px] border border-white/15 bg-white/[.08] p-2 shadow-[0_22px_80px_rgba(76,29,149,.22)] backdrop-blur-xl sm:flex sm:items-center">
            <label htmlFor="product-search" className="sr-only">Nome do produto ou link</label>
            <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:py-0"><Search size={20} className="shrink-0 text-violet-300" /><input id="product-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Produto ou link da oferta" className="min-w-0 w-full bg-transparent text-base text-white outline-none placeholder:text-slate-400" /></div>
            <button type="submit" disabled={loading || !query.trim()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:brightness-110 disabled:opacity-50 sm:w-auto">{loading ? <Loader2 size={19} className="animate-spin" /> : <>Analisar agora <ArrowRight size={18} /></>}</button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-slate-400">Experimente:</span>{suggestions.map(item => <button key={item} type="button" onClick={() => void search(item)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-violet-300/50 hover:bg-violet-300/10">{item}</button>)}</div>
        </section>

        <motion.section initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .15 }} className="relative rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[.13] to-white/[.035] p-5 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl sm:p-7" aria-label="Como funciona a análise">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[.2em] text-violet-200">Sua análise</span><BarChart3 className="text-violet-300" size={19} /></div>
          <h2 className="mt-7 font-[var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">Números que ajudam a escolher.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">Um retrato claro dos resultados da sua busca, sem previsões inventadas.</p>
          <div className="mt-8 space-y-6">{[
            { label: "Preços encontrados", width: "84%", gradient: "from-violet-400 to-fuchsia-400" },
            { label: "Amplitude da amostra", width: "58%", gradient: "from-cyan-400 to-blue-400" },
            { label: "Links para conferir", width: "70%", gradient: "from-fuchsia-400 to-violet-400" },
          ].map(row => <div key={row.label}><div className="mb-2 flex justify-between text-xs text-slate-300"><span>{row.label}</span><span className="text-white/45">disponível na busca</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full bg-gradient-to-r ${row.gradient}`} style={{ width: row.width }} /></div></div>)}</div>
          <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11152a] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200"><Download size={19} /></span><div><p className="text-sm font-semibold">PDF para levar com você</p><p className="text-xs text-slate-400">Gratuito, com fonte e horário da consulta.</p></div></div>
        </motion.section>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">Os resultados podem incluir modelos diferentes. Confirme especificações, frete e condições no site de origem antes de comprar.</p>
    </div>
  </main>;
}
