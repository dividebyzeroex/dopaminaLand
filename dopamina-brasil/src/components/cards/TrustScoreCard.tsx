"use client";

import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface TrustScoreCardProps {
  data: any;
}

export default function TrustScoreCard({ data }: TrustScoreCardProps) {
  // Mock logic based on scraped price vs current price
  const isSuspicious = data.scraped_price < (data.current_price * 0.4); 
  const score = isSuspicious ? 34 : 98;
  const status = isSuspicious ? "Alto Risco" : "Confiável";
  const color = isSuspicious ? "text-red-600" : "text-emerald-600";
  const Icon = isSuspicious ? ShieldAlert : ShieldCheck;

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Score de Confiança</h3>
          <p className="text-xs text-muted">Análise de risco da loja e oferta</p>
        </div>
        <div className={`p-2 rounded-lg bg-black/5`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-6 mt-2 relative">
        <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center">
          {/* Semicircle background */}
          <div className="absolute top-0 w-32 h-32 rounded-full border-[12px] border-black/5"></div>
          {/* Active gauge */}
          <motion.div 
            initial={{ rotate: -180 }}
            animate={{ rotate: (score / 100) * 180 - 180 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className={`absolute top-0 w-32 h-32 rounded-full border-[12px] border-transparent origin-center`}
            style={{ borderTopColor: isSuspicious ? '#ef4444' : '#10b981', borderRightColor: isSuspicious ? '#ef4444' : '#10b981' }}
          />
          <div className="absolute bottom-0 flex flex-col items-center">
            <span className="text-3xl font-bold font-[var(--font-display)] tracking-tighter">{score}</span>
          </div>
        </div>
        <span className={`text-sm font-semibold mt-2 ${color}`}>{status}</span>
      </div>

      <div className="bg-black/5 rounded-xl p-3 flex items-start gap-3 mt-auto">
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isSuspicious 
            ? "O preço está muito abaixo do mercado (possível fraude). Recomendamos cautela extrema." 
            : "Loja e oferta verificadas. Histórico positivo e preço coerente com o mercado."}
        </p>
      </div>
    </div>
  );
}
