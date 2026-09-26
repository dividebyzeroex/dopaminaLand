"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ArrowRight, X, TrendingUp } from "lucide-react";
import AnalysisDashboard from "./AnalysisDashboard";
import { trackEvent } from "@/lib/tracking";

export default function SuperSearchHero() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "result" | "error">("idle");
  const [resultData, setResultData] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "iPhone 15 Pro Max 256GB",
    "PlayStation 5 Slim 1TB",
    "Samsung Galaxy S24 Ultra",
    "Smart TV LG OLED 55\"",
    "MacBook Air M3 16GB",
  ]);

  useEffect(() => {
    fetch('/api/recent-searches')
      .then(res => res.json())
      .then(data => {
        if (data && data.searches && data.searches.length > 0) {
          setRecentSearches(data.searches);
        }
      })
      .catch(console.error);
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

      setResultData(data);

      setTimeout(() => {
        setStatus("result");
      }, 1200);

      try {
        const isUrlSearch = /^https?:\/\//.test(searchQuery);
        trackEvent("super_search", "search_executed", data.current_price, {
          query: searchQuery,
          search_type: isUrlSearch ? "url" : "text",
          current_price: data.current_price || 0,
          scraped_price: data.scraped_price || 0,
          overprice_percentage: data.overprice_percentage || 0,
          price_verdict: data.future_price_prediction?.recommendation || "unknown",
          market_alternatives_count: data.market_alternatives?.length || 0,
          store_detected: data.net_price_breakdown?.storeName || "unknown",
          has_coupon: !!data.net_price_breakdown?.suggestedCoupon,
          coupon_code: data.coupon_code || null,
          profit_margin: data.profit_margin_percentage || 0,
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
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 max-w-3xl mx-auto z-10">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center w-full relative z-20"
      >
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-display)] tracking-tight text-foreground">
            dopamina
          </h1>
          <p className="mt-2 text-sm text-muted">
            Descubra se o preço é justo.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto w-full">
          <div className="relative flex items-center bg-white rounded-2xl border border-black/10 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)] focus-within:shadow-[0_4px_30px_rgba(0,113,227,0.12)] focus-within:border-primary/30 transition-all duration-300">
            <div className="pl-5 sm:pl-6 text-muted-light">
              {status === "loading" ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={status === "loading"}
              placeholder="Pesquise um produto ou cole o link..."
              className="w-full bg-transparent text-foreground text-base sm:text-lg px-4 py-5 sm:py-6 outline-none placeholder:text-black/25 tracking-tight"
            />

            <div className="pr-3">
              <button
                type="submit"
                disabled={!query.trim() || status === "loading"}
                className="bg-primary hover:bg-primary-light text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Analisar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8"
            >
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-64 h-1 bg-surface-lighter rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-sm text-muted">
                  Analisando preço...
                </span>
              </div>
            </motion.div>
          )}
          
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-danger text-sm border border-danger/15 bg-danger/5 py-3 px-5 rounded-xl inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Não encontramos este produto. Tente outro termo ou link.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trending Chips */}
        {status === "idle" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-10 sm:mt-14 w-full max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-muted-light" />
              <span className="text-xs text-muted tracking-wide">
                Pesquisas populares
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {recentSearches.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(undefined, item)}
                  className="bg-surface-light hover:bg-surface-lighter border border-black/[0.04] hover:border-black/10 px-4 py-2.5 rounded-full text-sm text-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95"
                >
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
