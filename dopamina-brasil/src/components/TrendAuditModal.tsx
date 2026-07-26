"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, CheckCircle, ExternalLink, Loader2, Zap, AlertTriangle, MessageSquare } from "lucide-react";
import BlackFraudeChart from "@/components/BlackFraudeChart";
import { trackEvent } from "@/lib/tracking";
import { H53NeuralEngine } from "@/lib/H53NeuralEngine";

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
          // Silent Edge AI Neural Inference
          const neuralResult = H53NeuralEngine.predict(resData.current_price, resData.scraped_price);

          setData({
            ...resData,
            scraped_price: neuralResult.fairValuePrice,
            savings: Math.max(0, resData.current_price - neuralResult.fairValuePrice),
            is_fomo_alert: resData.current_price > neuralResult.fairValuePrice,
          });

          // Telemetry
          try {
            trackEvent("dark_pattern_audit", store, estimatedPrice, {
              source: "speech_balloon_silent_ai",
              keyword,
              product_name: productName,
              fair_value_neural: neuralResult.fairValuePrice,
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
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-inter"
        onClick={onClose}
      >
        {/* Floating Speech Bubble Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0e0e14]/95 border border-[#22c55e]/30 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(34,197,94,0.15)] text-white space-y-3.5 backdrop-blur-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Balloon Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shrink-0">
                <MessageSquare className="w-4 h-4 fill-current" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-widest block font-mono">
                  AUDITORIA DE PREÇO AO VIVO
                </span>
                <h3 className="text-sm font-black font-outfit text-white truncate max-w-[260px] sm:max-w-[320px]">
                  {productName}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-7 h-7 text-[#22c55e] animate-spin" />
              <p className="text-xs font-mono text-gray-300">
                Consultando cotação em tempo real...
              </p>
            </div>
          ) : data ? (
            <div className="space-y-3">
              {/* Alert Status Pill */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-black ${
                  data.is_fomo_alert
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {data.is_fomo_alert ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{data.is_fomo_alert ? "ALERTA DE SOBREPREÇO" : "OFERTA NO PISO DE MERCADO"}</span>
                </div>
                {data.savings > 0 && (
                  <span className="bg-[#22c55e] text-black px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
                    -{formatBRL(data.savings)}
                  </span>
                )}
              </div>

              {/* Price Breakdown Strip */}
              <div className="grid grid-cols-2 gap-2 bg-black/60 border border-white/10 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] text-gray-400 block truncate">Preço ({store})</span>
                  <span className="font-bold text-red-400 font-mono text-sm">
                    {formatBRL(data.current_price)}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-[9px] text-[#22c55e] font-semibold block truncate">Piso de Mercado</span>
                  <span className="font-black text-[#22c55e] font-mono text-sm">
                    {formatBRL(data.scraped_price)}
                  </span>
                </div>
              </div>

              {/* Dynamic Price Chart */}
              <BlackFraudeChart
                storePrice={data.current_price}
                marketLowest={data.scraped_price}
                productName={productName}
                priceHistory={data.price_history}
              />

              {/* Bottom Action Footer */}
              <div className="pt-2 flex items-center justify-between gap-2 text-xs border-t border-white/10">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  Synced Insights
                </span>

                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <span>Ver Oferta</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-400">
              Não foi possível obter dados para este item no momento.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
