'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CleitonEasterEgg() {
  const [clicks, setClicks] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false);

  const handleClick = () => {
    if (showCoupon) return;
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    if (newClicks >= 3) {
      setShowCoupon(true);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <div 
        className={`relative h-16 w-16 overflow-hidden rounded-full cursor-pointer transition-transform ${showCoupon ? 'ring-4 ring-neon scale-110' : 'hover:scale-110 grayscale hover:grayscale-0'}`}
        onClick={handleClick}
        title="Onde está o Cleiton?"
      >
        <Image 
          src="/cleiton.png" 
          alt="Cleiton Mascot" 
          fill
          className="object-cover"
        />
      </div>
      
      {showCoupon && (
        <div className="mt-4 animate-bounce bg-neon text-background px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(204,255,0,0.5)]">
          Você achou o Cleiton! Cupom: CLEITON10
        </div>
      )}
    </div>
  );
}
