'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // Set initial center
    if (typeof window !== 'undefined') {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }
  }, [mouseX, mouseY]);

  function handleMouseMove({ clientX, clientY }: React.MouseEvent) {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // The mask image will be a radial gradient following the mouse
  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020202] text-center px-4"
    >
      {/* Subtle looping abstract motion gradient */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-cyan-900 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-900 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      {/* Thin positioning line */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-cyan-400 uppercase tracking-[0.2em] text-xs font-semibold mb-8 z-20"
      >
        Design & Data Intelligence
      </motion.p>

      {/* Kinetic Text Area */}
      <div className="relative z-10 w-full max-w-6xl mx-auto cursor-default">
        {/* Dimmed background text */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black serif-display text-white/10 leading-[1.1] tracking-tight">
          Nós construímos marcas que duram gerações.
        </h1>
        
        {/* Highlighted text revealing on hover via mask */}
        <motion.h1 
          className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black serif-display text-white leading-[1.1] tracking-tight"
          style={{
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
          }}
        >
          Nós construímos marcas que duram gerações.
        </motion.h1>
      </div>

      {/* Small Glowing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-16 z-20"
      >
        <button className="relative px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 group overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-sm tracking-wider font-light">Conheça nosso trabalho</span>
        </button>
      </motion.div>
    </section>
  );
}
