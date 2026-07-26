"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { h53Audio } from "@/lib/h53AudioEngine";

export default function LamaLamaHeroHeader() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: (y / rect.height) * -20, y: (x / rect.width) * 20 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative z-10 my-4 cursor-pointer"
    >
      <motion.h1
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-5xl sm:text-7xl md:text-[8rem] font-black font-outfit tracking-tighter leading-[0.82] text-center select-none"
      >
        <span
          onMouseEnter={() => h53Audio.playHover()}
          className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 hover:to-[#ccff00] transition-colors duration-300"
        >
          WE DECODE
        </span>
        <span
          onMouseEnter={() => h53Audio.playHover()}
          className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] via-[#a855f7] to-white hover:from-white transition-colors duration-300"
        >
          HUMAN INTENT.
        </span>
      </motion.h1>
    </div>
  );
}
