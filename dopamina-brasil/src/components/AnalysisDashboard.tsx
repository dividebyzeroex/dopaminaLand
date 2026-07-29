"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import DopaminaTerminal from "./DopaminaTerminal";
import PricePredator from "./PricePredator";
import ForensicReplay from "./ForensicReplay";
import ProductFlawScanner from "./ProductFlawScanner";
import LivePriceSeismograph from "./LivePriceSeismograph";
import PriceWarArena from "./PriceWarArena";
import NeuralNetworkVisualizer from "./NeuralNetworkVisualizer";
import ProfitMarginXRay from "./ProfitMarginXRay";
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
  const isFair = !data.is_fomo_alert;

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
        
        {/* Product Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="w-full">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold font-[var(--font-display)] text-foreground leading-tight break-words">
              {data.scraped_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-sm">
              <span className="text-muted">Preço encontrado:</span>
              <span className="text-foreground font-semibold text-lg">R$ {data.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              
              {isFair ? (
                <span className="flex items-center gap-1.5 text-accent bg-accent/8 px-3 py-1 rounded-full text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Preço Justo
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-danger bg-danger/8 px-3 py-1 rounded-full text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sobrepreço de {data.overpriced_percent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart Row */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <DopaminaTerminal data={data} />
            <ProfitMarginXRay data={data} />
          </div>
          
          {/* Side Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <PricePredator data={data} />
            <NeuralNetworkVisualizer data={data} />
          </div>

          {/* Second Row */}
          <div className="lg:col-span-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Replay de Preços
              </h2>
              <p className="text-xs text-muted mt-0.5">Evolução temporal do preço</p>
            </div>
            <ForensicReplay data={data} />
          </div>

          <div className="lg:col-span-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Volatilidade de Preço
              </h2>
              <p className="text-xs text-muted mt-0.5">Variações detectadas no mercado</p>
            </div>
            <LivePriceSeismograph data={data} />
          </div>

          {/* Third Row */}
          <div className="lg:col-span-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Análise de Defeitos
              </h2>
              <p className="text-xs text-muted mt-0.5">Dados de fóruns e avaliações</p>
            </div>
            <ProductFlawScanner data={data} />
          </div>

          <div className="lg:col-span-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Comparativo de Preços
              </h2>
              <p className="text-xs text-muted mt-0.5">Custo real entre lojas</p>
            </div>
            <PriceWarArena data={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
