'use client';

import { useState, useEffect } from 'react';

interface FomoEvent {
  name: string;
  action: string;
  icon: string;
}

const FOMO_EVENTS: FomoEvent[] = [
  { name: 'Lucas de São Paulo', action: 'acabou de garantir seus adesivos!', icon: '📦' },
  { name: 'Mariana de Belo Horizonte', action: 'acabou de levar para casa um chaveiro neon dopamina irado!!', icon: '🔑' },
  { name: 'Felipe de Curitiba', action: 'resgatou um copo térmico futurista de graça!!', icon: '🥤' },
  { name: 'Beatriz do Rio de Janeiro', action: 'acabou de garantir o seu óculos led holográfico!!', icon: '👓' },
  { name: 'Renato de Porto Alegre', action: 'levou a camiseta Dopaminado Corp oficial de graça!!', icon: '👕' },
  { name: 'Amanda de Florianópolis', action: 'acabou de garantir seus adesivos!', icon: '📦' },
  { name: 'Gabriel de Salvador', action: 'acabou de levar para casa um chaveiro neon dopamina irado!!', icon: '🔑' },
  { name: 'Isabela de Brasília', action: 'resgatou um copo térmico futurista de graça!!', icon: '🥤' },
  { name: 'Rafael de Fortaleza', action: 'acabou de garantir o seu óculos led holográfico!!', icon: '👓' },
  { name: 'Larissa de Recife', action: 'levou a camiseta Dopaminado Corp oficial de graça!!', icon: '👕' },
];

export default function FomoToast() {
  const [currentEvent, setCurrentEvent] = useState<FomoEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before first toast
    const initialTimer = setTimeout(() => {
      triggerRandomToast();
    }, 8000);

    // Loop interval to trigger toast periodically
    const interval = setInterval(() => {
      triggerRandomToast();
    }, 28000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const triggerRandomToast = () => {
    const randomIdx = Math.floor(Math.random() * FOMO_EVENTS.length);
    setCurrentEvent(FOMO_EVENTS[randomIdx]);
    setIsVisible(true);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  if (!currentEvent) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-[100] flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-white/95 px-4 py-3.5 shadow-2xl backdrop-blur-md max-w-xs transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
        {currentEvent.icon}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1">
          <span>Resgate recente</span>
          <span className="h-1 w-1 rounded-full bg-orange-500 inline-block" />
          <span className="text-[10px] text-muted normal-case font-medium">agora mesmo</span>
        </p>
        <p className="text-xs font-black text-foreground truncate mt-0.5">{currentEvent.name}</p>
        <p className="text-[11px] text-muted leading-snug mt-0.5">{currentEvent.action}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="shrink-0 text-muted hover:text-foreground text-xs self-start"
      >
        ✕
      </button>
    </div>
  );
}
