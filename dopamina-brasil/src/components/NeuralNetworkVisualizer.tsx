"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Cpu, Database, Layers, Network, Sparkles, BarChart3 } from "lucide-react";

interface NeuronPulse {
  id: number;
  from: number;
  to: number;
  label: string;
  value: string;
}

const neuralLayers = [
  { name: "INPUT", neurons: 5, color: "#3b82f6", labels: ["Preço", "Histórico", "Sazonalidade", "Frete", "Avaliações"] },
  { name: "HIDDEN 1", neurons: 8, color: "#8b5cf6", labels: [] },
  { name: "HIDDEN 2", neurons: 6, color: "#a855f7", labels: [] },
  { name: "HIDDEN 3", neurons: 4, color: "#c084fc", labels: [] },
  { name: "OUTPUT", neurons: 3, color: "#22c55e", labels: ["Preço Justo", "Anomalia", "Confiança"] },
];

const metrics = [
  { label: "Acurácia", value: "99.03%", color: "#22c55e" },
  { label: "Precisão", value: "99.38%", color: "#3b82f6" },
  { label: "Recall", value: "98.71%", color: "#a855f7" },
  { label: "F1-Score", value: "99.04%", color: "#f97316" },
  { label: "AUC-ROC", value: "0.9962", color: "#ec4899" },
  { label: "Registros", value: "2.5M", color: "#06b6d4" },
];

const processSteps = [
  "Capturando preço de varejo...",
  "Normalizando features de entrada...",
  "Forward pass — camada oculta 1...",
  "Forward pass — camada oculta 2...",
  "Forward pass — camada oculta 3...",
  "Softmax na camada de saída...",
  "Preço justo calculado ✓",
];

export default function NeuralNetworkVisualizer() {
  const [activePulse, setActivePulse] = useState(0);
  const [processStep, setProcessStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setActivePulse((prev) => (prev + 1) % (neuralLayers.length - 1));
      setProcessStep((prev) => {
        const next = prev + 1;
        if (next >= processSteps.length) {
          setIsProcessing(false);
          setTimeout(() => {
            setIsProcessing(true);
            setProcessStep(0);
            setActivePulse(0);
          }, 3000);
          return prev;
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="w-full rounded-2xl bg-[#080810] border border-[#a855f7]/20 overflow-hidden font-mono shadow-[0_0_60px_rgba(168,85,247,0.08)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-950/30 to-[#080810] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">H53 NEURAL NETWORK — VISÃO INTERNA</span>
        </div>
        <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
          <Cpu className="w-3 h-3" /> 5-LAYER DEEP NETWORK
        </span>
      </div>

      {/* Neural Network Visualization */}
      <div className="px-4 py-5 border-b border-[#1a1a2e]">
        <svg viewBox="0 0 500 200" className="w-full h-32 sm:h-44">
          {/* Connections */}
          {neuralLayers.slice(0, -1).map((layer, li) => {
            const nextLayer = neuralLayers[li + 1];
            const x1 = (li / (neuralLayers.length - 1)) * 440 + 30;
            const x2 = ((li + 1) / (neuralLayers.length - 1)) * 440 + 30;
            const isActive = activePulse === li;

            return layer.labels.length > 0
              ? Array.from({ length: layer.neurons }).flatMap((_, ni) =>
                  Array.from({ length: nextLayer.neurons }).map((_, nj) => {
                    const y1 = ((ni + 0.5) / layer.neurons) * 180 + 10;
                    const y2 = ((nj + 0.5) / nextLayer.neurons) * 180 + 10;
                    return (
                      <line
                        key={`${li}-${ni}-${nj}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isActive ? layer.color : "#1a1a2e"}
                        strokeWidth={isActive ? 1 : 0.3}
                        opacity={isActive ? 0.6 : 0.3}
                      />
                    );
                  })
                )
              : Array.from({ length: layer.neurons }).flatMap((_, ni) =>
                  Array.from({ length: nextLayer.neurons }).map((_, nj) => {
                    const y1 = ((ni + 0.5) / layer.neurons) * 180 + 10;
                    const y2 = ((nj + 0.5) / nextLayer.neurons) * 180 + 10;
                    return (
                      <line
                        key={`${li}-${ni}-${nj}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isActive ? layer.color : "#1a1a2e"}
                        strokeWidth={isActive ? 1 : 0.3}
                        opacity={isActive ? 0.6 : 0.3}
                      />
                    );
                  })
                );
          })}

          {/* Neurons */}
          {neuralLayers.map((layer, li) => {
            const x = (li / (neuralLayers.length - 1)) * 440 + 30;
            const isActive = activePulse === li || activePulse === li - 1;

            return Array.from({ length: layer.neurons }).map((_, ni) => {
              const y = ((ni + 0.5) / layer.neurons) * 180 + 10;
              return (
                <g key={`n-${li}-${ni}`}>
                  <circle cx={x} cy={y} r={isActive ? 7 : 5} fill={isActive ? layer.color : "#1a1a2e"} stroke={layer.color} strokeWidth={1} opacity={isActive ? 1 : 0.4}>
                    {isActive && (
                      <animate attributeName="r" values="5;9;5" dur="1.2s" repeatCount="indefinite" />
                    )}
                  </circle>
                  {/* Input labels */}
                  {li === 0 && layer.labels[ni] && (
                    <text x={x - 12} y={y + 3} textAnchor="end" fill="#666" fontSize="6" fontFamily="monospace">{layer.labels[ni]}</text>
                  )}
                  {/* Output labels */}
                  {li === neuralLayers.length - 1 && layer.labels[ni] && (
                    <text x={x + 12} y={y + 3} textAnchor="start" fill={layer.color} fontSize="6" fontFamily="monospace" fontWeight="bold">{layer.labels[ni]}</text>
                  )}
                </g>
              );
            });
          })}

          {/* Layer labels */}
          {neuralLayers.map((layer, li) => {
            const x = (li / (neuralLayers.length - 1)) * 440 + 30;
            return (
              <text key={`label-${li}`} x={x} y={198} textAnchor="middle" fill="#444" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                {layer.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Process Log */}
      <div className="px-4 py-2 border-b border-[#1a1a2e] h-9 flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={processStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-[11px]"
          >
            {isProcessing ? (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            ) : (
              <span className="text-[#22c55e]">✓</span>
            )}
            <span className={isProcessing ? "text-purple-400" : "text-[#22c55e] font-bold"}>
              {processSteps[processStep]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-[#1a1a2e]">
        {metrics.map((m, i) => (
          <div key={i} className="px-3 py-2.5 text-center">
            <span className="text-[8px] text-gray-600 font-bold uppercase block">{m.label}</span>
            <span className="text-xs font-black block mt-0.5" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1a1a2e] flex items-center justify-between text-[9px] text-gray-600">
        <span>HistGradientBoosting · SCIKIT-LEARN · CLIENT-SIDE INFERENCE</span>
        <span className="flex items-center gap-1 text-purple-400">
          <Database className="w-3 h-3" />
          2,500,000 SAMPLES
        </span>
      </div>
    </div>
  );
}
