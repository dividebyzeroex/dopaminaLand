'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export default function ShowcaseGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax calculations
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [200, -150]);

  return (
    <section ref={containerRef} className="w-full py-32 px-4 md:px-12 bg-[#050505] relative z-10">
      
      <div className="max-w-7xl mx-auto flex flex-col gap-32">
        
        {/* Row 1: The glowing Data Intent splashing liquid (4:5) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black serif-display mb-6">A essência dos dados, tangível.</h2>
            <p className="text-white/60 text-lg max-w-md font-light leading-relaxed">
              Transformamos informações abstratas em impacto visual. Cada decisão é apoiada por intenções reais, modeladas com precisão cirúrgica e design excepcional.
            </p>
          </div>
          <motion.div style={{ y: y1 }} className="w-full md:w-1/2 flex justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-900/20 mix-blend-color-burn z-10 transition-opacity duration-700 group-hover:opacity-0" />
              <Image 
                src="/images/intent.png" 
                alt="Data Intent Abstract" 
                fill 
                className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              />
            </div>
          </motion.div>
        </div>

        {/* Row 2: Full width cinematic particles (16:9) */}
        <motion.div style={{ y: y2 }} className="w-full">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden group">
            <Image 
              src="/images/particles.png" 
              alt="Glowing Particles" 
              fill 
              className="object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 max-w-lg z-20">
              <h3 className="text-3xl font-black serif-display mb-2">Fluxos Inteligentes</h3>
              <p className="text-white/70 font-light">Mapeamos o caos para encontrar o padrão perfeito.</p>
            </div>
          </div>
        </motion.div>

        {/* Row 3: Defocused Bokeh (16:9) and closing text */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-16">
          <motion.div style={{ y: y3 }} className="w-full md:w-1/2">
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden group">
              <Image 
                src="/images/bokeh.png" 
                alt="Defocused Bokeh" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70"
              />
            </div>
          </motion.div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black serif-display mb-6">Foco no que importa.</h2>
            <p className="text-white/60 text-lg max-w-md font-light leading-relaxed">
              Removemos o ruído. Nossa abordagem minimalista garante que a sua mensagem central brilhe com clareza e autoridade, conectando-se diretamente com o seu público.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
