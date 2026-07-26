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
      {/* Contextual Floating Speech Balloon Popover Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="absolute bottom-[calc(100%+14px)] left-0 right-0 z-50 w-full bg-[#0d0d12] border-2 border-[#22c55e] rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(34,197,94,0.3)] text-white space-y-3 font-inter backdrop-blur-2xl"
      >
        {/* Speech Bubble Tail pointing down to the clicked button */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0d0d12] border-r-2 border-b-2 border-[#22c55e] rotate-45 z-10" />

        {/* Balloon Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="p-1 rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-white truncate max-w-[200px]">
              {productName}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
            <p className="text-[11px] font-mono text-gray-300">
              Auditando no Buscapé...
            </p>
          </div>
        ) : data ? (
          <div className="space-y-2.5">
            {/* Status Pill */}
            <div
              className={`p-2 rounded-xl border flex items-center justify-between text-[11px] font-extrabold ${
                data.is_fomo_alert
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {data.is_fomo_alert ? <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{data.is_fomo_alert ? "SOBREPREÇO DETECTADO" : "OFERTA NO PISO"}</span>
              </div>
              {data.savings > 0 && (
                <span className="bg-[#22c55e] text-black px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">
                  -{formatBRL(data.savings)}
                </span>
              )}
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-2 gap-2 bg-black/60 border border-white/10 p-2.5 rounded-lg text-[11px]">
              <div>
                <span className="text-[9px] text-gray-400 block truncate">Preço ({store})</span>
                <span className="font-bold text-red-400 font-mono">
                  {formatBRL(data.current_price)}
                </span>
              </div>
              <div className="border-l border-white/10 pl-2">
                <span className="text-[9px] text-[#22c55e] font-semibold block truncate">Piso Buscapé</span>
                <span className="font-black text-[#22c55e] font-mono">
                  {formatBRL(data.scraped_price)}
                </span>
              </div>
            </div>

            {/* Ultra-Compact Dynamic Price Chart */}
            <BlackFraudeChart
              storePrice={data.current_price}
              marketLowest={data.scraped_price}
              productName={productName}
              priceHistory={data.price_history}
            />

            {/* Action Footer */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[9px] text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                Synced Insights
              </span>

              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#22c55e] text-black font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-white transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Ver Menor Preço</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-gray-400">
            Não foi possível obter dados.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
