"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, ScanLine, X, Activity } from "lucide-react";
import { H53NeuralEngine } from "@/lib/H53NeuralEngine";
import AnalysisDashboard from "./AnalysisDashboard";
import { trackEvent } from "@/lib/tracking";

export default function SuperSearchHero() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [resultData, setResultData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) return;

    setStatus("loading");
    setQuery(searchQuery);

    try {
      const isUrl = searchQuery.startsWith("http");
      const apiUrl = isUrl
        ? `/api/price-history?url=${encodeURIComponent(searchQuery)}`
        : `/api/price-history?q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data.success) {
        setStatus("error");
        return;
      }

      // Edge AI Inference
      const neuralPrediction = H53NeuralEngine.predict(data.current_price, data.scraped_price);

      setResultData({
        ...data,
        neuralPrediction
      });

      // Artificial delay for WOW effect
      setTimeout(() => {
        setStatus("result");
      }, 1500);

      try {
        const isUrlSearch = /^https?:\/\//.test(searchQuery);
        trackEvent("super_search", "search_executed", data.current_price, {
          query: searchQuery,
          search_type: isUrlSearch ? "url" : "text",
          current_price: data.current_price || 0,
          scraped_price: data.scraped_price || 0,
          overprice_percentage: data.overprice_percentage || 0,
          price_verdict: data.price_verdict || "unknown",
          flaws_count: data.product_flaws?.length || 0,
          store_detected: data.store_name || "unknown",
          has_coupon: !!data.coupon_code,
          coupon_code: data.coupon_code || null,
          profit_margin: data.profit_margin_percentage || 0,
          neural_confidence: neuralPrediction?.confidence || 0,
        });
      } catch (err) {}
    } catch (e) {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setQuery("");
    setResultData(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if ((status === "result" || status === "loading") && resultData) {
    return (
      <AnalysisDashboard 
        data={resultData} 
        onReset={handleReset} 
        onSearch={(q) => handleSearch(undefined, q)}
        isReloading={status === "loading"}
      />
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 max-w-5xl mx-auto z-10">
      
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] opacity-60 mix-blend-screen animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full relative z-20"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400 mb-6 backdrop-blur-md opacity-80">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>MOTOR DE INFERÊNCIA H53™ ATIVADO</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tighter text-white mb-6 leading-[1]">
          Audite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">qualquer preço.</span>
        </h1>
        
        <p className="text-gray-500 text-sm sm:text-base font-mono max-w-xl mx-auto mb-10">
          Cole o link do e-commerce ou digite o nome do produto.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-5xl mx-auto w-full group mt-4">
          {/* Animated Glow Behind Search Bar */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />
          
          <div className="relative flex items-center bg-[#030308]/90 backdrop-blur-3xl border-2 border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.1)] focus-within:border-cyan-400/60 focus-within:shadow-[0_0_100px_rgba(6,182,212,0.25)] transition-all duration-500 group-hover:border-cyan-500/40">
            <div className="pl-6 sm:pl-8 text-cyan-500">
              {status === "loading" ? (
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
              ) : (
                <Search className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={status === "loading"}
              placeholder="Ex: https://amazon.com.br/dp/... ou 'RTX 4090'"
              className="w-full bg-transparent text-white text-xl sm:text-3xl px-6 py-8 sm:py-10 outline-none placeholder:text-gray-700 font-mono tracking-tight"
            />

            <div className="pr-3 sm:pr-4">
              <button
                type="submit"
                disabled={!query.trim() || status === "loading"}
                className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black font-outfit text-lg sm:text-2xl uppercase tracking-widest px-8 sm:px-14 py-4 sm:py-6 rounded-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]"
              >
                {/* Shine effect on button */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                
                <span className="relative z-10 flex items-center gap-3">
                  {status === "loading" ? (
                    <>
                      <ScanLine className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                      <span className="hidden sm:inline">DECODIFICANDO...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                      <span className="hidden sm:inline">AUDITAR AGORA</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10"
            >
              <div className="inline-flex flex-col items-center gap-4 bg-[#080810]/80 p-6 rounded-2xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-mono text-cyan-400 uppercase tracking-widest font-black animate-pulse">
                    INVASÃO DE SISTEMA INICIADA...
                  </span>
                </div>
                
                <div className="w-full max-w-md h-1.5 bg-[#111122] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
                
                <div className="flex flex-col text-center mt-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Extraindo metadados ocultos do DOM</span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Bypassando bloqueios de precificação dinâmica</span>
                  <span className="text-[10px] font-mono text-cyan-500 font-bold uppercase animate-pulse">Aplicando Inferência Neural H53™</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-red-400 font-mono text-sm border border-red-500/20 bg-red-500/10 py-3 px-6 rounded-lg inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Falha ao analisar o produto. Tente usar termos mais genéricos ou outro link.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trending Searches */}
        {status === "idle" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-10 sm:mt-16 w-full max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">
                Auditorias em Alta no H53™
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                "iPhone 15 Pro Max 256GB",
                "PlayStation 5 Slim 1TB",
                "Samsung Galaxy S24 Ultra",
                "Smart TV LG OLED 55\"",
                "MacBook Air M3 16GB",
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(undefined, item)}
                  className="no-invert bg-[#111122]/80 hover:bg-[#111122] backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-cyan-50 hover:text-cyan-300 transition-all flex items-center gap-2 group shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Search className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:text-cyan-300 transition-all" />
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
