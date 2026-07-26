"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Zap, ArrowRight, Store, ShieldAlert } from "lucide-react";

interface TrendItem {
  id: string;
  keyword: string;
  name: string;
  store: string;
  category: string;
  surge: string;
  estimatedPrice: number;
  marketLowest: number;
  overpricedPercent: number;
}

interface TrendingProductsShowcaseProps {
  onSelectTrend?: (keyword: string) => void;
}

export default function TrendingProductsShowcase({ onSelectTrend }: TrendingProductsShowcaseProps) {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending-products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.trends)) {
          setTrends(data.trends);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (loading) {
    return (
      <div className="w-full py-8 text-center space-y-2">
        <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs text-gray-400 font-mono">Conectando às APIs de Tendência dos Players...</span>
      </div>
    );
  }

  if (trends.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto my-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 fill-current animate-bounce text-orange-400" />
            MERCADO LIVRE & BUSCAPÉ TRENDS LIVE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
            Os Mais Buscados do Brasil Hoje
          </h2>
        </div>
        <span className="text-xs text-gray-400 max-w-xs text-right hidden sm:block">
          Toque em qualquer item para executar uma auditoria de preço instantânea.
        </span>
      </div>

      {/* Live Trends Ticker */}
      <div className="w-full border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-xl overflow-hidden py-2.5 px-4 relative">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="whitespace-nowrap flex items-center gap-8 text-xs font-mono font-bold text-gray-300"
        >
          {[...trends, ...trends].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-[#22c55e]">⚡</span>
              <strong className="text-white">{item.name}</strong>
              <span className="text-orange-400 font-bold">{item.surge}</span>
              <span className="text-gray-600">●</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((item, index) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-5 rounded-2xl bg-[#0a0a0f]/90 border border-white/10 hover:border-[#22c55e]/40 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                  #{index + 1} MAIS BUSCADO
                </span>
                <span className="text-[10px] font-bold text-orange-400 font-mono flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  {item.surge}
                </span>
              </div>

              {/* Product Info */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="text-base font-bold font-outfit text-white group-hover:text-[#22c55e] transition-colors truncate">
                  {item.name}
                </h3>
              </div>

              {/* Store & Price Breakdown */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Store className="w-3 h-3 text-purple-400" />
                    <span>Loja de Origem:</span>
                  </span>
                  <strong className="text-white">{item.store}</strong>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-gray-400 block">Preço Estimado</span>
                    <span className="font-bold text-red-400 font-mono">{formatBRL(item.estimatedPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#22c55e] block font-bold">Piso Buscapé</span>
                    <span className="font-black text-[#22c55e] font-mono">{formatBRL(item.marketLowest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit CTA Button */}
            <button
              onClick={() => onSelectTrend && onSelectTrend(item.keyword)}
              className="w-full py-3 bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span>Auditar Preço Deste Item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
