"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/h53/ScrollReveal";
import { BrainCircuit, LineChart, Eye, Zap, Lock, MoveRight } from "lucide-react";
import { h53Audio } from "@/lib/h53AudioEngine";

export default function CapabilitiesDraggableSlider() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const capabilities = [
    {
      icon: BrainCircuit,
      title: "Neuromarketing Architecture",
      desc: "Desenho de jornadas baseadas em picos de dopamina e heurísticas de decisão irracional.",
      color: "border-[#ccff00] text-[#ccff00]",
    },
    {
      icon: LineChart,
      title: "Predictive Data Intent",
      desc: "Previsão algorítmica de churn e probabilidade de conversão cruzando 40+ variáveis.",
      color: "border-[#a855f7] text-[#a855f7]",
    },
    {
      icon: Eye,
      title: "Dark Pattern Auditing",
      desc: "Engenharia reversa das táticas de manipulação psicológica utilizadas por grandes corporações.",
      color: "border-blue-400 text-blue-400",
    },
    {
      icon: Zap,
      title: "Zero-Friction Checkout",
      desc: "Otimização impiedosa de formulários e pagamentos para destruir o abandono de carrinho.",
      color: "border-red-400 text-red-400",
    },
    {
      icon: Lock,
      title: "LTV Dopamine Loop",
      desc: "Construção de recompensas pós-venda variáveis para criar retenção de longo prazo.",
      color: "border-emerald-400 text-emerald-400",
    },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
        <ScrollReveal>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              [ARRASTE DE LADO PARA EXPLORAR]
            </span>
            <h2 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white">
              Core Capabilities
            </h2>
          </div>
        </ScrollReveal>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500">
          <span>DRAG SLIDER</span>
          <MoveRight className="w-4 h-4 text-[#ccff00] animate-pulse" />
        </div>
      </div>

      <div ref={containerRef} className="cursor-grab active:cursor-grabbing overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -900 }}
          whileTap={{ cursor: "grabbing" }}
          className="flex gap-6 w-max px-6"
        >
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                onMouseEnter={() => h53Audio.playHover()}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`w-[320px] md:w-[380px] p-8 bg-[#0a0a0f]/90 border-2 ${item.color} rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col justify-between min-h-[340px] select-none`}
              >
                <Icon className="w-12 h-12 mb-8" />
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold font-outfit text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
