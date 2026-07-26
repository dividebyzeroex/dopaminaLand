"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Clock, Scale, Truck, CheckCircle, ShieldAlert, ArrowRight, Sparkles, AlertTriangle } from "lucide-react";

export default function ProductIntelligenceSuite() {
  const [activeTab, setActiveTab] = useState<"reviews" | "netprice" | "predict" | "costperuse" | "freight">("reviews");
  const [testQuery, setTestQuery] = useState("iPhone 17 Apple");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>({
    reviews: {
      score: 82,
      botPercentage: 18,
      verdict: "Autêntico: 82% das avaliações são de compradores reais verificados.",
      summary: "Compradores elogiam a tela e o processamento, porém mencionam aquecimento leve durante jogos pesados."
    },
    netprice: {
      storePrice: 4360.50,
      bestMarket: 1999.00,
      coupon: "DOPAMINA10",
      pixPrice: 1799.10,
      cashback: 89.95,
      netPrice: 1709.15
    },
    predict: {
      recommendation: "ESPERE 9 DIAS 🛑",
      daysToWait: 9,
      predictedDropPercent: 12,
      reason: "Preço inflado nas últimas 48h. Tendência histórica de queda acumulada de 12% na próxima semana."
    },
    costperuse: {
      dailyCost30d: "R$ 66,63",
      dailyCost365d: "R$ 5,47",
      verdict: "Excelente retenção de valor e baixo custo diário estimado em 1 ano de uso."
    },
    freight: {
      freightPrice: "R$ 19,90",
      status: "Frete Justo",
      verdict: "Sem sobretaxa oculta ou frete abusivo embutido no preço."
    }
  });

  const handleRunSuite = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
  };

  const engines = [
    { id: "reviews", label: "🧠 Review Falsa", icon: Brain, color: "text-[#a855f7] border-[#a855f7]" },
    { id: "netprice", label: "⚡ Preço Líquido", icon: Zap, color: "text-[#22c55e] border-[#22c55e]" },
    { id: "predict", label: "🔮 Radar Futuro", icon: Clock, color: "text-amber-400 border-amber-400" },
    { id: "costperuse", label: "⚖️ Custo p/ Uso", icon: Scale, color: "text-blue-400 border-blue-400" },
    { id: "freight", label: "🚨 Frete Falso", icon: Truck, color: "text-red-400 border-red-400" },
  ] as const;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="w-full max-w-7xl mx-auto my-8 space-y-6 font-inter">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          SUÍTE DE INTELIGÊNCIA DE MERCADO DOPAMINA
        </span>
        <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight">
          5 Motores Revolucionários de Auditoria
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          Escolha uma ferramenta abaixo para testar o algoritmo de proteção ao consumidor em tempo real:
        </p>
      </div>

      {/* 5 Engine Selector Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {engines.map((eng) => {
          const Icon = eng.icon;
          const isActive = activeTab === eng.id;
          return (
            <button
              key={eng.id}
              onClick={() => setActiveTab(eng.id as any)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 active:scale-95 ${
                isActive
                  ? `bg-white/10 ${eng.color} shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                  : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{eng.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Engine Card */}
      <div className="relative p-1 rounded-3xl bg-gradient-to-r from-purple-900/30 via-black to-[#22c55e]/20 backdrop-blur-xl shadow-2xl border border-white/10">
        <div className="bg-[#0b0b10] rounded-[22px] p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-[#a855f7]" />
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white">
                        Raio-X de Avaliações Falsas (Bot Authenticator)
                      </h3>
                      <p className="text-xs text-gray-400">
                        Algoritmo de análise sintática que varre comentários e detecta robôs de 5 estrelas.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full border border-[#a855f7]/30">
                    BOT DETECTOR ACTIVE
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs text-gray-400">Índice de Autenticidade:</span>
                    <p className="text-3xl font-black font-mono text-[#22c55e]">{result.reviews.score}% REAL</p>
                    <span className="text-[11px] text-gray-400 block">{result.reviews.verdict}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <span className="text-xs text-purple-300 font-bold">Resumo Sintetizado dos Compradores:</span>
                    <p className="text-xs text-gray-200 leading-relaxed font-light">{result.reviews.summary}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "netprice" && (
              <motion.div
                key="netprice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-[#22c55e]" />
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white">
                        Calculadora de Preço Líquido (Cupons + Pix + Cashback)
                      </h3>
                      <p className="text-xs text-gray-400">
                        Combina cupons ocultos e descontos de pagamento para calcular o valor mínimo absoluto no checkout.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/30">
                    NET PRICE ENGINE
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400">Preço Anunciado na Loja:</span>
                    <p className="text-xl font-bold font-mono text-red-400">{formatBRL(result.netprice.storePrice)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400">Desconto Pix + Cupom ({result.netprice.coupon}):</span>
                    <p className="text-xl font-bold font-mono text-amber-400">{formatBRL(result.netprice.pixPrice)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 space-y-1">
                    <span className="text-[#22c55e] font-bold">Valor Líquido Final com Cashback:</span>
                    <p className="text-2xl font-black font-mono text-[#22c55e]">{formatBRL(result.netprice.netPrice)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "predict" && (
              <motion.div
                key="predict"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-amber-400" />
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white">
                        Preditor de Preço Futuro (Radar Comprar vs Esperar)
                      </h3>
                      <p className="text-xs text-gray-400">
                        Análise preditiva de sazonalidade e histórico para sugerir a melhor janela de compra.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    AI RADAR ACTIVE
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Recomendação Algorítmica:
                    </span>
                    <h4 className="text-2xl font-black font-outfit text-white">
                      {result.predict.recommendation}
                    </h4>
                    <p className="text-xs text-gray-300">{result.predict.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 block">Queda Estimada:</span>
                    <span className="text-2xl font-black font-mono text-amber-400">
                      -{result.predict.predictedDropPercent}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "costperuse" && (
              <motion.div
                key="costperuse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white">
                        Calculadora de Custo por Uso (Rational Purchase Score)
                      </h3>
                      <p className="text-xs text-gray-400">
                        Calcula o valor real por dia de utilização do produto para embasar decisões racionais.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                    LTV CALCULATOR
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400">Custo Diário (Uso em 30 Dias):</span>
                    <p className="text-xl font-bold font-mono text-white">{result.costperuse.dailyCost30d}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                    <span className="text-blue-300 font-bold">Custo Diário (Uso em 1 Ano):</span>
                    <p className="text-2xl font-black font-mono text-blue-400">{result.costperuse.dailyCost365d}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-gray-400">Veredito da IA:</span>
                    <p className="text-xs font-semibold text-gray-200">{result.costperuse.verdict}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "freight" && (
              <motion.div
                key="freight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-red-400" />
                    <div>
                      <h3 className="text-lg font-black font-outfit text-white">
                        Detector de Falso Frete Grátis & Frete Abusivo
                      </h3>
                      <p className="text-xs text-gray-400">
                        Audita se a loja inflou a taxa de entrega para recuperar a margem de desconto do produto.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                    FREIGHT AUDIT
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider block">
                      Status do Frete: {result.freight.status}
                    </span>
                    <p className="text-xs text-gray-300">{result.freight.verdict}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 block">Valor Calculado do Frete:</span>
                    <span className="text-xl font-black font-mono text-white">
                      {result.freight.freightPrice}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
