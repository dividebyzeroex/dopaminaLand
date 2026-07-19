'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useCart } from '@/contexts/CartContext';

export default function DopamineMeter() {
  const { xp } = useGame();
  const { totalFakePrice } = useCart();
  
  const [displayedDopamine, setDisplayedDopamine] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Calcula a dopamina baseada no XP real + um bônus pelo carrinho atual (para dar efeito na hora)
  const currentDopamine = xp + (totalFakePrice > 0 ? 50 + (totalFakePrice / 1000) : 0);
  
  // Limites imaginários para níveis de dopamina
  const maxDopamine = 1000;
  const progressPercentage = Math.min((displayedDopamine / maxDopamine) * 100, 100);

  useEffect(() => {
    if (currentDopamine > displayedDopamine) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => setIsLevelingUp(false), 1000);
      setDisplayedDopamine(currentDopamine);
      return () => clearTimeout(timer);
    }
    setDisplayedDopamine(currentDopamine);
  }, [currentDopamine, displayedDopamine]);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm pointer-events-none">
      <div className={`bg-card/90 backdrop-blur border ${isLevelingUp ? 'border-neon shadow-[0_0_15px_rgba(255,30,122,0.5)] animate-pulse' : 'border-border'} rounded-full p-1.5 flex items-center gap-3 transition-all duration-300`}>
        <div className="shrink-0 bg-surface-light rounded-full w-8 h-8 flex items-center justify-center text-sm">
          ⚡
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="text-foreground">Dopamina Nível</span>
            <span className="text-neon">{Math.floor(displayedDopamine)} XP</span>
          </div>
          <div className="h-2 w-full bg-surface-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple via-neon to-neon-light rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
