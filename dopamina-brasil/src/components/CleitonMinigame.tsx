'use client';
import { useState, useEffect } from 'react';

export default function CleitonMinigame() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border-2 border-neon/30 bg-[#0a0a1a] shadow-[0_0_30px_rgba(204,255,0,0.1)]">
      {/* Sun */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-b from-pop via-[#ff00ff] to-[#ffaa00] blur-[2px] shadow-[0_0_60px_rgba(255,0,255,0.6)]" />

      {/* Synthwave Grid Background */}
      <div 
        className="absolute -inset-x-[100%] bottom-0 h-[200%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgTCA0MCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjA0LCAyNTUsIDAsIDAuNCkiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] transition-transform duration-75"
        style={{
          transform: `perspective(300px) rotateX(75deg) translateY(${scrollY}px)`,
          backgroundSize: '40px 40px',
          transformOrigin: 'top center'
        }}
      />
      
      {/* Cleiton */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className="relative h-28 w-28 mb-1 animate-bounce drop-shadow-[0_0_25px_rgba(204,255,0,0.8)]" style={{ animationDuration: '0.4s' }}>
          <img src="/cleiton_nobg.png" alt="Cleiton no Grau" className="w-full h-full object-contain" />
        </div>
        <div className="h-2 w-16 rounded-[100%] bg-black/80 blur-sm"></div>
      </div>

      {/* Speed UI */}
      <div className="absolute top-4 left-4 z-40 bg-background/90 px-4 py-2 rounded-xl border border-neon/50 backdrop-blur-md shadow-lg">
        <p className="text-[10px] uppercase font-bold text-pop">🎮 Scroll para Acelerar</p>
        <p className="text-xl font-black text-neon font-[var(--font-display)]">
          {Math.min(Math.floor(scrollY / 5), 299)} km/h
        </p>
      </div>

      <div className="absolute top-4 right-4 z-40 bg-red-600/90 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider animate-pulse rounded-lg">
        🔴 Ao Vivo
      </div>
    </div>
  );
}
