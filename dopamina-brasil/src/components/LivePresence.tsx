'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PresenceEvent {
  nickname: string;
  action: string;
  product?: string;
  city?: string;
  timestamp: number;
}

// Simulated activity based on time of day + randomness
const SIMULATED_ACTIONS = [
  { action: 'adicionou ao carrinho', product: 'RTX 4090 24GB', icon: '🛒' },
  { action: 'adicionou ao carrinho', product: 'MacBook Pro M5 Max', icon: '🛒' },
  { action: 'adicionou ao carrinho', product: 'PC Gamer Pulse', icon: '🛒' },
  { action: 'está olhando', product: 'RTX 4080 Super', icon: '👀' },
  { action: 'está olhando', product: 'MacBook Pro 14"', icon: '👀' },
  { action: 'fez checkout de', product: 'RTX 4090 + PC Gamer', icon: '⚡' },
  { action: 'fez checkout de', product: 'MacBook Pro 16"', icon: '⚡' },
  { action: 'ativou o Modo Vício', product: undefined, icon: '🔥' },
  { action: 'completou o Treinamento de Resistência', product: undefined, icon: '🛡️' },
  { action: 'abriu a Loot Box', product: undefined, icon: '🎰' },
  { action: 'compartilhou um recibo', product: undefined, icon: '📤' },
];

const NAMES = [
  'Lucas', 'Gabriel', 'Pedro', 'Matheus', 'João', 'Enzo', 'Gustavo', 'Mariana',
  'Beatriz', 'Julia', 'Camila', 'Larissa', 'Isabela', 'Amanda', 'Arthur', 'Sofia',
  'Carolina', 'Alice', 'Helena', 'Diego', 'Eduardo', 'Henrique', 'Murilo', 'Vanessa',
];

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Florianópolis', 'Salvador', 'Brasília', 'Recife', 'Fortaleza', 'Campinas',
  'Niterói', 'Joinville', 'Goiânia', 'Belém', 'Manaus', 'Natal', 'Vitória',
];

function getBaseOnlineCount(): number {
  const hour = new Date().getHours();
  // Simulate traffic patterns — peak at night (when dopamine shopping happens)
  if (hour >= 0 && hour < 6) return 15 + Math.floor(Math.random() * 20);
  if (hour >= 6 && hour < 10) return 30 + Math.floor(Math.random() * 30);
  if (hour >= 10 && hour < 14) return 60 + Math.floor(Math.random() * 40);
  if (hour >= 14 && hour < 18) return 80 + Math.floor(Math.random() * 50);
  if (hour >= 18 && hour < 22) return 120 + Math.floor(Math.random() * 80);
  return 90 + Math.floor(Math.random() * 60); // 22-24
}

export default function LivePresence() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [events, setEvents] = useState<(PresenceEvent & { id: number; icon: string })[]>([]);
  const [ghostCursors, setGhostCursors] = useState<{ id: number; x: number; y: number; color: string; name: string }[]>([]);
  const eventIdRef = useRef(0);
  const cursorIdRef = useRef(0);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) setInIframe(true);
  }, []);

  // Fluctuating online count
  useEffect(() => {
    if (inIframe) return;
    setOnlineCount(getBaseOnlineCount());
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(8, prev + delta);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [inIframe]);

  // Simulated activity events
  useEffect(() => {
    if (inIframe) return;

    const spawnEvent = () => {
      const action = SIMULATED_ACTIONS[Math.floor(Math.random() * SIMULATED_ACTIONS.length)];
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const id = ++eventIdRef.current;

      setEvents(prev => [
        ...prev.slice(-2),
        { id, nickname: name, action: action.action, product: action.product, city, timestamp: Date.now(), icon: action.icon },
      ]);

      // Auto-remove after 6s
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== id));
      }, 6000);
    };

    // First event after 15s
    const initialTimer = setTimeout(spawnEvent, 15000);

    // Then every 30s
    const interval = setInterval(() => {
      if (Math.random() > 0.6) spawnEvent(); // 40% chance each tick
    }, 30000);

    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, [inIframe]);

  // Ghost cursors
  useEffect(() => {
    if (inIframe) return;

    const spawnCursor = () => {
      const colors = ['#ccff00', '#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b', '#ec4899'];
      const id = ++cursorIdRef.current;
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const cursor = {
        id,
        x: 15 + Math.random() * 70, // % of viewport
        y: 10 + Math.random() * 70,
        color: colors[Math.floor(Math.random() * colors.length)],
        name,
      };

      setGhostCursors(prev => [...prev.slice(-3), cursor]);

      // Move it around then remove
      const moveInterval = setInterval(() => {
        setGhostCursors(prev =>
          prev.map(c =>
            c.id === id
              ? { ...c, x: c.x + (Math.random() * 6 - 3), y: c.y + (Math.random() * 4 - 2) }
              : c
          )
        );
      }, 300);

      setTimeout(() => {
        clearInterval(moveInterval);
        setGhostCursors(prev => prev.filter(c => c.id !== id));
      }, 4000);
    };

    // Spawn ghost cursors periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.8) spawnCursor();
    }, 45000);

    // First cursor after 20s
    const timer = setTimeout(spawnCursor, 20000);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [inIframe]);

  if (inIframe) return null;

  return (
    <>
      {/* Online Counter — fixed top bar accent */}
      <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 rounded-full border border-emerald-500/20 bg-zinc-950/80 backdrop-blur-md px-4 py-1.5 shadow-lg shadow-emerald-500/5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
          {onlineCount} pessoas online agora
        </span>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          [Dark Pattern: Prova Social]
        </span>
      </div>

      {/* Activity Toasts — right side */}
      <div className="fixed top-[120px] right-4 z-[75] flex flex-col gap-2 w-[280px] max-w-[80vw] pointer-events-none">
        {events.map((event) => (
          <div
            key={event.id}
            className="animate-slide-in-right rounded-xl border border-zinc-700/50 bg-zinc-900/90 backdrop-blur-md p-3 shadow-lg"
            style={{ animation: 'slideInRight 0.4s ease-out, fadeOut 0.5s ease-in 5.5s forwards' }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">{event.icon}</span>
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-300 leading-snug">
                  <span className="font-bold text-zinc-100">{event.nickname}</span>
                  {' '}{event.action}{' '}
                  {event.product && <span className="font-semibold text-neon">{event.product}</span>}
                </p>
                <p className="text-[9px] text-zinc-500 mt-0.5">
                  {event.city} · agora mesmo
                </p>
              </div>
            </div>
            <p className="text-[8px] text-zinc-600 mt-1 text-right italic">
              [Dark Pattern: Prova Social + FOMO]
            </p>
          </div>
        ))}
      </div>

      {/* Ghost Cursors */}
      {ghostCursors.map(cursor => (
        <div
          key={cursor.id}
          className="fixed z-[70] pointer-events-none transition-all duration-300 ease-out"
          style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
        >
          {/* Arrow cursor */}
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: `drop-shadow(0 0 4px ${cursor.color}40)` }}>
            <path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16V0Z" fill={cursor.color} fillOpacity="0.6" />
          </svg>
          <span
            className="absolute top-4 left-4 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: cursor.color + '20', color: cursor.color, border: `1px solid ${cursor.color}30` }}
          >
            {cursor.name}
          </span>
        </div>
      ))}

      {/* Inject animation keyframes */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </>
  );
}
