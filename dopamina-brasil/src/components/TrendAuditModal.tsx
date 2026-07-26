"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, CheckCircle, ExternalLink, Loader2, Zap, AlertTriangle, TrendingDown } from "lucide-react";
import BlackFraudeChart from "@/components/BlackFraudeChart";
import { trackEvent } from "@/lib/tracking";

interface TrendAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  productName: string;
  store: string;
  estimatedPrice: number;
}

export default function TrendAuditModal({
  isOpen,
  onClose,
  keyword,
  productName,
  store,
  estimatedPrice,
}: TrendAuditModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !keyword) return;

    setLoading(true);
    fetch(`/api/price-history?q=${encodeURIComponent(keyword)}&storePrice=${estimatedPrice}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
          try {
            trackEvent("dark_pattern_audit", store, estimatedPrice, {
              source: "speech_balloon_audit",
              keyword,
              product_name: productName,
              market_lowest: resData.scraped_price,
            });
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, keyword, store, estimatedPrice, productName]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Floating Speech Bubble Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0e0e14]/95 border border-[#22c55e]/30 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(34,197,94,0.15)] text-white space-y-4 font-inter backdrop-blur-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Balloon Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-widest block font-mono">
                  DOPAMINA ENGINE AUDIT
                </span>
                <h3 className="text-base font-black font-outfit text-white truncate max-w-[260px] sm:max-w-[320px]">
                  {productName}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
              <p className="text-xs font-mono text-gray-300">
                Auditando cotação em tempo real no Buscapé...
              </p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Alert Status Pill */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-black ${
                  data.is_fomo_alert
                    ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {data.is_fomo_alert ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{data.is_fomo_alert ? "ALERTA DE PREÇO ELEVADO NA LOJA" : "OFERTA DENTRO DO PISO DE MERCADO"}</span>
                </div>
                {data.savings > 0 && (
                  <span className="bg-[#22c55e] text-black px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0">
                    -{formatBRL(data.savings)}
                  </span>
                )}
              </div>

              {/* Price Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 bg-black/50 border border-white/10 p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Preço na Loja ({store})</span>
                  <span className="font-black text-red-400 font-mono text-base">
                    {formatBRL(data.current_price)}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-3.5">
                  <span className="text-[10px] text-[#22c55e] font-semibold block">Piso Real (Buscapé)</span>
                  <span className="font-black text-[#22c55e] font-mono text-base">
                    {formatBRL(data.scraped_price)}
                  </span>
                </div>
              </div>

              {/* Compact Dynamic Month Price Chart */}
              <BlackFraudeChart
                storePrice={data.current_price}
                marketLowest={data.scraped_price}
                productName={productName}
                priceHistory={data.price_history}
              />

              {/* Bottom Action Footer */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Sincronizado com o Insights
                </span>

                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                >
                  <span>Ver Oferta Mais Barata</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-400">
              Não foi possível obter dados para este item no momento.
            </div>
          )}

          {/* Seamless Integrated Speech Balloon Tail */}
          <div className="absolute -bottom-2.5 left-12 w-5 h-5 bg-[#0e0e14] border-r border-b border-[#22c55e]/30 rotate-45 hidden sm:block pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
