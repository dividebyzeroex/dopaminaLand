"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, Share2, AlertTriangle, Camera, Clock, FastForward } from "lucide-react";

interface ForensicReplayProps {
  productName?: string;
  basePrice?: number;
}

function generateTimeline(basePrice: number) {
  const points: { month: string; price: number; event?: string; isFraud?: boolean }[] = [];
  const now = new Date();
  let price = basePrice * 0.95;

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const isNov = d.getMonth() === 10;
    const isDec = d.getMonth() === 11;
    const isOct = d.getMonth() === 9;

    if (isOct) {
      price = basePrice * 1.22;
      points.push({ month: monthLabel, price: Math.round(price), event: "⚠️ INFLAÇÃO PRÉ-BLACK FRIDAY: Preço inflado artificialmente +22%", isFraud: true });
    } else if (isNov) {
      price = basePrice * 1.01;
      points.push({ month: monthLabel, price: Math.round(price), event: "🏷️ BLACK FRIDAY: 'Desconto' de 17% — na verdade voltou ao preço normal", isFraud: true });
    } else if (isDec) {
      price = basePrice * 1.05;
      points.push({ month: monthLabel, price: Math.round(price), event: "🎄 Natal: Preço estável pós-fraude" });
    } else {
      const drift = (Math.random() - 0.4) * basePrice * 0.05;
      price = price + drift;
      price = Math.max(basePrice * 0.88, Math.min(basePrice * 1.1, price));
      points.push({ month: monthLabel, price: Math.round(price) });
    }
  }

  return points;
}

export default function ForensicReplay({ productName = "iPhone 16 Pro Max 256GB", basePrice = 8999 }: ForensicReplayProps) {
  const [timeline, setTimeline] = useState<ReturnType<typeof generateTimeline>>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeline(generateTimeline(basePrice));
  }, [basePrice]);

  useEffect(() => {
    if (isPlaying && timeline.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, timeline.length]);

  const handlePlay = () => {
    if (currentFrame >= timeline.length - 1) setCurrentFrame(0);
    setIsPlaying(true);
  };

  if (timeline.length === 0) return null;

  const current = timeline[currentFrame];
  const prices = timeline.map((t) => t.price);
  const minP = Math.min(...prices) * 0.95;
  const maxP = Math.max(...prices) * 1.05;
  const range = maxP - minP;
  const toY = (v: number) => ((maxP - v) / range) * 160;

  const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const progress = ((currentFrame + 1) / timeline.length) * 100;

  return (
    <div className="w-full rounded-2xl bg-[#08080d] border border-[#1a1a2e] overflow-hidden font-mono shadow-[0_0_60px_rgba(239,68,68,0.1)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-950/30 to-[#08080d] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-red-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">FORENSIC REPLAY</span>
          {isPlaying && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[9px] text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              REC
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500">{productName}</span>
      </div>

      {/* Video Player Area */}
      <div className="relative px-4 py-4">
        {/* Timeline Chart */}
        <svg viewBox={`0 0 ${timeline.length * 50} 180`} className="w-full h-32 sm:h-40">
          {/* Horizontal grid */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line key={pct} x1={0} y1={pct * 160} x2={timeline.length * 50} y2={pct * 160} stroke="#111122" strokeWidth={0.5} />
          ))}

          {/* Price line (drawn up to current frame) */}
          <path
            d={timeline.slice(0, currentFrame + 1).map((t, i) => `${i === 0 ? "M" : "L"} ${i * 50 + 25} ${toY(t.price)}`).join(" ")}
            fill="none"
            stroke={current?.isFraud ? "#ef4444" : "#22c55e"}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area fill */}
          {currentFrame > 0 && (
            <path
              d={
                timeline.slice(0, currentFrame + 1).map((t, i) => `${i === 0 ? "M" : "L"} ${i * 50 + 25} ${toY(t.price)}`).join(" ") +
                ` L ${currentFrame * 50 + 25} 160 L 25 160 Z`
              }
              fill={current?.isFraud ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)"}
            />
          )}

          {/* Dots */}
          {timeline.slice(0, currentFrame + 1).map((t, i) => (
            <g key={i}>
              <circle
                cx={i * 50 + 25} cy={toY(t.price)} r={i === currentFrame ? 6 : 3}
                fill={t.isFraud ? "#ef4444" : "#22c55e"}
                opacity={i === currentFrame ? 1 : 0.5}
              />
              {i === currentFrame && (
                <circle cx={i * 50 + 25} cy={toY(t.price)} r={12} fill="none" stroke={t.isFraud ? "#ef4444" : "#22c55e"} strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" values="8;16" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {t.isFraud && (
                <text x={i * 50 + 25} y={toY(t.price) - 14} textAnchor="middle" fill="#ef4444" fontSize="16">⚠️</text>
              )}
            </g>
          ))}
        </svg>

        {/* Current Frame Info Overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-2 p-3 rounded-xl border text-xs ${
              current?.isFraud
                ? "bg-red-500/10 border-red-500/30"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold capitalize">{current.month}</span>
              <span className={`font-black text-base ${current.isFraud ? "text-red-400" : "text-white"}`}>
                {formatBRL(current.price)}
              </span>
            </div>
            {current.event && (
              <p className={`mt-1 text-[11px] font-bold ${current.isFraud ? "text-red-400" : "text-gray-400"}`}>
                {current.event}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-1">
        <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentFrame(Math.round(pct * (timeline.length - 1)));
        }}>
          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-gray-600 mt-0.5">
          <span>{timeline[0]?.month}</span>
          <span>{timeline[timeline.length - 1]?.month}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="px-4 py-2.5 border-t border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => isPlaying ? setIsPlaying(false) : handlePlay()}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors active:scale-90"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            {speed}x
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono">
            {currentFrame + 1}/{timeline.length} frames
          </span>
          <button className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            Compartilhar Denúncia
          </button>
        </div>
      </div>
    </div>
  );
}
