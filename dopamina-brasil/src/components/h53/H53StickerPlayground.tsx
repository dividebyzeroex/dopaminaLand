"use client";

import { motion } from "framer-motion";
import { h53Audio } from "@/lib/h53AudioEngine";
import { Zap, Brain, TrendingUp, Flame, ShieldAlert } from "lucide-react";

export default function H53StickerPlayground() {
  const stickers = [
    { id: "s1", text: "⚡ DATA INTENT", icon: Zap, color: "border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10", top: "15%", left: "8%" },
    { id: "s2", text: "🧠 NEUROMARKETING", icon: Brain, color: "border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10", top: "22%", right: "10%" },
    { id: "s3", text: "+240% LTV LIFT", icon: TrendingUp, color: "border-[#22c55e] text-[#22c55e] bg-[#22c55e]/10", top: "68%", left: "5%" },
    { id: "s4", text: "🔥 DARK PATTERNS REVERSED", icon: Flame, color: "border-[#f97316] text-[#f97316] bg-[#f97316]/10", top: "72%", right: "8%" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {stickers.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.id}
            drag
            dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragStart={() => h53Audio.playClick()}
            onDragEnd={() => h53Audio.playScan()}
            whileHover={{ scale: 1.1, rotate: Math.random() * 8 - 4 }}
            whileTap={{ scale: 0.95 }}
            style={{ position: "absolute", top: s.top, left: s.left, right: s.right }}
            className={`pointer-events-auto cursor-grab active:cursor-grabbing px-4 py-2 rounded-full border-2 backdrop-blur-md shadow-2xl flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider select-none ${s.color}`}
          >
            <Icon className="w-4 h-4" />
            <span>{s.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
