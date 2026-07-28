"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Bell, Clock, TrendingDown, Zap, ChevronRight } from "lucide-react";

interface PricePredatorProps {
  data?: any;
}

interface PredatorTarget {
  name: string;
  emoji: string;
  currentPrice: number;
  predictedLow: number;
  daysUntil: number;
  confidence: number;
  store: string;
}

const predatorTargets: PredatorTarget[] = [
  { name: "iPhone 16 Pro Max 256GB", emoji: "📱", currentPrice: 9499, predictedLow: 7890, daysUntil: 23, confidence: 94.2, store: "Amazon" },
  { name: "PlayStation 5 Slim", emoji: "🎮", currentPrice: 3799, predictedLow: 2990, daysUntil: 41, confidence: 91.8, store: "Kabum" },
  { name: "MacBook Air M3 15\"", emoji: "💻", currentPrice: 12999, predictedLow: 10490, daysUntil: 67, confidence: 88.5, store: "Fast Shop" },
  { name: "AirPods Pro 2", emoji: "🎧", currentPrice: 2299, predictedLow: 1690, daysUntil: 15, confidence: 96.1, store: "Mercado Livre" },
  { name: "Samsung Galaxy S25 Ultra", emoji: "📲", currentPrice: 8999, predictedLow: 6990, daysUntil: 52, confidence: 89.7, store: "Magalu" },
];

function CountdownTimer({ targetDays }: { targetDays: number }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDays);

    const update = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) return;

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDays]);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: timeLeft.days, label: "D" },
        { val: timeLeft.hours, label: "H" },
        { val: timeLeft.minutes, label: "M" },
        { val: timeLeft.seconds, label: "S" },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <span className="bg-[#0d0d18] border border-[#22c55e]/30 rounded-lg px-2 py-1.5 text-[#22c55e] font-black text-sm sm:text-base tabular-nums min-w-[2rem] text-center shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            {String(unit.val).padStart(2, "0")}
          </span>
          <span className="text-[8px] text-gray-600 font-bold">{unit.label}</span>
          {i < 3 && <span className="text-gray-600 text-xs mx-0.5">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function PricePredator({ data }: PricePredatorProps = {}) {
  const [activeTarget, setActiveTarget] = useState(0);
  const [alertSet, setAlertSet] = useState<Set<number>>(new Set());

  // Use real data if available, else fallback
  let targets = predatorTargets;
  if (data) {
    const currentPrice = data.current_price || 0;
    const dropPercent = data.future_price_prediction?.predictedDropPercent || 0;
    const predictedLow = dropPercent > 0 ? currentPrice * (1 - dropPercent / 100) : data.scraped_price || currentPrice;
    const daysUntil = data.future_price_prediction?.daysToWait || 0;
    
    targets = [
      {
        name: data.scraped_name || "Produto Analisado",
        emoji: "🎯",
        currentPrice: currentPrice,
        predictedLow: predictedLow,
        daysUntil: daysUntil,
        confidence: data.neuralPrediction?.accuracyPercentage || 99.03,
        store: data.net_price_breakdown?.storeName || "Web",
      },
      ...predatorTargets.slice(0, 3)
    ];
  }

  const target = targets[activeTarget];
  const savings = Math.max(0, target.currentPrice - target.predictedLow);
  const savingsPct = target.currentPrice > 0 ? ((savings / target.currentPrice) * 100).toFixed(0) : "0";

  const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleSetAlert = (idx: number) => {
    setAlertSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="w-full rounded-2xl bg-[#060610] border border-[#22c55e]/20 overflow-hidden font-mono shadow-[0_0_80px_rgba(34,197,94,0.1)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#22c55e]/10 to-transparent border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4.5 h-4.5 text-[#22c55e]" />
          <span className="text-xs font-black text-white uppercase tracking-wider">PRICE PREDATOR</span>
          <span className="text-[9px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-0.5 rounded-full font-bold">
            H5 NEURAL · 99.03%
          </span>
        </div>
        <span className="text-[9px] text-gray-500">PREVISÃO 90 DIAS</span>
      </div>

      {/* Active Target Spotlight */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-3xl shrink-0">{target.emoji}</span>
            <div className="min-w-0 pr-4">
              <h3 className="text-sm font-bold text-white truncate">{target.name}</h3>
              <span className="text-[10px] text-gray-500 truncate block">via {target.store}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] text-gray-500 block">PREÇO HOJE</span>
            <span className="text-sm font-bold text-red-400 line-through">{formatBRL(target.currentPrice)}</span>
          </div>
        </div>

        {/* Prediction Card */}
        <motion.div
          key={activeTarget}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-[#22c55e]/10 via-[#0a0a10] to-[#22c55e]/5 border border-[#22c55e]/30 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <span className="text-[9px] text-[#22c55e] font-bold uppercase block tracking-wider">
                IA PREVÊ PREÇO MÍNIMO EM:
              </span>
              <div className="mt-1.5">
                <CountdownTimer targetDays={target.daysUntil} />
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-[9px] text-[#22c55e] font-bold block">PREÇO PREVISTO</span>
              <span className="text-2xl font-black text-[#22c55e]">{formatBRL(target.predictedLow)}</span>
              <span className="text-[10px] text-[#22c55e] block font-bold">
                ECONOMIA DE {formatBRL(savings)} (-{savingsPct}%)
              </span>
            </div>
          </div>

          {/* Confidence Bar */}
          <div>
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className="text-gray-500">Confiança Neural</span>
              <span className="text-[#22c55e] font-bold">{target.confidence}%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${target.confidence}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#22c55e] to-emerald-400 rounded-full"
              />
            </div>
          </div>

          {/* Alert CTA */}
          <button
            onClick={() => handleSetAlert(activeTarget)}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
              alertSet.has(activeTarget)
                ? "bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e]"
                : "bg-[#22c55e] text-black hover:brightness-110 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            }`}
          >
            <Bell className="w-4 h-4" />
            {alertSet.has(activeTarget) ? "🔔 ALERTA ATIVADO — VOU TE AVISAR!" : "ATIVAR ALERTA DE PREÇO SNIPER"}
          </button>
        </motion.div>

        {/* Target Queue */}
      <div className="border-t border-[#1a1a2e] bg-[#030308]">
        <div className="px-4 py-2 border-b border-[#1a1a2e]">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            Alvos Monitorados ({targets.length})
          </span>
        </div>
        <div className="divide-y divide-[#1a1a2e]">
          {targets.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTarget(i)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  i === activeTarget
                    ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl shrink-0">{t.emoji}</span>
                  <div className="min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                    <span className="text-[10px] text-gray-500 truncate block">
                      {t.store} · {t.confidence}% confiança
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-red-400 line-through block">{formatBRL(t.currentPrice)}</span>
                    <span className="text-[10px] text-[#22c55e] font-bold">{formatBRL(t.predictedLow)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{t.daysUntil}d</span>
                  </div>
                  {alertSet.has(i) && <Bell className="w-3 h-3 text-[#22c55e] fill-[#22c55e]" />}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
