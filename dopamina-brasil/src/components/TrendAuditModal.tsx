"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, CheckCircle, ExternalLink, Loader2, Zap, AlertTriangle, Brain, Clock, Scale, Truck, MessageSquare } from "lucide-react";
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
  const [activeSubTab, setActiveSubTab] = useState<"chart" | "reviews" | "netprice" | "predict" | "cost">("chart");

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
          className="relative w-full max-w-lg bg-[#0e0e14]/95 border border-[#22c55e]/30 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(34,197,94,0.15)] text-white space-y-3.5 font-inter backdrop-blur-2xl overflow-hidden"
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
                  BALÃO DE AUDITORIA (5 MOTORES)
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
                Processando 5 vetores de inteligência...
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

              {/* 5 Engine Sub-Tab Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold border-b border-white/10 scrollbar-none">
                <button
                  onClick={() => setActiveSubTab("chart")}
                  className={`px-2 py-1 rounded transition-all whitespace-nowrap ${
                    activeSubTab === "chart" ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30" : "text-gray-400 hover:text-white"
                  }`}
                >
                  📈 Histórico
                </button>
                <button
                  onClick={() => setActiveSubTab("reviews")}
                  className={`px-2 py-1 rounded transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === "reviews" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Brain className="w-2.5 h-2.5" />
                  <span>Reviews ({data.review_authenticity?.score}% Real)</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("netprice")}
                  className={`px-2 py-1 rounded transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === "netprice" ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Preço Líquido</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("predict")}
                  className={`px-2 py-1 rounded transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === "predict" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>Radar Futuro</span>
                </button>
              </div>

              {/* Dynamic Content */}
              {activeSubTab === "chart" && (
                <BlackFraudeChart
                  storePrice={data.current_price}
                  marketLowest={data.scraped_price}
                  productName={productName}
                  priceHistory={data.price_history}
                />
              )}

              {activeSubTab === "reviews" && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1 text-xs">
                  <span className="text-purple-300 font-bold block">Autenticidade de Comentários: {data.review_authenticity?.score}% Real</span>
                  <p className="text-[11px] text-gray-300">{data.review_authenticity?.realSummary}</p>
                </div>
              )}

              {activeSubTab === "netprice" && (
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 block">Cupom Sugerido</span>
                    <span className="font-bold font-mono text-amber-400">{data.net_price_breakdown?.suggestedCoupon}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#22c55e] block font-bold">Valor Mínimo Líquido</span>
                    <span className="font-black font-mono text-[#22c55e]">{formatBRL(data.net_price_breakdown?.finalNetPrice || 0)}</span>
                  </div>
                </div>
              )}

              {activeSubTab === "predict" && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
                  <span className="text-amber-400 font-bold block uppercase tracking-wider text-[10px]">
                    {data.future_price_prediction?.recommendation}
                  </span>
                  <p className="text-[11px] text-gray-300">{data.future_price_prediction?.reason}</p>
                </div>
              )}

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
