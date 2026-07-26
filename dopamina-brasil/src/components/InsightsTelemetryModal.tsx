"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Zap, Brain, ShieldAlert, CheckCircle, Flame, Store, Clock, Award, Sparkles } from "lucide-react";

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

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

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
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest block font-mono">
                  H53 DATA AGENCY · LIVE TELEMETRY DASHBOARD
                </span>
                <h3 className="text-lg font-black font-outfit text-white">
                  Insights Capturados & Telemetria IA ao Vivo
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
              <p className="text-xs font-mono text-gray-400">Compilando estatísticas de telemetria capturada...</p>
            </div>
          ) : telemetry ? (
            <div className="space-y-5 text-xs">
              
              {/* Highlight Row 1: AI Model Specs & Neural Impact */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-black to-purple-950/30 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold uppercase border border-cyan-500/30">
                    <Brain className="w-3.5 h-3.5" />
                    MODELO NEURAL {telemetry.neural_model?.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#22c55e] font-bold">
                    ACURÁCIA VERIFICADA: {telemetry.neural_model?.accuracy_percentage}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-400 block">Base de Treinamento</span>
                    <strong className="text-white font-mono text-xs">{telemetry.neural_model?.trained_dataset_volume}</strong>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-gray-400 block">Auditorias IA Hoje</span>
                    <strong className="text-cyan-400 font-mono text-xs">+{telemetry.neural_model?.total_inferences_today} itens</strong>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-gray-400 block">Economia Gerada</span>
                    <strong className="text-[#22c55e] font-mono text-xs">{formatBRL(telemetry.neural_model?.total_savings_generated_brl || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Highlight Row 2: Vector Engine Captures */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Métricas dos 5 Motores de Inteligência Capturados
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[9px] text-purple-300 block">Reviews Bots Barrados</span>
                    <strong className="text-purple-400 text-sm">{telemetry.vector_engines_captured?.bot_reviews_flagged_count}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30">
                    <span className="text-[9px] text-[#22c55e] block">Cupons Resgatados</span>
                    <strong className="text-[#22c55e] text-sm">{formatBRL(telemetry.vector_engines_captured?.valid_coupons_redeemed_value_brl || 0)}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-[9px] text-amber-300 block">Alertas Radar Futuro</span>
                    <strong className="text-amber-400 text-sm">{telemetry.vector_engines_captured?.future_drop_alerts_issued}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <span className="text-[9px] text-red-300 block">Fretes Inflados Detectados</span>
                    <strong className="text-red-400 text-sm">{telemetry.vector_engines_captured?.freight_inflation_audits}</strong>
                  </div>
                </div>
              </div>

              {/* Highlight Row 3: Active Coupons Table */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-gray-300 block">
                  🏷️ Cupons Ativos Válidos Mapeados nas Lojas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {telemetry.vector_engines_captured?.top_active_coupons?.map((c: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px]">
                      <span className="text-[9px] text-gray-400 block truncate">{c.store}</span>
                      <strong className="text-amber-400 font-mono">{c.code}</strong>
                      <span className="text-[9px] text-[#22c55e] block font-bold">{c.discount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight Row 4: Retailers Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  Divisão de Auditoria por Player
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {telemetry.retailers_breakdown?.map((ret: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs truncate">{ret.store}</strong>
                        <span className="text-[10px] text-orange-400 font-bold font-mono">{ret.share}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 block">{ret.volume} auditorias</span>
                      <span className="text-[9px] text-red-400 block font-semibold truncate">Tática: {ret.dark_pattern}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
