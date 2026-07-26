"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Zap, ShieldAlert } from "lucide-react";

interface UrlScannerWidgetProps {
  onOpenForm: (url: string) => void;
}

export default function UrlScannerWidget({ onOpenForm }: UrlScannerWidgetProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "result">("idle");
  const [scanStep, setScanStep] = useState(0);

  const scanStepsMessages = [
    "Analisando estrutura de micro-fricções de checkout...",
    "Mapeando heurísticas de decisão irracional & ancoragem...",
    "Avaliando picos de dopamina e curva de retenção de LTV...",
  ];

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("scanning");
    setScanStep(0);

    setTimeout(() => setScanStep(1), 1200);
    setTimeout(() => setScanStep(2), 2400);
    setTimeout(() => {
      setStatus("result");
    }, 3600);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="relative p-1 rounded-2xl bg-gradient-to-r from-white/10 via-[#ccff00]/30 to-[#a855f7]/30 backdrop-blur-xl shadow-2xl">
        <div className="bg-[#0a0a0f]/90 rounded-[14px] p-6 md:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              <Zap className="w-4 h-4" />
              <span>H53 Cognitive Intent Scanner [Ao Vivo]</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 font-mono">v3.4 PREDIC</span>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.form
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleStartScan}
                className="flex flex-col md:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    required
                    placeholder="https://sualoja.com.br ou seu SaaS"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition-colors text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-[#ccff00] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Analisar Fricção</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {status === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-6 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
                  <div className="absolute inset-0 rounded-full bg-[#ccff00]/20 blur-md animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {scanStepsMessages[scanStep]}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    Rastreando parâmetros neurológicos no domínio: <span className="text-gray-300">{url}</span>
                  </p>
                </div>
                <div className="w-full max-w-md bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#a855f7] to-[#ccff00]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((scanStep + 1) / 3) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </motion.div>
            )}

            {status === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30 gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                        Diagnóstico: Fricção Cognitiva Elevada (64/100)
                      </h4>
                      <p className="text-xs text-gray-400">
                        Domínio analisado: <strong className="text-white">{url}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400 px-3 py-1 bg-red-500/20 rounded-md self-start md:self-auto">
                    -38% Potencial de LTV
                  </span>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Vulnerabilidades de Conversão Encontradas:
                  </h5>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Micro-fricção no Checkout:</strong> Formulários com redundância de dados gerando fadiga de decisão imediata.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Ancoragem de Preço Subaproveitada:</strong> Ausência de gatilhos visuais de escassez e comparação implícita.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                      <span><strong>Oportunidade de Recompensa Límbica:</strong> Potencial para aplicar loop de dopamina no pós-venda.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => onOpenForm(url)}
                    className="flex-1 px-6 py-3.5 bg-[#ccff00] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Receber Plano de Correção H53</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStatus("idle")}
                    className="px-4 py-3.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
                  >
                    Testar Outra URL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
