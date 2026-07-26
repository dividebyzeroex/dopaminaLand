"use client";

import { useState } from "react";
import ScrollReveal from "@/components/h53/ScrollReveal";
import { Calculator, TrendingUp, Zap, ArrowRight, DollarSign } from "lucide-react";
import { h53Audio } from "@/lib/h53AudioEngine";

interface NeuromarketingRoiCalculatorProps {
  onOpenForm: () => void;
}

export default function NeuromarketingRoiCalculator({ onOpenForm }: NeuromarketingRoiCalculatorProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState(500000);
  const [monthlyVisitors, setMonthlyVisitors] = useState(80000);

  // Estimates based on average H53 performance benchmarks (approx 22% conversion lift)
  const estimatedRevenueLift = Math.round(monthlyRevenue * 0.22);
  const estimatedAnnualLift = estimatedRevenueLift * 12;

  const handleSliderChange = (setter: (val: number) => void, val: number) => {
    setter(val);
    h53Audio.playClick();
  };

  return (
    <section className="relative py-32 px-6 bg-[#050505] border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-bold uppercase tracking-widest">
              <Calculator className="w-4 h-4" />
              <span>Simulador de Impacto Financeiro</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white">
              Calcule seu Potencial de Receita Desbloqueada
            </h2>
            <p className="text-gray-400 text-base md:text-lg font-light">
              Deslize os parâmetros da sua operação abaixo e veja o valor exato deixado na mesa devido à fricção cognitiva.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-12 gap-8 items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-12 backdrop-blur-xl">
          {/* Controls Column */}
          <div className="md:col-span-7 space-y-8">
            {/* Slider 1: Revenue */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-300">Faturamento Mensal Atual:</span>
                <span className="text-[#ccff00] font-mono text-lg">
                  R$ {monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={5000000}
                step={50000}
                value={monthlyRevenue}
                onChange={(e) => handleSliderChange(setMonthlyRevenue, Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>R$ 100k</span>
                <span>R$ 2.5M</span>
                <span>R$ 5M+</span>
              </div>
            </div>

            {/* Slider 2: Visitors */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-300">Tráfego de Visitantes/Mês:</span>
                <span className="text-[#a855f7] font-mono text-lg">
                  {monthlyVisitors.toLocaleString()} acessos
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={10000}
                value={monthlyVisitors}
                onChange={(e) => handleSliderChange(setMonthlyVisitors, Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>10k</span>
                <span>250k</span>
                <span>500k+</span>
              </div>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="md:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-[#0a0a0f] to-[#120d1c] border border-[#ccff00]/30 shadow-[0_0_40px_rgba(204,255,0,0.08)] space-y-6 text-center md:text-left">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Projeção de Incremento H53
            </span>

            <div>
              <div className="text-4xl md:text-5xl font-black font-outfit text-[#ccff00] leading-none">
                + R$ {estimatedRevenueLift.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-gray-400 mt-1 block">
                / mês em receita adicional
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Impacto Anual Projetado:</span>
                <span className="text-white font-bold font-mono">+ R$ {estimatedAnnualLift.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Redução de Abandono:</span>
                <span className="text-[#ccff00] font-bold font-mono">- 34%</span>
              </div>
            </div>

            <button
              onClick={() => {
                h53Audio.playScan();
                onOpenForm();
              }}
              className="w-full py-4 bg-[#ccff00] text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>Reclamar Esta Receita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
