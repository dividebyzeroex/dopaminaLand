"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertTriangle, ArrowRight, Zap, ShieldAlert, ExternalLink, CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import BlackFraudeChart from "@/components/BlackFraudeChart";

export default function LiveWebAnalyzer() {
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [resultData, setResultData] = useState<any>(null);
  const [showChart, setShowChart] = useState(false);

  const demoLinks = [
    { label: "🍎 iPhone 17", url: "https://site.fastshop.com.br/iphone-17-apple--256gb--preto--tela-de-6-3---5g-e-c", query: "iPhone 17 Apple" },
    { label: "🎮 RTX 4090", url: "https://www.amazon.com.br/dp/B0BJGFVJMB", query: "RTX 4090" },
    { label: "👟 Nike Air Max", url: "https://www.mercadolivre.com.br/nike-air-max", query: "Nike Air Max 90" },
  ];

  const handleAnalyze = async (inputUrl: string, customQuery?: string) => {
    if (!inputUrl.trim()) return;

    setStatus("loading");
    setUrlInput(inputUrl);

    try {
      const apiUrl = customQuery
        ? `/api/price-history?q=${encodeURIComponent(customQuery)}`
        : `/api/price-history?url=${encodeURIComponent(inputUrl)}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.success) {
        setStatus("error");
        return;
      }

      setResultData({
        scrapedName: data.scraped_name || "Produto Auditado",
        storePrice: data.current_price,
        marketLowest: data.scraped_price,
        overpricedPercent: data.overpriced_percent,
        savings: data.savings,
        bestDealUrl: data.url,
        isFomoAlert: data.is_fomo_alert,
        message: data.message,
        priceHistory: data.price_history || [],
        detectedTriggers: data.detected_triggers || [],
      });
      setStatus("result");

      // Send telemetry to Insights Dashboard
      try {
        let storeName = "E-COMMERCE";
        if (inputUrl.includes("fastshop")) storeName = "FAST SHOP";
        else if (inputUrl.includes("amazon")) storeName = "AMAZON BRASIL";
        else if (inputUrl.includes("mercadolivre")) storeName = "MERCADO LIVRE";
        else if (inputUrl.includes("shopee")) storeName = "SHOPEE";
        else if (inputUrl.includes("magazineluiza") || inputUrl.includes("magalu")) storeName = "MAGALU";

        trackEvent("dark_pattern_audit", storeName, data.current_price || 0, {
          source: "home_web_analyzer",
          url: inputUrl,
          store_name: storeName,
          scraped_name: data.scraped_name,
          scraped_price: data.scraped_price,
          overpriced_percent: data.overpriced_percent,
          savings: data.savings,
          triggers_count: (data.detected_triggers || []).length,
        });
      } catch (err) {}
    } catch (e) {
      setStatus("error");
    }
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="w-full max-w-4xl mx-auto my-3">
      <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#22c55e]/30 via-[#f97316]/30 to-[#a855f7]/30 backdrop-blur-xl shadow-xl">
        <div className="bg-[#111116]/95 rounded-[15px] p-4 sm:p-5 border border-white/10 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-black font-outfit text-white uppercase tracking-wide text-xs sm:text-sm">
                  Analisador de Preços ao Vivo
                </h3>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#22c55e] px-2.5 py-0.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              BUSCAPÉ SYNC LIVE
            </span>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAnalyze(urlInput);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      required
                      placeholder="Cole o link do produto (Fast Shop, Amazon, Mercado Livre...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors text-xs font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
                  >
                    <span>Analisar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick Demo Links */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    Testes rápidos:
                  </span>
                  <div className="flex gap-1.5">
                    {demoLinks.map((demo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnalyze(demo.url, demo.query)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>{demo.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 flex flex-col items-center justify-center text-center space-y-2"
              >
                <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
                <p className="text-xs font-bold text-white">Consultando scraper ao vivo no Buscapé...</p>
              </motion.div>
            )}

            {status === "result" && resultData && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                {/* Ultra-Compact Main Result Card */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {resultData.isFomoAlert ? (
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-[#22c55e] shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-white truncate">{resultData.scrapedName}</h4>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                      resultData.isFomoAlert ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                    }`}>
                      {resultData.isFomoAlert ? `+${resultData.overpricedPercent}% MAIS CARO` : "PREÇO JUSTO"}
                    </span>
                  </div>

                  {/* Inline Price Comparison Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 border border-white/5 p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Preço na Loja</span>
                        <span className="font-bold text-red-400 font-mono">{formatBRL(resultData.storePrice)}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-white/10" />
                      <div>
                        <span className="text-[10px] text-[#22c55e] font-semibold block">Piso Buscapé</span>
                        <span className="font-black text-[#22c55e] font-mono">{formatBRL(resultData.marketLowest)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {resultData.savings > 0 && (
                        <span className="text-xs font-black text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded">
                          Economia: {formatBRL(resultData.savings)}
                        </span>
                      )}
                      <a
                        href={resultData.bestDealUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#22c55e] text-black font-black text-[10px] uppercase rounded-lg hover:bg-white transition-colors flex items-center gap-1"
                      >
                        <span>Ver Oferta</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Compact Trigger Tags */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <div className="flex items-center gap-1 overflow-x-auto truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Gatilhos: Ancoragem Inflada · Falsa Escassez</span>
                    </div>

                    <button
                      onClick={() => setShowChart(!showChart)}
                      className="text-[#22c55e] font-bold underline shrink-0 ml-2"
                    >
                      {showChart ? "Ocultar Gráfico" : "Ver Gráfico Temporal 📈"}
                    </button>
                  </div>
                </div>

                {/* Collapsible Sleek Chart */}
                {showChart && (
                  <BlackFraudeChart
                    storePrice={resultData.storePrice}
                    marketLowest={resultData.marketLowest}
                    productName={resultData.scrapedName}
                    priceHistory={resultData.priceHistory}
                  />
                )}

                {/* Reset button */}
                <div className="text-right">
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-[11px] text-gray-400 hover:text-white underline font-semibold"
                  >
                    Analisar outro produto ↺
                  </button>
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-4 text-center space-y-2 text-xs"
              >
                <p className="text-gray-300">Falha temporária ao conectar ao Buscapé.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-4 py-1.5 bg-white/10 text-white font-bold rounded-lg"
                >
                  Tentar Novamente
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
