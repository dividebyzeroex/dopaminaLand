"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import PriceOverviewCard from "./cards/PriceOverviewCard";
import PriceHistoryChart from "./cards/PriceHistoryChart";
import NetPriceCard from "./cards/NetPriceCard";
import PriceForecastCard from "./cards/PriceForecastCard";
import MarketAlternativesCard from "./cards/MarketAlternativesCard";
import CostPerUseCard from "./cards/CostPerUseCard";
import TrustScoreCard from "./cards/TrustScoreCard";
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
  const [heroProducts, setHeroProducts] = useState<any[]>([]);

  useEffect(() => {
    setIsSearching(false);
    setInternalQuery("");
    
    // Only set heroProducts if it's empty, or if we did a completely new search (meaning the current data scraped name isn't in our heroProducts)
    if (heroProducts.length === 0 || !heroProducts.some(p => p.name === data.scraped_name || p.link === data.url)) {
      setHeroProducts([
        {
          name: data.scraped_name || "Produto Buscado",
          price: data.current_price,
          link: null,
          image: data.image
        },
        ...(data.market_alternatives || []).map((alt: any) => ({
          name: alt.name,
          price: alt.price,
          link: alt.link,
          image: alt.image
        }))
      ]);
    }
  }, [data]);

  const handleInternalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalQuery.trim() || !onSearch) return;
    setIsSearching(true);
    setHeroProducts([]); // Reset products on manual search
    onSearch(internalQuery);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background overflow-y-auto overflow-x-hidden pt-[104px] pb-20 transition-opacity duration-500 ${isReloading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

      {/* Ambient Glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[50vh] blur-[120px] pointer-events-none transition-colors duration-1000 opacity-40 z-0 ${
        data.is_fomo_alert ? 'bg-red-500/30' : 'bg-emerald-500/30'
      }`} />

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

      {/* Ticker Marquee */}
      <div className="fixed top-14 left-0 w-full z-[50] bg-white/50 backdrop-blur-md text-foreground text-xs py-2 overflow-hidden flex items-center border-b border-black/5 shadow-sm">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        >
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 pr-6 font-medium">
              <span className="text-foreground/80">⚡ 42 pessoas analisaram produtos parecidos hoje</span>
              <span className="text-black/10">•</span>
              {data.is_fomo_alert ? (
                <span className="text-red-600/90">🛑 Alerta de sobrepreço nas lojas detectado</span>
              ) : (
                <span className="text-emerald-600/90">🟢 Monitoramento do piso do mercado ativo</span>
              )}
              <span className="text-black/10">•</span>
              <span className="text-foreground/80">👀 Vendedores alteraram preços nas últimas 24h</span>
              <span className="text-black/10">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        
        <div className="mt-8 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-[var(--font-display)] tracking-tight mb-6 flex items-center flex-wrap gap-3">
            Inteligência de Mercado
            <span className="text-lg sm:text-xl font-medium text-muted-foreground/60 bg-black/5 px-3 py-1 rounded-full border border-black/5 tracking-normal">
              {(() => {
                const str = data.scraped_name || data.query || "produto";
                return str
                  .toLowerCase()
                  .split(/\s+/)
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              })()}
            </span>
          </h1>

          {/* Product Selection Hero Section */}
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 hide-scrollbar">
            {heroProducts.map((prod, idx) => {
              const isActive = prod.name === data.scraped_name || prod.link === data.url;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isActive && onSearch) {
                      onSearch(prod.name);
                    }
                  }}
                  className={`flex-shrink-0 w-64 text-left p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                    isActive 
                      ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-sm' 
                      : 'bg-white/60 hover:bg-white/80 border-black/5 hover:border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                        isActive ? 'bg-white border-primary/20 border shadow-sm' : 'bg-white/80 border border-black/5 shadow-sm'
                      }`}>
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          isActive ? <ShieldCheck className="w-6 h-6 text-primary" /> : <Search className="w-6 h-6 text-muted" />
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        Ativo
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 h-10">
                    {prod.name}
                  </h3>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {prod.price ? `R$ ${prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
                  </p>
                </button>
              );
            })}
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

          <div className="lg:col-span-6">
            <CostPerUseCard data={data} />
          </div>
          
          <div className="lg:col-span-6">
            <TrustScoreCard data={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
