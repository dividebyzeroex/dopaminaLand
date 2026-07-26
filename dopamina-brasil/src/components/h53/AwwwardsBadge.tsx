"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { h53Audio } from "@/lib/h53AudioEngine";

export default function AwwwardsBadge() {
  return (
    <motion.a
      href="https://www.awwwards.com"
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => h53Audio.playHover()}
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      whileHover={{ scale: 1.05, x: -5 }}
      className="fixed right-0 top-1/3 z-[10000] hidden md:flex items-center gap-3 bg-[#0a0a0f]/90 border-y border-l border-[#ccff00]/40 pl-4 pr-3 py-3 rounded-l-2xl shadow-[0_0_25px_rgba(204,255,0,0.15)] backdrop-blur-md group text-white cursor-pointer"
    >
      <div className="w-8 h-8 rounded-full bg-[#ccff00] text-black flex items-center justify-center font-black text-xs shrink-0 group-hover:rotate-12 transition-transform">
        W.
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-widest text-[#ccff00] uppercase font-mono">
          NOMINEE 2026
        </span>
        <span className="text-xs font-black font-outfit tracking-tight text-white flex items-center gap-1">
          AWWWARDS SOTD
          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white" />
        </span>
      </div>
    </motion.a>
  );
}
