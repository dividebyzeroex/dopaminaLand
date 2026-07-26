"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, CheckCircle, ExternalLink, Loader2, Zap, AlertTriangle, MessageSquare } from "lucide-react";
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
        {/* Floating Speech Bubble Card (prevents click propagate to backdrop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#0d0d12]/95 border-2 border-[#22c55e] rounded-[24px] p-5 shadow-[0_0_50px_rgba(34,197,94,0.3)] text-white space-y-3 font-inter backdrop-blur-2xl overflow-hidden"
        >
          {/* Speech Bubble Decorative Tail */}
          <div className="absolute -bottom-3 left-16 w-6 h-6 bg-[#0d0d12] border-r-2 border-b-2 border-[#22c55e] rotate-45 pointer-events-none hidden sm:block" />

          {/* Balloon Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="p-1.5 rounded-lg bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-widest block">
                  BALÃO DE AUDITORIA DE PREÇO
                </span>
                <h3 className="text-sm font-bold font-outfit text-white truncate max-w-[280px]">
                  {productName}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
              <p className="text-xs font-mono text-gray-300">
                Consultando scraper ao vivo no Buscapé...
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
                  <span className="truncate">{data.is_fomo_alert ? "SOBREPREÇO DETECTADO" : "OFERTA NO PISO DE MERCADO"}</span>
                </div>
                {data.savings > 0 && (
                  <span className="bg-[#22c55e] text-black px-2 py-0.5 rounded-full text-[10px] font-black shrink-0">
                    -{formatBRL(data.savings)}
                  </span>
                )}
              </div>

              {/* Price Breakdown Inline Strip */}
              <div className="grid grid-cols-2 gap-2 bg-black/60 border border-white/10 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block truncate">Preço ({store})</span>
                  <span className="font-bold text-red-400 font-mono text-sm">
                    {formatBRL(data.current_price)}
                  </span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-[10px] text-[#22c55e] font-semibold block truncate">Piso Buscapé</span>
                  <span className="font-black text-[#22c55e] font-mono text-sm">
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
              <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Synced Insights
                </span>

                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <span>Ver Oferta Mais Barata</span>
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
