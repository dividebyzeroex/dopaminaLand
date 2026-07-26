"use client";

import { motion } from "framer-motion";
import { Zap, Eye, Radio } from "lucide-react";
import { h53Audio } from "@/lib/h53AudioEngine";

interface H53ModeSwitcherProps {
  currentMode: "standard" | "cyber" | "chaos";
  onModeChange: (mode: "standard" | "cyber" | "chaos") => void;
}

export default function H53ModeSwitcher({ currentMode, onModeChange }: H53ModeSwitcherProps) {
  const modes = [
    { id: "standard", label: "STANDARD", icon: Eye, activeColor: "bg-[#ccff00] text-black" },
    { id: "cyber", label: "CYBERINTEL", icon: Radio, activeColor: "bg-[#a855f7] text-white" },
    { id: "chaos", label: "CHAOS", icon: Zap, activeColor: "bg-red-500 text-white" },
  ] as const;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-[#0a0a0f]/90 border border-white/10 p-1.5 rounded-full backdrop-blur-xl flex items-center gap-1 shadow-2xl">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => {
              h53Audio.playScan();
              onModeChange(mode.id as any);
            }}
            className={`relative px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isActive ? mode.activeColor : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
