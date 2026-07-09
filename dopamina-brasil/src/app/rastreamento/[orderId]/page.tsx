'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import trackingEventsData from '@/data/tracking-events.json';

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
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [mapPosition, setMapPosition] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo

  // Generate events on mount
  useEffect(() => {
    setEvents(getRandomEvents());
  }, []);

  // Auto-advance tracking events
  useEffect(() => {
    if (events.length === 0) return;
    if (currentEventIndex >= events.length - 1) return;

    const timer = setInterval(() => {
      setCurrentEventIndex(prev => {
        if (prev < events.length - 1) {
          // Move map position randomly around Brazil
          setMapPosition({
            lat: -23.5 + (Math.random() - 0.5) * 20,
            lng: -46.6 + (Math.random() - 0.5) * 20,
          });
          return prev + 1;
        }
        return prev;
      });
    }, 5000); // New event every 5 seconds

    return () => clearInterval(timer);
  }, [events, currentEventIndex]);

  const visibleEvents = events.slice(0, currentEventIndex + 1);
  const currentEvent = events[currentEventIndex];
  const progress = events.length > 0 ? ((currentEventIndex + 1) / events.length) * 100 : 0;

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

      {/* Progress Bar */}
      <div className="mt-6 rounded-full bg-surface-light h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-magenta to-violet rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted text-right">{Math.round(progress)}% concluído</p>

      {/* Current Status */}
      {currentEvent && (
        <div className="mt-6 rounded-2xl border border-magenta/30 bg-magenta/5 p-6 neon-border">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentEvent.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-magenta">Status Atual</p>
              <p className="text-lg font-extrabold text-foreground">{currentEvent.title}</p>
              <p className="mt-1 text-sm text-muted">{currentEvent.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Placeholder */}
      <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-surface via-surface-light to-[#0a1628]">
          {/* Fake map grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Animated marker */}
          <div
            className="absolute transition-all duration-1000 ease-in-out"
            style={{
              left: `${30 + (mapPosition.lng + 60) * 0.5}%`,
              top: `${20 + (mapPosition.lat + 30) * 0.8}%`,
            }}
          >
            <div className="relative">
              <div className="absolute -inset-4 animate-ping rounded-full bg-magenta/30" />
              <div className="relative h-6 w-6 rounded-full bg-magenta border-2 border-white shadow-lg flex items-center justify-center text-[10px]">
                📦
              </div>
            </div>
          </div>

          {/* Map labels */}
          <div className="absolute bottom-4 left-4 rounded-lg bg-surface/80 backdrop-blur px-3 py-2">
            <p className="text-[10px] font-bold text-muted">LIVE TRACKING</p>
            <p className="text-xs font-bold text-foreground">
              {mapPosition.lat.toFixed(4)}°S, {mapPosition.lng.toFixed(4)}°W
            </p>
          </div>

          <div className="absolute top-4 right-4 rounded-lg bg-magenta/90 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider animate-pulse">
            🔴 Ao Vivo
          </div>

          {/* Some fake location markers */}
          <div className="absolute left-[20%] top-[30%] text-xs opacity-30">📍 São Paulo</div>
          <div className="absolute left-[60%] top-[20%] text-xs opacity-30">📍 Brasília</div>
          <div className="absolute left-[70%] top-[50%] text-xs opacity-30">📍 Curitiba</div>
          <div className="absolute left-[40%] top-[60%] text-xs opacity-30">📍 Rio de Janeiro</div>
        </div>
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
                      ? 'bg-magenta text-white shadow-lg shadow-magenta/30'
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
                <div className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
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
            className="mt-4 inline-block rounded-full bg-magenta px-8 py-3 text-sm font-bold text-white transition hover:bg-magenta-light"
          >
            Comprar mais 💊
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
