'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    num: "01",
    title: "Rastreie os Sinais",
    desc: "O H53 monitora silenciosamente o comportamento digital do seu público, capturando microinterações em tempo real."
  },
  {
    num: "02",
    title: "Decodifique a Intenção",
    desc: "Nossa inteligência analisa o padrão de navegação e identifica exatamente o nível de prontidão para a compra."
  },
  {
    num: "03",
    title: "Aja com Precisão",
    desc: "Você recebe insights claros e automatizados para impactar o usuário no exato momento em que ele quer comprar."
  }
];

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 overflow-hidden">
        
        {/* Title */}
        <div className="absolute top-32 text-center w-full z-10">
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-[0.3em]">Data Intent Dopaminando</span>
        </div>

        {/* Steps */}
        <div className="relative w-full max-w-4xl mx-auto h-[60vh] flex items-center justify-center">
          {steps.map((step, i) => {
            // Safe, strictly increasing ranges for each step (i = 0, 1, 2)
            const ranges = [
              [0, 0.165, 0.4],
              [0.26, 0.5, 0.74],
              [0.6, 0.835, 1]
            ];
            
            const range = ranges[i];

            // Opacity peaks in the middle of its section
            const opacity = useTransform(scrollYProgress, range, [0, 1, 0]);
            
            // Slight upward movement
            const y = useTransform(scrollYProgress, range, [50, 0, -50]);

            // Scale effect
            const scale = useTransform(scrollYProgress, range, [0.9, 1, 1.1]);

            return (
              <motion.div
                key={step.num}
                className="absolute inset-0 flex flex-col items-center justify-center text-center glass-panel p-8 md:p-16 h-full"
                style={{ opacity, y, scale }}
              >
                <div className="text-7xl md:text-9xl font-black text-white/5 mb-6 serif-hero absolute top-4 left-4 pointer-events-none">
                  {step.num}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white serif-hero tracking-tight">
                  {step.title}
                </h2>
                <p className="text-lg md:text-2xl text-white/70 max-w-2xl font-light leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
