'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface SessionReplayPlayerProps {
  sessions: any[];
  events: any[];
}

export default function SessionReplayPlayer({ sessions, events }: SessionReplayPlayerProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; active: boolean; type?: string }>({ x: 50, y: 50, active: false });
  const [clickPulses, setClickPulses] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

  // Filter events belonging to selected session
  const sessionEvents = useMemo(() => {
    if (!selectedSessionId || !events) return [];
    return events
      .filter(e => e.session_id === selectedSessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [selectedSessionId, events]);

  // Set initial selected session if available
  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].session_id);
    } else if (events && events.length > 0 && !selectedSessionId) {
      const sids = Array.from(new Set(events.map(e => e.session_id).filter(Boolean)));
      if (sids.length > 0) setSelectedSessionId(sids[0] as string);
    }
  }, [sessions, events, selectedSessionId]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || sessionEvents.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= sessionEvents.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const nextIdx = prev + 1;
        const currentEvent = sessionEvents[nextIdx];

        if (currentEvent) {
          // Update cursor position if metadata has coordinates
          const x = currentEvent.metadata?.x || Math.floor(Math.random() * 800) + 100;
          const y = currentEvent.metadata?.y || Math.floor(Math.random() * 600) + 100;
          setCursorPos({ x, y, active: true, type: currentEvent.event_type });

          // Add click pulse on click events
          if (['heatmap_click', 'rage_click', 'dead_click', 'add_to_cart', 'fake_checkout'].includes(currentEvent.event_type)) {
            const clickId = Date.now() + Math.random();
            setClickPulses(pulses => [...pulses, { id: clickId, x, y, type: currentEvent.event_type }]);
            setTimeout(() => {
              setClickPulses(pulses => pulses.filter(p => p.id !== clickId));
            }, 1000);
          }
        }

        return nextIdx;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, sessionEvents, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentStepIndex >= sessionEvents.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const currentEvent = sessionEvents[currentStepIndex];

  return (
    <div className="rounded-2xl border border-border bg-surface-light p-6 shadow-md">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎬</span>
          <div>
            <h3 className="text-base font-black text-foreground">Session Replay Visualizer</h3>
            <p className="text-xs text-zinc-500">Reconstituição simulada de ações de usuários</p>
          </div>
        </div>

        {/* Session Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setCurrentStepIndex(0);
              setIsPlaying(false);
            }}
            className="bg-surface-light border border-border text-foreground text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            {sessions.map((s, idx) => (
              <option key={s.session_id || idx} value={s.session_id}>
                Sessão #{s.session_id?.substring(0, 8)} ({s.device_info?.city || 'Brasil'})
              </option>
            ))}
          </select>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-surface-light border border-border rounded-lg p-1 text-xs">
            {[1, 2, 4].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded font-bold transition ${playbackSpeed === spd ? 'bg-primary text-black' : 'text-muted hover:text-foreground'}`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-black font-black text-xs px-4 py-2 rounded-lg transition active:scale-95 shadow-lg shadow-neon/10"
          >
            <span>{isPlaying ? '⏸️ PAUSAR' : '▶️ REPRODUZIR'}</span>
          </button>
        </div>
      </div>

      {/* Replay Viewport */}
      <div className="relative bg-surface-light rounded-xl overflow-hidden border border-border h-[550px]">
        {/* Real Site Iframe */}
        <iframe
          src="https://dopamina-land.vercel.app/?replayMode=true"
          className="w-full h-full pointer-events-none opacity-80"
          title="Session Replay Screen"
        />

        {/* Overlay Cursor */}
        {cursorPos.active && (
          <div
            className="absolute z-50 pointer-events-none transition-all duration-300 ease-out"
            style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
          >
            <div className="relative">
              <svg width="20" height="24" viewBox="0 0 16 20" fill="none">
                <path d="M0 0L16 12L8 12L12 20L8 18L4 12L0 16V0Z" fill="#ccff00" stroke="#000" strokeWidth="1" />
              </svg>
              <span className="absolute left-4 top-2 text-[9px] font-black bg-surface-light text-primary border border-primary/30 px-2 py-0.5 rounded shadow whitespace-nowrap">
                {cursorPos.type}
              </span>
            </div>
          </div>
        )}

        {/* Click Pulses */}
        {clickPulses.map((p) => (
          <div
            key={p.id}
            className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: '40px',
              height: '40px',
              backgroundColor: p.type === 'rage_click' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(204, 255, 0, 0.6)',
            }}
          />
        ))}

        {/* HUD Info */}
        <div className="absolute top-4 left-4 z-30 bg-surface-light border border-border rounded-xl p-3 text-xs  max-w-xs">
          <p className="text-zinc-500 font-bold text-[10px]">EVENTO ATUAL ({currentStepIndex + 1}/{sessionEvents.length})</p>
          <p className="text-foreground font-bold mt-1">
            {currentEvent ? currentEvent.event_type : 'Aguardando início...'}
          </p>
          {currentEvent?.price_displayed && (
            <p className="text-primary font-black text-xs mt-0.5">R$ {currentEvent.price_displayed.toLocaleString('pt-BR')}</p>
          )}
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={Math.max(0, sessionEvents.length - 1)}
          value={currentStepIndex}
          onChange={(e) => {
            setCurrentStepIndex(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="flex-1 accent-neon cursor-pointer h-2 bg-zinc-800 rounded-lg"
        />
        <span className="text-xs text-muted font-mono tabular-nums">
          {currentStepIndex + 1} / {sessionEvents.length}
        </span>
      </div>
    </div>
  );
}
