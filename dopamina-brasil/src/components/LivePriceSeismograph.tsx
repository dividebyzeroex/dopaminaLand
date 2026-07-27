"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, AlertTriangle, TrendingDown, TrendingUp, Zap } from "lucide-react";

interface SeismicEvent {
  id: number;
  store: string;
  product: string;
  magnitude: number; // 1-10
  type: "drop" | "spike";
  price: number;
  change: number;
  timestamp: Date;
}

const stores = ["Amazon", "Fast Shop", "Kabum", "Mercado Livre", "Magalu", "Shopee"];
const products = [
  "iPhone 16 Pro Max", "RTX 4090", "PS5 Slim", "AirPods Pro 2", "Galaxy S25 Ultra",
  "MacBook Air M3", "iPad Air", "Nintendo Switch 2", "Dyson V15", "JBL Charge 5",
  "Sony WH-1000XM5", "Apple Watch Ultra", "GoPro Hero 13", "Kindle Paperwhite",
];

function generateEvent(id: number): SeismicEvent {
  const isSpike = Math.random() > 0.55;
  const magnitude = parseFloat((1 + Math.random() * 9).toFixed(1));
  const basePrice = 1500 + Math.random() * 10000;
  const changePct = (2 + Math.random() * 25) * (isSpike ? 1 : -1);

  return {
    id,
    store: stores[Math.floor(Math.random() * stores.length)],
    product: products[Math.floor(Math.random() * products.length)],
    magnitude,
    type: isSpike ? "spike" : "drop",
    price: Math.round(basePrice),
    change: parseFloat(changePct.toFixed(1)),
    timestamp: new Date(),
  };
}

export default function LivePriceSeismograph() {
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const [waveData, setWaveData] = useState<number[]>([]);
  const [totalQuakes, setTotalQuakes] = useState(847);
  const eventCounter = useRef(0);

  // Generate initial wave data
  useEffect(() => {
    const initialWave = Array.from({ length: 120 }, () => (Math.random() - 0.5) * 20);
    setWaveData(initialWave);

    // Seed initial events
    const initial: SeismicEvent[] = [];
    for (let i = 0; i < 5; i++) {
      eventCounter.current++;
      initial.push(generateEvent(eventCounter.current));
    }
    setEvents(initial);
  }, []);

  // Animate wave continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveData((prev) => {
        const next = [...prev.slice(1)];
        const lastVal = prev[prev.length - 1] || 0;
        const spike = Math.random() > 0.92 ? (Math.random() - 0.5) * 80 : 0;
        next.push(lastVal * 0.85 + (Math.random() - 0.5) * 15 + spike);
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Generate new events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      eventCounter.current++;
      setTotalQuakes((p) => p + 1);
      setEvents((prev) => {
        const next = [generateEvent(eventCounter.current), ...prev];
        return next.slice(0, 8);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 7) return "text-red-400";
    if (mag >= 4) return "text-amber-400";
    return "text-[#22c55e]";
  };

  const getMagnitudeLabel = (mag: number) => {
    if (mag >= 8) return "MEGA TERREMOTO";
    if (mag >= 6) return "TERREMOTO";
    if (mag >= 4) return "TREMOR";
    return "MICRO";
  };

  // Build SVG polyline from wave data
  const svgWidth = 600;
  const svgHeight = 60;
  const polyline = waveData.map((val, i) => {
    const x = (i / (waveData.length - 1)) * svgWidth;
    const y = svgHeight / 2 + val * (svgHeight / 2) / 60;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full rounded-2xl bg-[#080810] border border-amber-500/20 overflow-hidden font-mono shadow-[0_0_60px_rgba(245,158,11,0.08)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-950/30 to-[#080810] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">SISMÓGRAFO DE PREÇOS AO VIVO</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[9px] text-red-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <span className="text-[10px] text-amber-400 font-bold">{totalQuakes.toLocaleString()} eventos hoje</span>
      </div>

      {/* Seismograph Wave */}
      <div className="px-4 py-3 border-b border-[#1a1a2e] relative overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-12 sm:h-16" preserveAspectRatio="none">
          {/* Center line */}
          <line x1={0} y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#1a1a2e" strokeWidth={0.5} />
          {/* Wave */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glow underneath */}
          <polyline
            points={`0,${svgHeight / 2} ${polyline} ${svgWidth},${svgHeight / 2}`}
            fill="rgba(245,158,11,0.06)"
            stroke="none"
          />
        </svg>
        <div className="absolute top-2 right-5 text-[8px] text-gray-600">
          AMPLITUDE · MULTI-LOJA · BR
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="max-h-64 overflow-y-auto">
        {events.map((ev, i) => (
          <div
            key={ev.id}
            className={`px-4 py-2.5 border-b border-[#111122] flex items-center justify-between text-[11px] transition-all ${
              i === 0 ? "bg-amber-500/5" : ""
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              {/* Magnitude Badge */}
              <div className={`w-10 text-center font-black text-sm ${getMagnitudeColor(ev.magnitude)}`}>
                {ev.magnitude}
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  {ev.type === "spike" ? (
                    <TrendingUp className="w-3 h-3 text-red-400 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#22c55e] shrink-0" />
                  )}
                  <span className="text-white font-semibold truncate">{ev.product}</span>
                </div>
                <span className="text-[9px] text-gray-500">{ev.store} · {getMagnitudeLabel(ev.magnitude)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-gray-400">{formatBRL(ev.price)}</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                ev.type === "spike"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-[#22c55e]/10 text-[#22c55e]"
              }`}>
                {ev.change > 0 ? "+" : ""}{ev.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1a1a2e] flex items-center justify-between text-[9px] text-gray-600">
        <span>6 LOJAS MONITORADAS · ATUALIZAÇÃO A CADA 4s</span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          H53 SEISMIC ENGINE
        </span>
      </div>
    </div>
  );
}
