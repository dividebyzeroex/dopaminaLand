'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export default function CinematicBackground() {
  const { scrollYProgress } = useScroll();
  
  // Fade out particles as we scroll down
  const particlesOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const particlesScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  
  // Fade in fog as we scroll to the middle
  const fogOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.8, 1], [0, 0.6, 0.6, 0]);
  const fogY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-black">
      {/* Light Leaks Overlay (Fixed in corners, always visible) */}
      <div className="absolute inset-0 mix-blend-screen opacity-60">
        <Image 
          src="/images/light-leak.png" 
          alt="" 
          fill 
          className="object-cover object-left-top scale-110" 
          priority
        />
      </div>

      {/* Hero Particles */}
      <motion.div 
        className="absolute inset-0 mix-blend-screen"
        style={{ opacity: particlesOpacity, scale: particlesScale }}
      >
        <Image 
          src="/images/hero-particles.png" 
          alt="" 
          fill 
          className="object-cover" 
          priority
        />
      </motion.div>

      {/* Mid-section Fog */}
      <motion.div 
        className="absolute inset-0 mix-blend-screen"
        style={{ opacity: fogOpacity, y: fogY }}
      >
        <Image 
          src="/images/cinematic-bg.png" 
          alt="" 
          fill 
          className="object-cover" 
        />
      </motion.div>
      
      {/* Deep shadow gradient at the bottom to fade to black */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
