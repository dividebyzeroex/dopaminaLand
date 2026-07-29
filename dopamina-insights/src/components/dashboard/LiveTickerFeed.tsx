'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface LiveTickerFeedProps {
  events: any[];
}

export default function LiveTickerFeed({ events }: LiveTickerFeedProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const feedRef = useRef<HTMLDivElement>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (filterType === 'all') return events;
    if (filterType === 'purchases') return events.filter(e => e.event_type === 'fake_checkout' || e.event_type === 'checkout_basket');
    if (filterType === 'cart') return events.filter(e => e.event_type === 'add_to_cart');
    if (filterType === 'friction') return events.filter(e => ['rage_click', 'dead_click', 'cursor_frustration'].includes(e.event_type));
    if (filterType === 'dna') return events.filter(e => e.event_type === 'digital_dna_scan');
    if (filterType === 'resistance') return events.filter(e => e.event_type?.startsWith('resistance_training'));
    return events;
  }, [events, filterType]);

  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [filteredEvents, autoScroll]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'fake_checkout':
      case 'checkout_basket':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">⚡ CHECKOUT</span>;
      case 'add_to_cart':
        return <span className="bg-primary text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">🛒 CARRINHO</span>;
      case 'rage_click':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">😤 RAGE CLICK</span>;
      case 'dead_click':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">🎯 DEAD CLICK</span>;
      case 'digital_dna_scan':
        return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">🧬 DNA SCAN</span>;
      case 'resistance_training_start':
      case 'resistance_training_complete':
      case 'resistance_training_fail':
        return <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">🛡️ RESISTÊNCIA</span>;
      default:
        return <span className="bg-zinc-800 text-muted border border-border px-2 py-0.5 rounded text-[10px] font-mono font-bold">👁️ {type}</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-zinc-950 p-6 shadow-md font-mono">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-black text-zinc-100 tracking-wider">LIVE TELEMETRY STREAM</h3>
          </div>
          <span className="text-xs text-zinc-500">({filteredEvents.length} eventos)</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg transition ${filterType === 'all' ? 'bg-primary text-black font-bold' : 'bg-surface-light text-muted hover:text-foreground'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('purchases')}
            className={`px-3 py-1 rounded-lg transition ${filterType === 'purchases' ? 'bg-emerald-500 text-black font-bold' : 'bg-surface-light text-muted hover:text-foreground'}`}
          >
            Checkouts
          </button>
          <button
            onClick={() => setFilterType('cart')}
            className={`px-3 py-1 rounded-lg transition ${filterType === 'cart' ? 'bg-primary text-primary font-bold' : 'bg-surface-light text-muted hover:text-foreground'}`}
          >
            Carrinho
          </button>
          <button
            onClick={() => setFilterType('friction')}
            className={`px-3 py-1 rounded-lg transition ${filterType === 'friction' ? 'bg-red-500 text-foreground font-bold' : 'bg-surface-light text-muted hover:text-foreground'}`}
          >
            Fricção
          </button>
          <button
            onClick={() => setFilterType('dna')}
            className={`px-3 py-1 rounded-lg transition ${filterType === 'dna' ? 'bg-purple-500 text-foreground font-bold' : 'bg-surface-light text-muted hover:text-foreground'}`}
          >
            DNA
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[10px] border ${autoScroll ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-border text-zinc-500'}`}
          >
            {autoScroll ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}
          </button>
        </div>
      </div>

      {/* Stream Window */}
      <div
        ref={feedRef}
        className="h-[360px] overflow-y-auto space-y-2 pr-2 custom-scrollbar text-xs bg-surface-light p-4 rounded-xl border border-border"
      >
        {filteredEvents.length === 0 ? (
          <p className="text-zinc-600 italic text-center py-12">Aguardando novos eventos de telemetria...</p>
        ) : (
          filteredEvents.map((ev, idx) => (
            <div
              key={ev.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-surface-light hover:bg-surface-light border border-border/40 transition duration-150"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-[10px]">
                  {ev.created_at ? new Date(ev.created_at).toLocaleTimeString() : 'ao vivo'}
                </span>
                {getEventBadge(ev.event_type)}
                <span className="text-muted font-sans font-medium text-xs">
                  {ev.product_id || ev.metadata?.product_name || ev.metadata?.tag || ev.event_type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                {ev.price_displayed ? (
                  <span className="text-primary font-bold">R$ {ev.price_displayed.toLocaleString('pt-BR')}</span>
                ) : null}
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                  {ev.session_id ? `sid:${ev.session_id.substring(0, 8)}` : 'anon'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
