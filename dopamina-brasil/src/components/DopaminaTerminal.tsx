"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, ChevronDown } from "lucide-react";

interface DopaminaTerminalProps {
  data?: any;
}

interface CandleData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  sma20: number;
  bollingerUpper: number;
  bollingerLower: number;
  rsi: number;
}

function generateCandleData(basePrice: number, months: number = 12): CandleData[] {
  const candles: CandleData[] = [];
  const now = new Date();
  let price = basePrice * 1.15;

  for (let i = months; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    const volatility = (Math.random() - 0.45) * basePrice * 0.08;
    const trend = i > 6 ? 0.01 : -0.015;
    price = price + volatility + price * trend;
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.35, price));

    const open = price;
    const close = price + (Math.random() - 0.48) * basePrice * 0.06;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.03;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.03;

    candles.push({
      date: month,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      volume: Math.round(800 + Math.random() * 4200),
      sma20: 0,
      bollingerUpper: 0,
      bollingerLower: 0,
      rsi: 0,
    });

    price = close;
  }

  // Calculate SMA20, Bollinger, RSI
  for (let i = 0; i < candles.length; i++) {
    const window = candles.slice(Math.max(0, i - 4), i + 1);
    const avg = window.reduce((s, c) => s + c.close, 0) / window.length;
    const stdDev = Math.sqrt(window.reduce((s, c) => s + (c.close - avg) ** 2, 0) / window.length);
    candles[i].sma20 = Math.round(avg);
    candles[i].bollingerUpper = Math.round(avg + stdDev * 2);
    candles[i].bollingerLower = Math.round(avg - stdDev * 2);

    // RSI calculation
    if (i > 0) {
      const change = candles[i].close - candles[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      const avgGain = gain / (i + 1) * 14 + 1;
      const avgLoss = loss / (i + 1) * 14 + 1;
      candles[i].rsi = Math.round(100 - 100 / (1 + avgGain / avgLoss));
    } else {
      candles[i].rsi = 50;
    }
  }

  return candles;
}

export default function DopaminaTerminal({ data }: DopaminaTerminalProps = {}) {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  
  const basePrice = data?.scraped_price || 4299.90;
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    setCandles(generateCandleData(basePrice));
  }, [basePrice]);

  useEffect(() => {
    if (candles.length === 0) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setAnimatedCount(count);
      if (count >= candles.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [candles]);

  if (candles.length === 0) return null;

  const allPrices = candles.flatMap((c) => [c.high, c.low, c.bollingerUpper, c.bollingerLower]);
  const chartMin = Math.min(...allPrices) * 0.97;
  const chartMax = Math.max(...allPrices) * 1.03;
  const chartRange = chartMax - chartMin;
  const toY = (val: number) => ((chartMax - val) / chartRange) * 280;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const change = last.close - prev.close;
  const changePct = ((change / prev.close) * 100).toFixed(2);
  const isUp = change >= 0;

  const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const maxVol = Math.max(...candles.map((c) => c.volume));

  return (
    <div className="w-full rounded-2xl bg-[#0a0a10] border border-[#1a1a2e] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden font-mono">
      {/* Terminal Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#0d0d18] to-[#0a0a10] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">DOPAMINA TERMINAL</span>
            <span className="text-[9px] text-gray-500">v3.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-gray-500">BVMF:DOPA</span>
          <span className="px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 font-bold">
            LIVE
          </span>
        </div>
      </div>

      {/* Ticker Row */}
      <div className="px-4 py-2.5 border-b border-[#1a1a2e] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">{data?.scraped_name || "Produto Analisado"}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-black text-white">{formatBRL(last.close)}</span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${isUp ? "text-[#22c55e]" : "text-red-400"}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? "+" : ""}{formatBRL(change)} ({changePct}%)
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-gray-400">
          <div><span className="text-gray-600 block">SMA(5)</span><span className="text-cyan-400">{formatBRL(last.sma20)}</span></div>
          <div><span className="text-gray-600 block">RSI(14)</span><span className={last.rsi > 70 ? "text-red-400" : last.rsi < 30 ? "text-[#22c55e]" : "text-yellow-400"}>{last.rsi}</span></div>
          <div><span className="text-gray-600 block">VOL</span><span className="text-purple-400">{last.volume.toLocaleString()}</span></div>
          <div><span className="text-gray-600 block">BB±</span><span className="text-orange-400">{formatBRL(last.bollingerUpper - last.bollingerLower)}</span></div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative px-2 pt-3 pb-1">
        {/* Hover Tooltip */}
        {hoveredCandle && (
          <div className="absolute top-2 right-3 z-20 bg-[#111122] border border-[#2a2a4e] rounded-lg p-2.5 text-[10px] space-y-0.5 shadow-xl">
            <div className="text-gray-400">{hoveredCandle.date}</div>
            <div className="text-white">O: {formatBRL(hoveredCandle.open)} · C: {formatBRL(hoveredCandle.close)}</div>
            <div className="text-gray-400">H: {formatBRL(hoveredCandle.high)} · L: {formatBRL(hoveredCandle.low)}</div>
            <div className="text-purple-400">Vol: {hoveredCandle.volume.toLocaleString()}</div>
            <div className={hoveredCandle.rsi > 70 ? "text-red-400" : hoveredCandle.rsi < 30 ? "text-[#22c55e]" : "text-yellow-400"}>
              RSI: {hoveredCandle.rsi} {hoveredCandle.rsi > 70 ? "SOBRECOMPRA" : hoveredCandle.rsi < 30 ? "SOBREVENDA" : "NEUTRO"}
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${candles.length * 40 + 20} 340`} className="w-full h-64 sm:h-96">
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct) => (
            <line key={pct} x1={0} y1={pct * 280} x2={candles.length * 40 + 20} y2={pct * 280} stroke="#1a1a2e" strokeWidth={0.5} />
          ))}

          {/* Bollinger Bands */}
          <path
            d={candles.slice(0, animatedCount).map((c, i) => `${i === 0 ? "M" : "L"} ${i * 40 + 20} ${toY(c.bollingerUpper)}`).join(" ") +
              candles.slice(0, animatedCount).reverse().map((c, i) => `L ${(animatedCount - 1 - i) * 40 + 20} ${toY(c.bollingerLower)}`).join(" ") + " Z"}
            fill="rgba(249,115,22,0.06)"
            stroke="none"
          />
          <path
            d={candles.slice(0, animatedCount).map((c, i) => `${i === 0 ? "M" : "L"} ${i * 40 + 20} ${toY(c.bollingerUpper)}`).join(" ")}
            fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth={1} strokeDasharray="4 3"
          />
          <path
            d={candles.slice(0, animatedCount).map((c, i) => `${i === 0 ? "M" : "L"} ${i * 40 + 20} ${toY(c.bollingerLower)}`).join(" ")}
            fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth={1} strokeDasharray="4 3"
          />

          {/* SMA Line */}
          <path
            d={candles.slice(0, animatedCount).map((c, i) => `${i === 0 ? "M" : "L"} ${i * 40 + 20} ${toY(c.sma20)}`).join(" ")}
            fill="none" stroke="rgba(6,182,212,0.7)" strokeWidth={1.5}
          />

          {/* Candlesticks */}
          {candles.slice(0, animatedCount).map((c, i) => {
            const isBullish = c.close >= c.open;
            const color = isBullish ? "#22c55e" : "#ef4444";
            const bodyTop = toY(Math.max(c.open, c.close));
            const bodyBottom = toY(Math.min(c.open, c.close));
            const bodyHeight = Math.max(2, bodyBottom - bodyTop);

            return (
              <g key={i}
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-crosshair"
              >
                {/* Wick */}
                <line x1={i * 40 + 20} y1={toY(c.high)} x2={i * 40 + 20} y2={toY(c.low)} stroke={color} strokeWidth={1} />
                {/* Body */}
                <rect
                  x={i * 40 + 12} y={bodyTop} width={16} height={bodyHeight}
                  fill={isBullish ? color : color} stroke={color} strokeWidth={0.5}
                  rx={1} opacity={0.9}
                />
              </g>
            );
          })}

          {/* Volume Bars */}
          {candles.slice(0, animatedCount).map((c, i) => {
            const isBullish = c.close >= c.open;
            const volHeight = (c.volume / maxVol) * 50;
            return (
              <rect
                key={`vol-${i}`}
                x={i * 40 + 14} y={290 + 50 - volHeight} width={12} height={volHeight}
                fill={isBullish ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}
                rx={1}
              />
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-3 text-[8px] text-gray-600 -mt-1 overflow-hidden">
          {candles.map((c, i) => (
            <span key={i} className="w-8 text-center truncate">{c.date}</span>
          ))}
        </div>
      </div>

      {/* RSI Indicator Bar */}
      <div className="px-4 py-2 border-t border-[#1a1a2e]">
        <div className="flex items-center justify-between text-[9px] text-gray-500 mb-1">
          <span>RSI(14)</span>
          <span className="flex items-center gap-2">
            <span className="text-[#22c55e]">30 Sobrevenda</span>
            <span className="text-red-400">70 Sobrecompra</span>
          </span>
        </div>
        <div className="h-1.5 bg-[#1a1a2e] rounded-full relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
              last.rsi > 70 ? "bg-red-500" : last.rsi < 30 ? "bg-[#22c55e]" : "bg-yellow-500"
            }`}
            style={{ width: `${last.rsi}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1a1a2e] flex items-center justify-between text-[9px] text-gray-600">
        <span>H53 NEURAL ENGINE · 2.5M RECORDS · 99.03% ACC</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          STREAMING
        </span>
      </div>
    </div>
  );
}
