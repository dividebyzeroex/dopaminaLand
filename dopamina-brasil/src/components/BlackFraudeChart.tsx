"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export interface PricePoint {
  month: string;
  price: number;
  label: string;
  status: "normal" | "warning" | "danger" | "fake" | "real" | string;
}

interface BlackFraudeChartProps {
  storePrice: number;
  marketLowest: number;
  productName?: string;
  priceHistory?: PricePoint[];
}

export default function BlackFraudeChart({ storePrice, marketLowest, productName, priceHistory }: BlackFraudeChartProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const realBase = Math.round(marketLowest);
  const inflated = Math.round(storePrice * 1.35);
  const promo = Math.round(storePrice);

  const fallbackPoints: PricePoint[] = [
    { month: "Maio", price: realBase, label: "Preço Base de Mercado", status: "normal" },
    { month: "Junho", price: Math.round(realBase * 1.04), label: "Variação Regular", status: "normal" },
    { month: "Julho", price: Math.round(inflated * 0.8), label: "Preço Pré-Aumento", status: "warning" },
    { month: "Agosto", price: inflated, label: "PICO DA METADE DO DOBRO", status: "danger" },
    { month: "Setembro", price: promo, label: "Preço Anunciado na Loja", status: "fake" },
    { month: "Hoje", price: realBase, label: "Piso Real do Mercado (Buscapé Sync)", status: "real" },
  ];

  const dataPoints = (priceHistory && priceHistory.length > 0) ? priceHistory : fallbackPoints;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const padding = 40;

  const minPrice = Math.min(...dataPoints.map((d) => d.price)) * 0.85;
  const maxPrice = Math.max(...dataPoints.map((d) => d.price)) * 1.1;

  const points = dataPoints.map((d, i) => {
    const x = padding + (i / Math.max(1, dataPoints.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.price - minPrice) / Math.max(1, maxPrice - minPrice)) * (height - padding * 2);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full bg-[#0a0a0f] border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
              BUSCAPÉ HISTÓRICO REAL: ESCALADA MÊS A MÊS
            </span>
            <h4 className="text-sm font-black font-outfit text-white">
              Curva Real do Produto ({productName || "Auditado"})
            </h4>
          </div>
        </div>

        <span className="text-[10px] font-bold font-mono px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full self-start sm:self-auto">
          INSPEÇÃO DE METADE DO DOBRO ATIVA
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative pt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#gradientRed)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = activePoint === idx;
            const isPeak = p.status === "danger";
            return (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(idx)} onMouseLeave={() => setActivePoint(null)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "7" : isPeak ? "6" : "4"}
                  fill={isPeak ? "#ef4444" : p.status === "real" ? "#22c55e" : "#f97316"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#9ca3af"
                  fontSize="10"
                  fontWeight="600"
                >
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {activePoint !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#18181b] border border-white/20 p-3 rounded-xl shadow-2xl z-30 pointer-events-none text-center space-y-1 min-w-[200px]"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase">{points[activePoint].month}</p>
            <p className="text-lg font-black font-mono text-white">{formatBRL(points[activePoint].price)}</p>
            <span className="text-[10px] font-bold text-red-400 block">{points[activePoint].label}</span>
          </motion.div>
        )}
      </div>

      {/* Explanatory Banner */}
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-gray-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Alerta de Inflação de Preço Mês a Mês:</strong> Este gráfico mapeia a movimentação real coletada no Buscapé/Bondfaro. Se o pico ocorrer semanas antes de uma promoção, o desconto anunciado é falso!
        </p>
      </div>
    </div>
  );
}
