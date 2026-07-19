'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import trackingEventsData from '@/data/tracking-events.json';
import CleitonMinigame from '@/components/CleitonMinigame';

// Pick random comic events for each order
function getRandomEvents() {
  const mandatory = [
    trackingEventsData[0],  // confirmed
    trackingEventsData[1],  // preparing
    trackingEventsData[2],  // collected
  ];

  // Pick 3-5 random middle events
  const middleEvents = trackingEventsData.slice(3, -2);
  const shuffled = [...middleEvents].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3 + Math.floor(Math.random() * 3));

  const ending = [
    trackingEventsData[trackingEventsData.length - 2], // almost
    trackingEventsData[trackingEventsData.length - 1], // delivered
  ];

  return [...mandatory, ...selected, ...ending];
}

export default function TrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [events, setEvents] = useState<typeof trackingEventsData>([]);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60 * 1000); // 48h in ms
  const [mapPosition, setMapPosition] = useState({ lat: -3.1190, lng: -60.0217 }); // Origin: Manaus
  const destination = { lat: -23.5505, lng: -46.6333 }; // Dest: SP

  const TOTAL_DURATION = 48 * 60 * 60 * 1000;

  // Init state
  useEffect(() => {
    setEvents(getRandomEvents());
    
    // Setup start time in localStorage
    const storageKey = `dopamina_order_time_${orderId}`;
    let startTime = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(storageKey, startTime.toString());
    }

    // Tick every second
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      let currentProgress = elapsed / TOTAL_DURATION;
      
      if (currentProgress > 1) currentProgress = 1;

      setProgress(currentProgress);
      setTimeLeft(Math.max(0, TOTAL_DURATION - elapsed));

    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  // Determine current event based on progress
  const currentEventIndex = Math.min(
    Math.floor(progress * events.length),
    events.length - 1
  );

  // Map Position based only on the event index to avoid 1-second flicker
  const eventProgress = events.length > 0 ? currentEventIndex / (events.length - 1) : 0;
  const currentMapPosition = {
    lat: -3.1190 + (destination.lat - (-3.1190)) * eventProgress,
    lng: -60.0217 + (destination.lng - (-60.0217)) * eventProgress,
  };

  const visibleEvents = events.slice(0, currentEventIndex + 1);
  const currentEvent = events[currentEventIndex];

  // Format Time Left
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);


  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground sm:text-3xl">
            Rastreamento ao Vivo 📍
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pedido: <span className="font-mono font-bold text-foreground">{orderId}</span>
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-surface-light px-4 py-2 text-sm font-bold text-muted hover:bg-surface-lighter hover:text-foreground transition"
        >
          ← Voltar
        </Link>
      </div>

      {/* Countdown Timer */}
      <div className="mt-8 flex flex-col items-center rounded-3xl border border-neon/30 bg-neon/5 p-6 neon-border">
        <p className="text-sm font-bold uppercase tracking-widest text-neon">
          {progress >= 1 ? '🎉 ENCOMENDA ENTREGUE!' : 'CLEITON CHEGA EM:'}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border shadow-inner sm:h-20 sm:w-20">
              <span className="font-[var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">{String(days).padStart(2, '0')}</span>
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">Dias</span>
          </div>
          <span className="text-2xl font-bold text-muted pb-6">:</span>
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border shadow-inner sm:h-20 sm:w-20">
              <span className="font-[var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">{String(hours).padStart(2, '0')}</span>
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">Horas</span>
          </div>
          <span className="text-2xl font-bold text-muted pb-6">:</span>
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border shadow-inner sm:h-20 sm:w-20">
              <span className="font-[var(--font-display)] text-3xl font-black text-foreground sm:text-4xl">{String(minutes).padStart(2, '0')}</span>
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">Min</span>
          </div>
          <span className="text-2xl font-bold text-muted pb-6">:</span>
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card border border-border shadow-inner sm:h-20 sm:w-20">
              <span className="font-[var(--font-display)] text-3xl font-black text-neon sm:text-4xl">{String(seconds).padStart(2, '0')}</span>
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neon">Seg</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 rounded-full bg-surface-light h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon to-purple rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-bold text-muted text-right">{Math.round(progress * 100)}% concluído</p>

      {/* Current Status */}
      {currentEvent && (
        <div className="mt-6 rounded-2xl border border-neon/30 bg-neon/5 p-6 neon-border">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentEvent.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neon">Status Atual</p>
              <p className="text-lg font-extrabold text-foreground">{currentEvent.title}</p>
              <p className="mt-1 text-sm text-muted">{currentEvent.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Real Map / Mini-game */}
      <div className="mt-8">
        <CleitonMinigame />
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="font-[var(--font-display)] text-lg font-extrabold text-foreground">
          Histórico de Eventos 📋
        </h2>
        <div className="mt-4 space-y-0">
          {visibleEvents.map((event, i) => {
            const isActive = i === currentEventIndex;
            const isCompleted = i < currentEventIndex;

            return (
              <div key={event.id} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    isActive
                      ? 'bg-neon text-white shadow-lg shadow-magenta/30'
                      : isCompleted
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-surface-light text-muted'
                  }`}>
                    {event.icon}
                  </div>
                  {i < visibleEvents.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[40px] ${
                      isCompleted ? 'bg-neon-green/30' : 'bg-border'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-6 pt-1 ${isActive ? '' : 'opacity-60'}`}>
                  <p className={`text-sm font-extrabold ${isActive ? 'text-foreground' : 'text-muted'}`}>
                    {event.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{event.description}</p>
                  <p className="text-[10px] text-muted/50 mt-1">
                    {new Date(Date.now() - (visibleEvents.length - i) * 3600000).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {currentEventIndex < events.length - 1 && (
            <div className="flex items-center gap-4 text-muted">
              <div className="flex h-10 w-10 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-neon animate-pulse" />
              </div>
              <p className="text-xs italic">Aguardando próxima atualização...</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivered banner */}
      {currentEventIndex >= events.length - 1 && events.length > 0 && (
        <div className="mt-8 rounded-2xl border border-neon-green/30 bg-neon-green/5 p-6 text-center">
          <span className="text-5xl block mb-3">🎉</span>
          <h2 className="text-xl font-extrabold text-neon-green">Pedido Entregue!</h2>
          <p className="mt-1 text-sm text-muted">
            (Na sua imaginação, claro. Mas a dopamina foi real.)
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-neon px-8 py-3 text-sm font-bold text-white transition hover:bg-neon-light"
          >
            Comprar mais ⚡
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-center text-[10px] text-muted/40">
        ⚠️ Nenhum pacote real está sendo rastreado. O motoboy Cleiton não existe (provavelmente). A capivara é ficcional.
      </p>
    </div>
  );
}
