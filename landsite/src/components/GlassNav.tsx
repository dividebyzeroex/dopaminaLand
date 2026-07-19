'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlassNav() {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create an audio element for ambient sound
    // We'll use a placeholder URL for ambient drone noise
    audioRef.current = new Audio('https://www.soundjay.com/nature/sounds/wind-howl-01.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {
          // Handle autoplay blocks
          console.log("Audio play blocked");
        });
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 glass-nav px-8 py-4 flex justify-between items-center"
    >
      <div className="text-xl font-bold tracking-widest text-white uppercase opacity-90 mix-blend-screen">
        H53
      </div>
      
      <div className="flex items-center space-x-8">
        <button 
          onClick={toggleMute}
          className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-2 text-sm uppercase tracking-widest"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>
    </motion.nav>
  );
}
