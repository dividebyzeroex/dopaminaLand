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
    <div className={`fixed inset-0 z-50 bg-[#050508] overflow-y-auto overflow-x-hidden pt-24 pb-24 transition-opacity duration-500 ${isReloading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-black/80 backdrop-blur-xl border-b border-[#1a1a2e]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo */}
          <button onClick={onReset} className="group flex shrink-0 items-center gap-2">
            <span className="text-xl sm:text-2xl transition-transform group-hover:rotate-12 group-hover:scale-110">⚡</span>
            <span className="hidden md:inline font-[var(--font-display)] text-xl font-extrabold tracking-tight text-white animate-neon-flicker">
              dopaminado
            </span>
          </button>

          {/* Real Search Input */}
          <div className="flex-1 max-w-2xl mx-auto w-full">
            <form onSubmit={handleInternalSearch} className="relative flex items-center">
              <div className="absolute left-3 text-cyan-500">
                {isReloading || isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </div>
              <input 
                type="text"
                value={internalQuery}
                onChange={(e) => setInternalQuery(e.target.value)}
                disabled={isReloading || isSearching}
                placeholder="Ex: iPhone 15 Pro Max ou Amazon Link"
                className="w-full bg-[#111122]/50 border border-cyan-500/30 rounded-full py-2 pl-9 pr-4 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:bg-[#111122] focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
              />
            </form>
          </div>

          <div className="w-6 md:w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Product Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="w-full">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black font-outfit text-white leading-tight break-words">
              {data.scraped_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 font-mono text-xs sm:text-sm">
              <span className="text-gray-400 whitespace-nowrap">Preço Encontrado:</span>
              <span className="text-white font-bold text-base sm:text-lg whitespace-nowrap">R$ {data.current_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              
              {isFair ? (
                <span className="flex items-center gap-1 text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> PREÇO JUSTO
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded whitespace-nowrap">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> SOBREPREÇO: {data.overpriced_percent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* WOW Features Grid */}
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
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-500 to-red-500/0" />
              <div>
                <h2 className="text-lg font-black font-outfit text-white uppercase tracking-wider">
                  Forensic Replay
                </h2>
                <p className="text-[11px] text-gray-500 font-mono">TIMELAPSE DE MANIPULAÇÃO</p>
              </div>
            </div>
            <ForensicReplay data={data} />
          </div>

          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-500 to-amber-500/0" />
              <div>
                <h2 className="text-lg font-black font-outfit text-white uppercase tracking-wider">
                  Sismógrafo de Preços
                </h2>
                <p className="text-[11px] text-gray-500 font-mono">EARTHQUAKES AO VIVO</p>
              </div>
            </div>
            <LivePriceSeismograph data={data} />
          </div>

          {/* Third Row */}
          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-red-500 to-red-500/0" />
              <div>
                <h2 className="text-lg font-black font-outfit text-white uppercase tracking-wider">
                  Raio-X de Defeitos
                </h2>
                <p className="text-[11px] text-gray-500 font-mono">DADOS DE FÓRUNS E RECLAMEAQUI</p>
              </div>
            </div>
            <ProductFlawScanner data={data} />
          </div>

          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-purple-500/0" />
              <div>
                <h2 className="text-lg font-black font-outfit text-white uppercase tracking-wider">
                  Price War Arena
                </h2>
                <p className="text-[11px] text-gray-500 font-mono">CUSTO REAL TOTAL</p>
              </div>
            </div>
            <PriceWarArena data={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
