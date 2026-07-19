'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section className="relative h-screen w-full flex flex-col items-center justify-center pt-20 px-4">
        {/* Oversized Serif Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="text-center z-10 max-w-5xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 serif-hero leading-[1.1]">
            Converta intenção em lucro com precisão cirúrgica.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            O H53 é uma plataforma de inteligência para líderes de marketing. Ele mapeia sinais invisíveis de navegação para que você entregue a oferta certa no momento exato.
          </p>
        </motion.div>

        {/* Circular Play Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-24 z-20 flex flex-col items-center gap-4"
        >
          <button 
            onClick={() => setIsVideoOpen(true)}
            className="relative w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-900/40 transition-all duration-500 group pulse-circle"
          >
            <span className="text-xs uppercase tracking-widest font-semibold group-hover:scale-110 transition-transform">
              Play
            </span>
          </button>
          <span className="text-xs uppercase tracking-widest text-white/50">
            Quero antecipar vendas
          </span>
        </motion.div>
      </section>

      {/* Fullscreen Video Overlay */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-8 right-8 z-[101] text-white/50 hover:text-white transition-colors p-4"
            >
              <X size={32} />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center border border-white/10 m-8 rounded-2xl bg-white/5 relative overflow-hidden">
              {/* Placeholder for actual video */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <span className="text-4xl font-light tracking-widest text-white/50 mb-4">SHOWREEL</span>
                <p className="text-cyan-400 font-mono text-sm max-w-md">
                  [ Video Embed Placeholder ]<br/><br/>
                  Aguardando a URL do vídeo de demonstração do H53.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
