"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PricePoint {
  month: string;
  price: number;
  label: string;
  status: string;
}

interface PriceHistoryChartProps {
  data: {
    price_history: PricePoint[];
    current_price: number;
    scraped_price: number;
  };
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const history = data.price_history || [];

  const chartData = useMemo(() => {
    if (history.length === 0) return { points: [], min: 0, max: 0 };
    const prices = history.map(h => h.price);
    const min = Math.min(...prices) * 0.92;
    const max = Math.max(...prices) * 1.08;
    return { points: history, min, max };
  }, [history]);

  if (history.length === 0) return null;

  const { points, min, max } = chartData;
  const range = max - min;
  const toY = (price: number) => ((max - price) / range) * 160;

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const first = points[0].price;
  const last = points[points.length - 1].price;
  const trend = last - first;
  const trendPct = ((trend / first) * 100).toFixed(1);

  // Generate smooth path
  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 500;
      const y = toY(p.price);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Area fill
  const areaD = pathD + ` L 500 180 L 0 180 Z`;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Histórico de Preços</h3>
          <p className="text-xs text-muted mt-0.5">Últimos 6 meses via Buscapé</p>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${trend <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          {trend <= 0 ? '' : '+'}{trendPct}%
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 500 190" className="w-full h-48" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(pct => (
            <line
              key={pct}
              x1={0} y1={pct * 160} x2={500} y2={pct * 160}
              stroke="rgba(0,0,0,0.04)" strokeWidth={1}
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#0071E3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) => {
            const x = (i / (points.length - 1)) * 500;
            const y = toY(p.price);
            return (
              <circle
                key={i}
                cx={x} cy={y} r={4}
                fill="white" stroke="#0071E3" strokeWidth={2}
              />
            );
          })}

          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0071E3" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#0071E3" stopOpacity={0.01} />
            </linearGradient>
          </defs>
        </svg>

        {/* X labels */}
        <div className="flex justify-between px-1 mt-2">
          {points.map((p, i) => (
            <div key={i} className="text-center">
              <span className="text-[10px] text-muted block">{p.month}</span>
              <span className="text-[10px] font-medium text-foreground/70">{formatBRL(p.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Min / Max summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-xs">
          <span className="text-muted">Menor preço: </span>
          <span className="font-semibold text-emerald-600">{formatBRL(Math.min(...points.map(p => p.price)))}</span>
        </div>
        <div className="text-xs">
          <span className="text-muted">Maior preço: </span>
          <span className="font-semibold text-red-500">{formatBRL(Math.max(...points.map(p => p.price)))}</span>
        </div>
      </div>
    </div>
  );
}
