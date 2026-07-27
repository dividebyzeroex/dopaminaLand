"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScanLine, AlertTriangle, Eye, EyeOff, Shield, X } from "lucide-react";

interface DarkPattern {
  name: string;
  emoji: string;
  severity: "critical" | "warning" | "info";
  description: string;
  evidence: string;
  detectionPct: number;
}

const darkPatterns: DarkPattern[] = [
  { name: "Ancoragem de Preço Inflado", emoji: "💀", severity: "critical", description: "Preço original inflado artificialmente antes do desconto para simular economia inexistente.", evidence: "Preço \"original\" R$ 12.999 nunca foi praticado nos últimos 6 meses.", detectionPct: 94 },
  { name: "Urgência Artificial", emoji: "⏰", severity: "critical", description: "Contadores regressivos falsos e alertas de estoque para pressionar compra por impulso.", evidence: "Contador \"Últimas 2 unidades\" reinicia a cada visita ao site.", detectionPct: 87 },
  { name: "Frete Oculto no Checkout", emoji: "📦", severity: "warning", description: "Frete grátis no anúncio, mas custo adicionado silenciosamente no carrinho.", evidence: "Frete R$ 49,90 inserido na etapa final sem aviso prévio.", detectionPct: 91 },
  { name: "Reviews Fabricados por Bots", emoji: "🤖", severity: "warning", description: "Comentários positivos gerados por automação para inflar reputação do produto.", evidence: "73% dos reviews 5★ possuem padrão linguístico de IA generativa.", detectionPct: 78 },
  { name: "Dark Confirm (Confirmshaming)", emoji: "😈", severity: "info", description: "Botão de recusar oferta usa linguagem culposa: \"Não, prefiro pagar mais caro\".", evidence: "Texto manipulador detectado em 3 modais de saída.", detectionPct: 96 },
  { name: "Preço Dinâmico por Device", emoji: "📱", severity: "critical", description: "Preço diferente para o mesmo produto dependendo do dispositivo ou navegador do usuário.", evidence: "iPhone: R$ 8.999 · Android: R$ 8.499 · Desktop: R$ 8.799", detectionPct: 82 },
];

export default function DarkPatternRadar() {
  const [scanAngle, setScanAngle] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanAngle((prev) => (prev + 3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Auto-reveal patterns during scan
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setRevealed((prev) => {
        if (prev.size >= darkPatterns.length) {
          setIsScanning(false);
          return prev;
        }
        const next = new Set(prev);
        next.add(prev.size);
        return next;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [isScanning]);

  const getSeverityColor = (s: string) => {
    if (s === "critical") return "text-red-400 bg-red-500/10 border-red-500/30";
    if (s === "warning") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  };

  const getSeverityLabel = (s: string) => {
    if (s === "critical") return "CRÍTICO";
    if (s === "warning") return "ALERTA";
    return "INFO";
  };

  return (
    <div className="w-full rounded-2xl bg-[#080810] border border-red-500/20 overflow-hidden font-mono shadow-[0_0_60px_rgba(239,68,68,0.08)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-950/30 to-[#080810] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-red-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">DARK PATTERN RADAR</span>
          {isScanning && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[9px] text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              SCANNING
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500">{revealed.size}/{darkPatterns.length} detectados</span>
      </div>

      {/* Radar Visualization */}
      <div className="flex items-center justify-center py-5 border-b border-[#1a1a2e] relative">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          {/* Radar circles */}
          {[1, 0.7, 0.4].map((scale, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-[#1a1a2e]"
              style={{ transform: `scale(${scale})`, margin: "auto", width: "100%", height: "100%", top: 0, left: 0 }}
            />
          ))}
          {/* Cross lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#1a1a2e]" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#1a1a2e]" />

          {/* Scanning beam */}
          {isScanning && (
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
              style={{ transform: `rotate(${scanAngle}deg)`, background: "linear-gradient(90deg, rgba(239,68,68,0.8), transparent)" }}
            />
          )}

          {/* Detected dots */}
          {darkPatterns.map((dp, i) => {
            if (!revealed.has(i)) return null;
            const angle = (i / darkPatterns.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 30 + (dp.detectionPct / 100) * 35;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className={`w-3 h-3 rounded-full ${
                  dp.severity === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" :
                  dp.severity === "warning" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" :
                  "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                }`}>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{
                    backgroundColor: dp.severity === "critical" ? "#ef4444" : dp.severity === "warning" ? "#f59e0b" : "#3b82f6"
                  }} />
                </div>
              </motion.div>
            );
          })}

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#22c55e] opacity-40" />
          </div>
        </div>
      </div>

      {/* Detected Patterns List */}
      <div className="max-h-72 overflow-y-auto">
        {darkPatterns.map((dp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: revealed.has(i) ? 1 : 0.2, x: 0 }}
            transition={{ delay: revealed.has(i) ? 0 : 0 }}
            className={`px-4 py-3 border-b border-[#111122] ${!revealed.has(i) ? "blur-[2px]" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-base shrink-0">{dp.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-white">{dp.name}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getSeverityColor(dp.severity)}`}>
                      {getSeverityLabel(dp.severity)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{dp.description}</p>
                  {revealed.has(i) && (
                    <p className="text-[10px] text-red-400/80 mt-1 italic">📋 {dp.evidence}</p>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 shrink-0">{dp.detectionPct}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1a1a2e] flex items-center justify-between text-[9px] text-gray-600">
        <span>6 PADRÕES CATALOGADOS · PROCON DIGITAL</span>
        <span className="text-red-400 font-bold">{revealed.size} VIOLAÇÕES ATIVAS</span>
      </div>
    </div>
  );
}
