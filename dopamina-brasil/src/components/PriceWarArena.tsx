"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Crown, Shield, Flame, ExternalLink } from "lucide-react";

interface Combatant {
  store: string;
  color: string;
  price: number;
  freight: number;
  cashback: number;
  coupon: string;
  couponDiscount: number;
  installments: string;
  deliveryDays: number;
  trustScore: number;
}

interface BattlePair {
  product: string;
  emoji: string;
  left: Combatant;
  right: Combatant;
}

const battles: BattlePair[] = [
  {
    product: "iPhone 16 Pro Max 256GB",
    emoji: "📱",
    left: { store: "Fast Shop", color: "#3b82f6", price: 9499, freight: 0, cashback: 0, coupon: "FAST10", couponDiscount: 949.9, installments: "12x R$ 791,58", deliveryDays: 3, trustScore: 88 },
    right: { store: "Amazon Brasil", color: "#f97316", price: 8999, freight: 0, cashback: 450, coupon: "PRIME10", couponDiscount: 899.9, installments: "10x R$ 899,90", deliveryDays: 2, trustScore: 95 },
  },
  {
    product: "PlayStation 5 Slim",
    emoji: "🎮",
    left: { store: "Kabum!", color: "#f97316", price: 3799, freight: 29.90, cashback: 0, coupon: "NINJA10", couponDiscount: 379.9, installments: "12x R$ 316,58", deliveryDays: 5, trustScore: 82 },
    right: { store: "Mercado Livre", color: "#ffe600", price: 3499, freight: 0, cashback: 175, coupon: "MELI10", couponDiscount: 349.9, installments: "12x R$ 291,58", deliveryDays: 4, trustScore: 79 },
  },
  {
    product: "MacBook Air M3 15\"",
    emoji: "💻",
    left: { store: "Fast Shop", color: "#3b82f6", price: 13499, freight: 0, cashback: 0, coupon: "FAST10", couponDiscount: 1349.9, installments: "12x R$ 1.124,92", deliveryDays: 4, trustScore: 88 },
    right: { store: "Magalu", color: "#0086ff", price: 12999, freight: 0, cashback: 650, coupon: "MAGALU10", couponDiscount: 1299.9, installments: "12x R$ 1.083,25", deliveryDays: 3, trustScore: 91 },
  },
];

function getTotalCost(c: Combatant) {
  return c.price + c.freight - c.cashback - c.couponDiscount;
}

export default function PriceWarArena() {
  const [activeBattle, setActiveBattle] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const battle = battles[activeBattle];
  const leftTotal = getTotalCost(battle.left);
  const rightTotal = getTotalCost(battle.right);
  const winner = leftTotal <= rightTotal ? "left" : "right";
  const winnerData = winner === "left" ? battle.left : battle.right;
  const savings = Math.abs(leftTotal - rightTotal);

  const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const handleFight = () => {
    setShowResult(false);
    setTimeout(() => setShowResult(true), 800);
  };

  const renderStats = (c: Combatant, side: "left" | "right") => {
    const isWinner = showResult && winner === side;
    return (
      <div className={`flex-1 p-3 rounded-xl border transition-all ${
        isWinner ? "bg-[#22c55e]/10 border-[#22c55e]/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "bg-white/[0.02] border-white/10"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-white">{c.store}</span>
          {isWinner && <Crown className="w-4 h-4 text-amber-400" />}
        </div>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Preço</span>
            <span className="text-white font-bold">{formatBRL(c.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Frete</span>
            <span className={c.freight === 0 ? "text-[#22c55e] font-bold" : "text-red-400"}>{c.freight === 0 ? "GRÁTIS" : formatBRL(c.freight)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cashback</span>
            <span className="text-[#22c55e]">{c.cashback > 0 ? `-${formatBRL(c.cashback)}` : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cupom ({c.coupon})</span>
            <span className="text-amber-400">-{formatBRL(c.couponDiscount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Parcelas</span>
            <span className="text-gray-300">{c.installments}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Entrega</span>
            <span className="text-gray-300">{c.deliveryDays} dias úteis</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Trust Score</span>
            <span className={c.trustScore >= 90 ? "text-[#22c55e]" : c.trustScore >= 80 ? "text-amber-400" : "text-red-400"}>{c.trustScore}/100</span>
          </div>

          <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
            <span className="text-white font-bold">CUSTO REAL TOTAL</span>
            <span className={`font-black text-sm ${isWinner ? "text-[#22c55e]" : "text-white"}`}>
              {formatBRL(side === "left" ? leftTotal : rightTotal)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-[#080810] border border-purple-500/20 overflow-hidden font-mono shadow-[0_0_60px_rgba(168,85,247,0.08)]">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-950/40 to-[#080810] border-b border-[#1a1a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">PRICE WAR ARENA</span>
        </div>
        <span className="text-[10px] text-purple-400 font-bold">CUSTO REAL TOTAL vs TOTAL</span>
      </div>

      {/* Battle Selector */}
      <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto pb-2">
        {battles.map((b, i) => (
          <button
            key={i}
            onClick={() => { setActiveBattle(i); setShowResult(false); }}
            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all active:scale-95 ${
              i === activeBattle ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {b.emoji} {b.product}
          </button>
        ))}
      </div>

      {/* Arena */}
      <div className="p-4 space-y-3">
        {/* VS Header */}
        <div className="flex items-center justify-center gap-4 py-2">
          <span className="text-sm font-bold text-white">{battle.left.store}</span>
          <div className="relative">
            <span className="text-2xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">VS</span>
          </div>
          <span className="text-sm font-bold text-white">{battle.right.store}</span>
        </div>

        {/* Stats Comparison */}
        <div className="flex gap-3">
          {renderStats(battle.left, "left")}
          {renderStats(battle.right, "right")}
        </div>

        {/* Fight Button / Result */}
        {!showResult ? (
          <button
            onClick={handleFight}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <Swords className="w-4 h-4" />
            FIGHT — CALCULAR CUSTO REAL TOTAL
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/40 text-center space-y-1"
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-black text-[#22c55e]">
                {winnerData.store} VENCE!
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Custo real total: <strong className="text-[#22c55e]">{formatBRL(Math.min(leftTotal, rightTotal))}</strong> — Economia de <strong className="text-[#22c55e]">{formatBRL(savings)}</strong> vs {winner === "left" ? battle.right.store : battle.left.store}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
