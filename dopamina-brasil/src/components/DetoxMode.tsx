'use client';

import { useState, useEffect, useCallback } from 'react';

export default function DetoxMode() {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const activate = useCallback(() => {
    setActive(true);
    setCountdown(15);
    document.documentElement.classList.add('detox-active');
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
    document.documentElement.classList.remove('detox-active');
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!active) return;
    if (countdown <= 0) {
      deactivate();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [active, countdown, deactivate]);

  // Breathing cycle (4s inhale, 4s hold, 4s exhale)
  useEffect(() => {
    if (!active) return;
    const phases: Array<'inhale' | 'hold' | 'exhale'> = ['inhale', 'hold', 'exhale'];
    let idx = 0;
    const cycle = setInterval(() => {
      idx = (idx + 1) % 3;
      setBreathPhase(phases[idx]);
    }, 4000);
    return () => clearInterval(cycle);
  }, [active]);

  // Escape key
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') deactivate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, deactivate]);

  return (
    <>
      {/* Trigger Button (always visible in bottom-right) */}
      <button
        onClick={activate}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 backdrop-blur-sm transition hover:bg-red-500/20 hover:scale-105 active:scale-95 group"
        title="Chega de Dopamina — Modo Detox"
      >
        <span className="transition group-hover:rotate-12">🧘</span>
        <span className="hidden sm:inline">Chega de Dopamina</span>
      </button>

      {/* Detox Overlay */}
      {active && (
        <div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-3xl cursor-pointer"
          onClick={deactivate}
        >
          {/* Breathing Circle */}
          <div className="relative flex items-center justify-center">
            <div
              className={`rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${
                breathPhase === 'inhale'
                  ? 'h-48 w-48 border-sky-400/50 shadow-[0_0_60px_rgba(56,189,248,0.15)]'
                  : breathPhase === 'hold'
                  ? 'h-48 w-48 border-violet-400/50 shadow-[0_0_80px_rgba(167,139,250,0.2)]'
                  : 'h-24 w-24 border-emerald-400/50 shadow-[0_0_40px_rgba(52,211,153,0.1)]'
              }`}
            />
            <div className="absolute text-center">
              <p className={`text-lg font-light tracking-[0.3em] uppercase transition-colors duration-1000 ${
                breathPhase === 'inhale' ? 'text-sky-300' : breathPhase === 'hold' ? 'text-violet-300' : 'text-emerald-300'
              }`}>
                {breathPhase === 'inhale' ? 'inspire' : breathPhase === 'hold' ? 'segure' : 'expire'}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="mt-12 text-sm text-zinc-500 font-light tracking-wider text-center px-8 max-w-md">
            Você não precisa de mais nada. Respire. O carrinho pode esperar.
          </p>

          {/* Countdown */}
          <p className="mt-8 text-xs text-zinc-600 font-mono">
            {countdown}s
          </p>

          {/* Dismiss hint */}
          <p className="absolute bottom-8 text-[10px] text-zinc-700 tracking-widest uppercase">
            Toque para voltar ao caos
          </p>
        </div>
      )}

      {/* Global CSS for detox mode (grayscale on the page underneath) */}
      <style jsx global>{`
        html.detox-active body > *:not([class*="z-[300]"]) {
          filter: grayscale(1) brightness(0.3) !important;
          transition: filter 1.5s ease;
        }
      `}</style>
    </>
  );
}
