"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import PriceOverviewCard from "./cards/PriceOverviewCard";
import PriceHistoryChart from "./cards/PriceHistoryChart";
import NetPriceCard from "./cards/NetPriceCard";
import PriceForecastCard from "./cards/PriceForecastCard";
import MarketAlternativesCard from "./cards/MarketAlternativesCard";
import CostPerUseCard from "./cards/CostPerUseCard";
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

interface AnalysisDashboardProps {
  data: any;
  onReset: () => void;
  onSearch?: (query: string) => void;
  isReloading?: boolean;
}

export default function AnalysisDashboard({ data, onReset, onSearch, isReloading }: AnalysisDashboardProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(false);
    setInternalQuery("");
  }, [data]);

  const handleInternalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalQuery.trim() || !onSearch) return;
    setIsSearching(true);
    onSearch(internalQuery);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background overflow-y-auto overflow-x-hidden pt-20 pb-20 transition-opacity duration-500 ${isReloading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo */}
          <button onClick={onReset} className="group flex shrink-0 items-center gap-2">
            <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-foreground">
              dopamina
            </span>
          </button>

          {/* Search Input */}
          <div className="flex-1 max-w-xl mx-auto w-full">
            <form onSubmit={handleInternalSearch} className="relative flex items-center">
              <div className="absolute left-3 text-muted-light">
                {isReloading || isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4" />}
              </div>
              <input 
                type="text"
                value={internalQuery}
                onChange={(e) => setInternalQuery(e.target.value)}
                disabled={isReloading || isSearching}
                placeholder="Pesquisar outro produto..."
                className="w-full bg-surface-light border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-light outline-none focus:border-primary/30 focus:bg-white focus:shadow-[0_2px_12px_rgba(0,113,227,0.08)] transition-all"
              />
            </form>
          </div>

          <button 
            onClick={onReset}
            className="shrink-0 text-sm text-muted hover:text-foreground transition flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        
        <div className="mt-8 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-[var(--font-display)] tracking-tight mb-6">
            {data.scraped_name || "Análise de Produto"}
          </h1>

          {/* Product Selection Hero Section */}
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 hide-scrollbar">
            {[
              {
                name: data.scraped_name || "Produto Buscado",
                price: data.current_price,
                link: null,
                isMain: true
              },
              ...(data.market_alternatives || []).map((alt: any) => ({
                name: alt.name,
                price: alt.price,
                link: alt.link,
                isMain: false
              }))
            ].map((prod, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!prod.isMain && onSearch) {
                    onSearch(prod.link || prod.name);
                  }
                }}
                className={`flex-shrink-0 w-64 text-left p-4 rounded-2xl border transition-all duration-300 ${
                  prod.isMain 
                    ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-sm' 
                    : 'bg-surface hover:bg-surface-hover border-border hover:border-black/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    prod.isMain ? 'bg-primary text-white' : 'bg-surface-light text-muted'
                  }`}>
                    {idx === 0 ? <ShieldCheck className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  </div>
                  {prod.isMain && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Buscado
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 h-10">
                  {prod.name}
                </h3>
                <p className="font-mono font-bold text-lg text-foreground">
                  {prod.price ? `R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          
          {/* Full Width Hero */}
          <div className="lg:col-span-12">
            <PriceOverviewCard data={data} />
          </div>

          {/* Second Row */}
          <div className="lg:col-span-4">
            <NetPriceCard data={data} />
          </div>

          <div className="lg:col-span-4">
            <PriceHistoryChart data={data} />
          </div>
          
          <div className="lg:col-span-4">
            <PriceForecastCard data={data} />
          </div>

          <div className="lg:col-span-12">
            <CostPerUseCard data={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
