import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <style>{`
        @keyframes cleiton-vibrate {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-1px, -2px); }
          40% { transform: translate(1px, -1px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes smoke-puff-1 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-80px, -20px) scale(2); opacity: 0; }
        }
        @keyframes smoke-puff-2 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-100px, -10px) scale(2.2); opacity: 0; }
        }
        @keyframes smoke-puff-3 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-60px, -30px) scale(1.8); opacity: 0; }
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-cleiton {
          animation: cleiton-vibrate 0.18s infinite linear;
        }
        .animate-smoke-1 {
          animation: smoke-puff-1 0.7s infinite ease-out;
        }
        .animate-smoke-2 {
          animation: smoke-puff-2 0.7s infinite ease-out 0.25s;
        }
        .animate-smoke-3 {
          animation: smoke-puff-3 0.7s infinite ease-out 0.45s;
        }
        .animate-text-pulse {
          animation: text-pulse 1.5s infinite ease-in-out;
        }
      `}</style>

      <div className="relative flex flex-col items-center">
        {/* Moto do Cleiton Empinando e Vibrando */}
        <div className="relative w-64 h-64 animate-cleiton">
          <Image
            src="/cleiton_wheelie_zombie.png"
            alt="Cleiton Acelerando!"
            fill
            sizes="256px"
            className="object-contain"
            priority
          />
        </div>

        {/* Fumaça Saindo do Pneu Traseiro */}
        <div className="absolute bottom-16 left-6 flex items-center justify-center">
          <div className="absolute w-6 h-6 bg-neon/20 border border-neon/30 rounded-full blur-xs animate-smoke-1" />
          <div className="absolute w-6 h-6 bg-neon/20 border border-neon/30 rounded-full blur-xs animate-smoke-2" />
          <div className="absolute w-6 h-6 bg-neon/20 border border-neon/30 rounded-full blur-xs animate-smoke-3" />
        </div>

        {/* Texto do Loading */}
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-neon animate-text-pulse">
          Acelerando entregas... ⚡
        </p>
      </div>
    </div>
  );
}
