"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Brain, ShieldAlert, AlertTriangle, TrendingUp, Search } from "lucide-react";

interface InsightsTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightsTelemetryModal({ isOpen, onClose }: InsightsTelemetryModalProps) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/insights-summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTelemetry(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-inter"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0b0b10] border-2 border-orange-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(249,115,22,0.25)] text-white space-y-5 font-inter backdrop-blur-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest block font-mono">
                  Market Intelligence (Live)
                </span>
                <h3 className="text-lg font-black font-outfit text-white">
                  Telemetria de Mercado
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-gray-400">Capturando telemetria de auditorias e dados PostHog...</p>
            </div>
          ) : telemetry ? (
            <div className="space-y-5 text-xs relative z-10">
              
              {/* Highlight Row 1: AI Model Specs & Neural Impact */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-orange-950/30 border border-cyan-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold uppercase border border-cyan-500/30 w-fit">
                    <Brain className="w-3.5 h-3.5" />
                    MECANISMO {telemetry.neural_model?.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#22c55e] font-bold">
                    ACURÁCIA (PREÇO JUSTO): {telemetry.neural_model?.accuracy_percentage}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5" /> Total de Auditorias (Hoje)
                    </span>
                    <strong className="text-cyan-400 font-black text-xl">{telemetry.neural_model?.total_audits_today}</strong>
                  </div>
                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Sobrepreço Médio Detectado
                    </span>
                    <strong className="text-orange-400 font-black text-xl">{telemetry.neural_model?.average_overprice_detected}</strong>
                  </div>
                </div>
              </div>

              {/* Highlight Row 2: Live Trends */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Auditorias em Alta no Mercado (Ao Vivo)
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  {telemetry.market_intelligence?.trending_audits?.map((audit: string, idx: number) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-mono text-[11px] hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
                      {idx + 1}. {audit}
                    </div>
                  ))}
                  {(!telemetry.market_intelligence?.trending_audits || telemetry.market_intelligence.trending_audits.length === 0) && (
                    <div className="text-gray-500 font-mono italic">Buscando tendências...</div>
                  )}
                </div>
              </div>

              {/* Highlight Row 3: Dark Patterns & Flaws */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-3">
                  <span className="text-[10px] font-bold text-red-400 block uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Padrões Sombrios Mais Usados Hoje
                  </span>
                  <div className="space-y-2">
                    {telemetry.market_intelligence?.top_dark_patterns?.map((dp: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-red-500/10">
                        <span className="text-gray-300 font-mono">{dp.pattern}</span>
                        <span className="text-red-400 font-bold">{dp.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 space-y-3 flex flex-col justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-black text-orange-400 block mb-1">
                      {telemetry.market_intelligence?.top_hidden_flaws_scanned}
                    </span>
                    <span className="text-[10px] font-bold text-orange-300/80 uppercase tracking-wider font-mono block">
                      Defeitos Ocultos Encontrados no Reddit Hoje
                    </span>
                  </div>
                  <div className="mt-2 text-center text-gray-400 font-mono text-[10px]">
                    Sentimento Global do Mercado: <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">{telemetry.market_intelligence?.market_sentiment}</strong>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
