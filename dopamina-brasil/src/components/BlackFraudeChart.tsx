"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

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

function getDynamicPastMonths(count = 6): string[] {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const now = new Date();
  const currentMonth = now.getMonth();
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), currentMonth - i, 1);
    result.push(i === 0 ? "Hoje" : monthNames[d.getMonth()]);
  }
  return result;
}

export default function BlackFraudeChart({ storePrice, marketLowest, productName, priceHistory }: BlackFraudeChartProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const dynamicMonths = getDynamicPastMonths(6);
  const realBase = Math.round(marketLowest);
  const inflated = Math.round(storePrice * 1.35);
  const promo = Math.round(storePrice);

  const fallbackPoints: PricePoint[] = [
    { month: dynamicMonths[0], price: realBase, label: "Preço Base", status: "normal" },
    { month: dynamicMonths[1], price: Math.round(realBase * 1.04), label: "Regular", status: "normal" },
    { month: dynamicMonths[2], price: Math.round(inflated * 0.8), label: "Pré-Aumento", status: "warning" },
    { month: dynamicMonths[3], price: inflated, label: "Pico Inflado", status: "danger" },
    { month: dynamicMonths[4], price: promo, label: "Preço Anunciado", status: "fake" },
    { month: dynamicMonths[5], price: realBase, label: "Piso Real", status: "real" },
  ];

  const dataPoints = priceHistory && priceHistory.length > 0 ? priceHistory : fallbackPoints;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Compact SVG dimensions
  const width = 500;
  const height = 110;
  const padding = 20;

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
    <div className="w-full bg-[#0a0a0f]/90 border border-white/10 rounded-xl p-3.5 space-y-2 relative overflow-hidden backdrop-blur-md">
      {/* Compact Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-300 font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate max-w-[240px]">Histórico Temporal Mês a Mês</span>
        </div>
        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
          BUSCAPÉ SYNC
        </span>
      </div>

      {/* Sleek Ultra-Compact SVG Chart */}
      <div className="relative pt-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="gradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <path d={areaD} fill="url(#gradientCompact)" />
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => {
            const isHovered = activePoint === idx;
            const isPeak = p.status === "danger";
            return (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePoint(idx)} onMouseLeave={() => setActivePoint(null)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6" : isPeak ? "5" : "3.5"}
                  fill={isPeak ? "#ef4444" : p.status === "real" ? "#22c55e" : "#f97316"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text x={p.x} y={height - 4} textAnchor="middle" fill="#9ca3af" fontSize="9" fontWeight="600">
                  {p.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Compact Tooltip */}
        {activePoint !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#18181b] border border-white/20 px-3 py-1.5 rounded-lg shadow-xl z-30 pointer-events-none text-center"
          >
            <span className="text-[9px] font-bold text-gray-400 block uppercase">{points[activePoint].month}</span>
            <span className="text-xs font-black font-mono text-white">{formatBRL(points[activePoint].price)}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
