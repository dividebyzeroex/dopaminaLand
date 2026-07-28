"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Activity, ThumbsDown, MessageSquareWarning, Zap } from "lucide-react";

interface ProductFlawScannerProps {
  data?: any;
}

interface Flaw {
  title: string;
  severity: "high" | "medium" | "low";
  frequency: number; // percentage of negative reviews mentioning this
  description: string;
  source: string;
}

const defaultFlaws: Flaw[] = [
  { 
    title: "Vício Oculto na Bateria", 
    severity: "high", 
    frequency: 42, 
    description: "Degradação severa (abaixo de 80%) após 10 meses de uso contínuo.", 
    source: "Reddit & ReclameAqui" 
  },
  { 
    title: "Aquecimento Térmico", 
    severity: "medium", 
    frequency: 28, 
    description: "Sistema reduz a performance drásticamente (thermal throttling) em dias quentes.", 
    source: "Fóruns Especializados" 
  },
  { 
    title: "Microfone Abafado", 
    severity: "low", 
    frequency: 15, 
    description: "Usuários relatam áudio ruim em chamadas pelo WhatsApp.", 
    source: "Reviews de E-Commerce" 
  },
];

export default function ProductFlawScanner({ data }: ProductFlawScannerProps = {}) {
  const [isScanning, setIsScanning] = useState(true);
  const [foundFlaws, setFoundFlaws] = useState<Flaw[]>([]);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  const productName = data?.scraped_name || "Produto Analisado";
  const targetCount = 14502; // Mocked huge number of reviews analyzed
  const initialFlaws = data?.product_flaws || defaultFlaws;

  useEffect(() => {
    // Animate the review counter
    const duration = 2500;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const increment = targetCount / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setAnalyzedCount(targetCount);
        clearInterval(interval);
      } else {
        setAnalyzedCount(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [targetCount]);

  useEffect(() => {
    // Reveal flaws one by one
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setFoundFlaws([initialFlaws[0]]);
      
      await new Promise(r => setTimeout(r, 800));
      setFoundFlaws([initialFlaws[0], initialFlaws[1]]);
      
      await new Promise(r => setTimeout(r, 800));
      setFoundFlaws(initialFlaws);
      setIsScanning(false);
    };
    
    sequence();
  }, [initialFlaws]);

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "text-red-500 bg-red-500/10 border-red-500/30";
    if (severity === "medium") return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  };

  const getSeverityDot = (severity: string) => {
    if (severity === "high") return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    if (severity === "medium") return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
    return "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
  };

  return (
    <div className="w-full rounded-2xl bg-[#060610] border border-red-500/20 overflow-hidden font-mono shadow-[0_0_40px_rgba(239,68,68,0.05)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-950/40 to-transparent border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4.5 h-4.5 text-red-500" />
          <span className="text-xs font-black text-white uppercase tracking-wider">RAIO-X DE DEFEITOS OCULTOS</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#111122] border border-[#1a1a2e] px-2 py-0.5 rounded-full">
          {isScanning ? (
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          ) : (
            <Activity className="w-3 h-3 text-[#22c55e]" />
          )}
          <span className="text-[9px] text-gray-400 font-bold">
            {analyzedCount.toLocaleString('pt-BR')} REVIEWS LIDOS
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Context */}
        <div className="text-center space-y-1 pb-3 border-b border-[#1a1a2e]">
          <h3 className="text-sm font-bold text-white truncate px-4">{productName}</h3>
          <p className="text-[10px] text-gray-500 max-w-[80%] mx-auto">
            Nossa IA varreu fóruns, ReclameAqui e reviews internacionais para extrair a verdade que as marcas não contam.
          </p>
        </div>

        {/* Flaws List */}
        <div className="space-y-3 min-h-[220px]">
          <AnimatePresence>
            {foundFlaws.map((flaw, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, type: "spring" }}
                className="relative bg-[#0d0d18] border border-[#1a1a2e] rounded-xl p-4 overflow-hidden group"
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${getSeverityColor(flaw.severity).split(" ")[1]}`} />
                
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${getSeverityDot(flaw.severity)}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        {flaw.title}
                        <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${getSeverityColor(flaw.severity)}`}>
                          RISCO {flaw.severity === "high" ? "CRÍTICO" : flaw.severity === "medium" ? "MÉDIO" : "BAIXO"}
                        </span>
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed max-w-[90%]">
                        {flaw.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-600 font-bold">
                        <MessageSquareWarning className="w-3 h-3" />
                        <span>Extraído de: {flaw.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Frequency Stat */}
                  <div className="shrink-0 text-center bg-[#111122] rounded-lg p-2 border border-[#1a1a2e] min-w-[60px]">
                    <span className="block text-lg font-black text-white">{flaw.frequency}%</span>
                    <span className="block text-[8px] text-gray-500 leading-tight uppercase">das<br/>queixas</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-6"
            >
              <div className="inline-block w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-2" />
              <div className="text-[10px] text-red-400 font-bold tracking-widest animate-pulse">
                MINERANDO DEFEITOS CRÔNICOS...
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
