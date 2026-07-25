'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { trackEvent } from '@/lib/tracking';

interface Level {
  id: number;
  name: string;
  subtitle: string;
  durationSec: number;
  fomoInterval: number;
  showCountdown: boolean;
  showGhostCursors: boolean;
  showPopups: boolean;
  pulseScreen: boolean;
  vibrate: boolean;
}

const LEVELS: Level[] = [
  { id: 1, name: 'Calma', subtitle: 'Sem truques. Apenas produtos.', durationSec: 25, fomoInterval: 0, showCountdown: false, showGhostCursors: false, showPopups: false, pulseScreen: false, vibrate: false },
  { id: 2, name: 'Tentação', subtitle: 'Descontos e preços riscados aparecem...', durationSec: 25, fomoInterval: 0, showCountdown: false, showGhostCursors: false, showPopups: false, pulseScreen: false, vibrate: false },
  { id: 3, name: 'Pressão', subtitle: 'Alguém está comprando agora...', durationSec: 25, fomoInterval: 3000, showCountdown: false, showGhostCursors: false, showPopups: false, pulseScreen: false, vibrate: false },
  { id: 4, name: 'Desespero', subtitle: 'ÚLTIMAS UNIDADES! Cursores fantasma!', durationSec: 25, fomoInterval: 2000, showCountdown: true, showGhostCursors: true, showPopups: false, pulseScreen: false, vibrate: false },
  { id: 5, name: 'Inferno', subtitle: 'TUDO JUNTO. BOA SORTE.', durationSec: 30, fomoInterval: 1500, showCountdown: true, showGhostCursors: true, showPopups: true, pulseScreen: true, vibrate: true },
];

const PRODUCTS = [
  { name: 'RTX 4090 24GB', price: 56054, discount: 15, image: '🎮' },
  { name: 'MacBook Pro M5 Max', price: 48999, discount: 20, image: '💻' },
  { name: 'PC Gamer Pulse', price: 32000, discount: 25, image: '🖥️' },
  { name: 'RTX 4080 Super', price: 14999, discount: 30, image: '⚡' },
  { name: 'iPhone 17 Pro Max', price: 12999, discount: 10, image: '📱' },
  { name: 'PS6 Digital Edition', price: 4999, discount: 40, image: '🎮' },
  { name: 'AirPods Max Pro', price: 6999, discount: 35, image: '🎧' },
  { name: 'Monitor 4K 240Hz', price: 8999, discount: 18, image: '🖥️' },
];

const FOMO_MESSAGES = [
  'acabou de comprar', 'levou o último', 'adicionou ao carrinho',
  'garantiu agora mesmo', 'não resistiu e comprou', 'resgatou com desconto',
];

const NAMES = ['Lucas', 'Mariana', 'Pedro', 'Julia', 'Gabriel', 'Beatriz', 'Arthur', 'Sofia', 'Enzo', 'Helena'];

export default function ResistanceTraining() {
  const { unlockAchievement } = useGame();
  const [phase, setPhase] = useState<'idle' | 'briefing' | 'playing' | 'gameover' | 'victory'>('idle');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resistanceHP, setResistanceHP] = useState(100);
  const [fomoMessages, setFomoMessages] = useState<{ id: number; text: string }[]>([]);
  const [popups, setPopups] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const fomoIdRef = useRef(0);
  const popupIdRef = useRef(0);
  const startTimeRef = useRef(0);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) setInIframe(true);
  }, []);

  // Show entry button after 15s
  useEffect(() => {
    if (inIframe) return;
    const timer = setTimeout(() => setShowButton(true), 15000);
    return () => clearTimeout(timer);
  }, [inIframe]);

  const level = LEVELS[currentLevel] || LEVELS[0];

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;

    setTimeLeft(level.durationSec);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Level complete — advance
          if (currentLevel < LEVELS.length - 1) {
            setCurrentLevel(c => c + 1);
          } else {
            // Victory!
            setPhase('victory');
            unlockAchievement('dopamine_immune');
            trackEvent('resistance_training_complete' as any, undefined, undefined, {
              totalTime: Math.floor((Date.now() - startTimeRef.current) / 1000),
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentLevel, level.durationSec, unlockAchievement]);

  // FOMO messages
  useEffect(() => {
    if (phase !== 'playing' || level.fomoInterval === 0) return;

    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const action = FOMO_MESSAGES[Math.floor(Math.random() * FOMO_MESSAGES.length)];
      const id = ++fomoIdRef.current;

      setFomoMessages(prev => [...prev.slice(-4), { id, text: `${name} ${action} ${product.name}!` }]);
      setResistanceHP(prev => Math.max(0, prev - (currentLevel * 2)));

      setTimeout(() => setFomoMessages(prev => prev.filter(m => m.id !== id)), 4000);
    }, level.fomoInterval);

    return () => clearInterval(interval);
  }, [phase, level.fomoInterval, currentLevel]);

  // Aggressive popups (Level 5)
  useEffect(() => {
    if (phase !== 'playing' || !level.showPopups) return;

    const interval = setInterval(() => {
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const id = ++popupIdRef.current;
      setPopups(prev => [...prev.slice(-2), {
        id,
        text: `🔥 ÚLTIMA UNIDADE! ${product.name} por R$ ${product.price.toLocaleString('pt-BR')} — COMPRE AGORA!`,
        x: 10 + Math.random() * 60,
        y: 15 + Math.random() * 50,
      }]);
      setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 3000);
    }, 2500);

    return () => clearInterval(interval);
  }, [phase, level.showPopups]);

  // Vibration (Level 5)
  useEffect(() => {
    if (phase !== 'playing' || !level.vibrate) return;
    const interval = setInterval(() => {
      try { navigator.vibrate?.(100); } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [phase, level.vibrate]);

  const startTraining = () => {
    setPhase('playing');
    setCurrentLevel(0);
    setResistanceHP(100);
    setFomoMessages([]);
    setPopups([]);
    startTimeRef.current = Date.now();
    trackEvent('resistance_training_start' as any);
  };

  const handleFail = () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setSurvivalTime(elapsed);
    setPhase('gameover');
    trackEvent('resistance_training_fail' as any, undefined, undefined, {
      level: currentLevel + 1,
      survivalSeconds: elapsed,
    });
  };

  if (inIframe) return null;

  return (
    <>
      {/* Entry Button */}
      {showButton && phase === 'idle' && (
        <button
          onClick={() => setPhase('briefing')}
          className="fixed bottom-[130px] right-6 z-[89] flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 backdrop-blur-sm transition hover:bg-amber-500/20 hover:scale-105 active:scale-95"
        >
          <span>🛡️</span>
          <span className="hidden sm:inline">Treinamento de Resistência</span>
        </button>
      )}

      {/* Briefing Modal */}
      {phase === 'briefing' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-md mx-4 rounded-3xl border border-amber-500/20 bg-zinc-950 p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-black text-amber-400 mb-2">TREINAMENTO DE RESISTÊNCIA</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Navegue por 5 níveis de manipulação crescente.<br/>
              <span className="text-red-400 font-bold">NÃO clique em nenhum botão de compra.</span><br/>
              Se clicar, você perde.
            </p>

            <div className="space-y-2 mb-6 text-left">
              {LEVELS.map(l => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2">
                  <span className="text-xs font-black text-amber-400 w-6">N{l.id}</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{l.name}</p>
                    <p className="text-[10px] text-zinc-500">{l.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startTraining}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400 active:scale-95"
            >
              INICIAR MISSÃO 🎯
            </button>
            <button onClick={() => setPhase('idle')} className="text-xs text-zinc-500 mt-3 hover:text-zinc-300 transition">
              cancelar
            </button>
          </div>
        </div>
      )}

      {/* Game HUD */}
      {phase === 'playing' && (
        <>
          {/* Top HUD */}
          <div className="fixed top-0 left-0 right-0 z-[250] bg-zinc-950/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-2">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-black text-xs">NÍVEL {level.id}</span>
                <span className="text-zinc-500 text-[10px]">{level.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500">TEMPO</p>
                  <p className={`text-sm font-black tabular-nums ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-zinc-200'}`}>
                    {timeLeft}s
                  </p>
                </div>
                <div className="w-24">
                  <p className="text-[9px] text-zinc-500 mb-0.5">RESISTÊNCIA</p>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${resistanceHP}%`,
                        backgroundColor: resistanceHP > 60 ? '#22c55e' : resistanceHP > 30 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => { setPhase('idle'); setShowButton(true); }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Desistir
                </button>
              </div>
            </div>
          </div>

          {/* Level-specific effects */}
          {level.pulseScreen && (
            <div
              className="fixed inset-0 z-[240] pointer-events-none"
              style={{ animation: 'pulseBorder 1s ease-in-out infinite', boxShadow: 'inset 0 0 80px rgba(239, 68, 68, 0.3)' }}
            />
          )}

          {/* Countdown timers on products (Level 4+) */}
          {level.showCountdown && (
            <div className="fixed top-14 left-4 z-[245] space-y-1 pointer-events-none">
              {PRODUCTS.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 backdrop-blur-sm">
                  <span className="text-red-400 text-xs font-bold animate-pulse">⏰</span>
                  <span className="text-[10px] text-zinc-300">{p.name}: <span className="text-red-400 font-bold">{Math.floor(Math.random() * 3) + 1} restantes!</span></span>
                </div>
              ))}
            </div>
          )}

          {/* FOMO messages */}
          <div className="fixed top-14 right-4 z-[245] space-y-2 w-[250px] pointer-events-none">
            {fomoMessages.map(msg => (
              <div key={msg.id} className="rounded-lg border border-neon/20 bg-zinc-900/90 backdrop-blur-md px-3 py-2 animate-slide-in-right">
                <p className="text-[10px] text-zinc-300">🔥 {msg.text}</p>
              </div>
            ))}
          </div>

          {/* Aggressive popups (Level 5) */}
          {popups.map(popup => (
            <div
              key={popup.id}
              className="fixed z-[260] w-[280px] rounded-2xl border-2 border-red-500/50 bg-zinc-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-red-500/20 animate-bounce"
              style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
            >
              <p className="text-xs text-zinc-200 font-bold mb-2">{popup.text}</p>
              <button
                onClick={handleFail}
                className="w-full rounded-xl bg-red-500 py-2 text-xs font-black text-white animate-pulse"
              >
                COMPRAR AGORA!!! 🔥
              </button>
              <button
                onClick={() => setPopups(prev => prev.filter(p => p.id !== popup.id))}
                className="w-full text-[9px] text-zinc-500 mt-1 hover:text-zinc-300"
              >
                Não, obrigado (fechar)
              </button>
            </div>
          ))}
        </>
      )}

      {/* Game Over */}
      {phase === 'gameover' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-md mx-4 rounded-3xl border border-red-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-black text-red-400 mb-2">VOCÊ CAIU.</h2>
            <p className="text-4xl font-black text-zinc-200 mb-2">{survivalTime}s</p>
            <p className="text-zinc-500 text-sm mb-4">
              Você durou {survivalTime} segundos.<br/>
              A indústria gastou <span className="text-neon font-bold">R$ 2.3 trilhões</span> em 2024 pra garantir que você falhasse.
            </p>
            <p className="text-xs text-zinc-600 mb-6">
              Nível alcançado: {currentLevel + 1}/5 — {LEVELS[currentLevel]?.name}
            </p>
            <button
              onClick={() => { setPhase('briefing'); setCurrentLevel(0); }}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400 active:scale-95 mb-2"
            >
              TENTAR NOVAMENTE 🔄
            </button>
            <button onClick={() => { setPhase('idle'); setShowButton(true); }} className="text-xs text-zinc-500 hover:text-zinc-300 transition">
              fechar
            </button>
          </div>
        </div>
      )}

      {/* Victory */}
      {phase === 'victory' && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-md mx-4 rounded-3xl border border-amber-500/30 bg-zinc-950 p-8 text-center shadow-2xl shadow-amber-500/10">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-black text-amber-400 mb-2">IMUNE À DOPAMINA!</h2>
            <p className="text-zinc-400 text-sm mb-4">
              Você resistiu a <span className="text-amber-400 font-bold">5 níveis</span> de manipulação psicológica.<br/>
              Menos de 3% das pessoas conseguem.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
              <p className="text-xs text-amber-400 font-bold">🏆 Achievement Desbloqueado</p>
              <p className="text-sm text-zinc-200 font-bold mt-1">🛡️ Imune à Dopamina — +500 XP</p>
            </div>
            <button
              onClick={() => { setPhase('idle'); setShowButton(true); }}
              className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400 active:scale-95"
            >
              VOLTAR À LOJA 🏪
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulseBorder {
          0%, 100% { box-shadow: inset 0 0 40px rgba(239, 68, 68, 0.15); }
          50% { box-shadow: inset 0 0 100px rgba(239, 68, 68, 0.35); }
        }
      `}</style>
    </>
  );
}
