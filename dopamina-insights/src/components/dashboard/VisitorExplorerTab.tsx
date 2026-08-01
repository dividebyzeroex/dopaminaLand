import React, { useState, useMemo } from 'react';
import { Search, MapPin, Globe, Clock, MousePointer2, Smartphone, Monitor, ChevronRight, Activity, DollarSign, Filter, Target } from 'lucide-react';
import { VisitorTimelinePanel } from './VisitorTimelinePanel';

interface VisitorExplorerTabProps {
  sessions: any[];
  events: any[];
}

export function VisitorExplorerTab({ sessions, events }: VisitorExplorerTabProps) {
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Process sessions to add smart metrics
  const processedSessions = useMemo(() => {
    return sessions.map(session => {
      const sessionId = session.session_id || session.id;
      const sessionEvents = events.filter(e => e.session_id === sessionId);
      
      // Calculate duration
      const firstEvent = sessionEvents[0];
      const lastEvent = sessionEvents[sessionEvents.length - 1];
      const durationMs = firstEvent && lastEvent 
        ? new Date(lastEvent.created_at).getTime() - new Date(firstEvent.created_at).getTime() 
        : 0;
      const durationSeconds = Math.floor(durationMs / 1000);

      // Metrics
      const rageClicks = sessionEvents.filter(e => e.event_type === 'rage_click').length;
      const searches = sessionEvents.filter(e => e.event_type === 'super_search');
      const searchCount = searches.length;
      
      // Calculate "Wallet Saved" (Sum of overprice absolute value if positive)
      let walletSaved = 0;
      searches.forEach(search => {
        if (search.metadata?.overprice_percentage > 0 && search.metadata?.market_price) {
           const overprice = (search.metadata.overprice_percentage / 100) * search.metadata.market_price;
           walletSaved += overprice;
        }
      });

      // Archetype Auto-Tagging
      let archetype = 'Explorador Neutro';
      let archetypeColor = 'bg-gray-500/20 text-muted';
      if (searchCount > 3 && walletSaved > 1000) {
        archetype = 'Caçador de Pechinchas';
        archetypeColor = 'bg-emerald-500/20 text-emerald-400';
      } else if (rageClicks > 2) {
        archetype = 'Usuário Frustrado';
        archetypeColor = 'bg-rose-500/20 text-rose-400';
      } else if (searchCount >= 1 && searchCount <= 3) {
        archetype = 'Comprador Focado';
        archetypeColor = 'bg-blue-500/20 text-blue-400';
      }

      // Frustration Score (0-100)
      const frustrationScore = Math.min(100, (rageClicks * 25));

      return {
        ...session,
        id: sessionId,
        events: sessionEvents,
        durationSeconds,
        searchCount,
        rageClicks,
        walletSaved,
        archetype,
        archetypeColor,
        frustrationScore,
        deviceType: session.device?.type || 'desktop',
        os: session.device?.os || 'Unknown',
        location: session.location || { city: 'Desconhecido', country: 'BR' }
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sessions, events]);

  // Filtering
  const filteredSessions = processedSessions.filter(session => {
    if (filterType === 'frustrated' && session.frustrationScore < 50) return false;
    if (filterType === 'hunters' && session.archetype !== 'Caçador de Pechinchas') return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const loc = `${session.location.city} ${session.location.country}`.toLowerCase();
      const dev = `${session.deviceType} ${session.os}`.toLowerCase();
      return loc.includes(searchLower) || dev.includes(searchLower) || session.id.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      
      {/* Filters & Search - Premium Glassmorphism */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por ID, localização ou dispositivo..."
            className="w-full bg-black/20 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 text-foreground placeholder:text-muted/70 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
              filterType === 'all' 
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                : 'bg-black/20 text-muted border-white/5 hover:border-white/20 hover:text-foreground'
            }`}
          >
            Todas as Sessões
          </button>
          <button 
            onClick={() => setFilterType('frustrated')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
              filterType === 'frustrated' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                : 'bg-black/20 text-muted border-white/5 hover:border-white/20 hover:text-foreground'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Alta Frustração
          </button>
          <button 
            onClick={() => setFilterType('hunters')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
              filterType === 'hunters' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-black/20 text-muted border-white/5 hover:border-white/20 hover:text-foreground'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Caçadores de Pechincha
          </button>
        </div>
      </div>

      {/* Styled List (Grid of Rows) */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-surface/20 backdrop-blur-sm">
            <p className="text-muted text-sm">Nenhum visitante encontrado com estes filtros.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div 
              key={session.id} 
              onClick={() => setSelectedSession(session)}
              className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-surface/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden"
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Archetype & ID */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${session.archetypeColor.replace('text-', 'border-').replace('/20', '/30')}`}>
                  {session.archetype === 'Caçador de Pechinchas' && <Target className="w-5 h-5" />}
                  {session.archetype === 'Usuário Frustrado' && <Activity className="w-5 h-5" />}
                  {session.archetype === 'Comprador Focado' && <Search className="w-5 h-5" />}
                  {session.archetype === 'Explorador Neutro' && <MousePointer2 className="w-5 h-5" />}
                </div>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${session.archetypeColor.split(' ')[1]}`}>
                    {session.archetype}
                  </span>
                  <p className="font-mono text-xs text-muted-light mt-0.5">
                    {session.id.substring(0, 12)}...
                  </p>
                </div>
              </div>

              {/* Location & GA4 */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5 text-muted" />
                  {session.location.city || 'Desconhecido'}, {session.location.country}
                </div>
                {session.utm_tags?.source && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded-full uppercase tracking-widest font-semibold">
                      {session.utm_tags.source}
                    </span>
                    <span className="text-muted-light text-[10px]">— {session.utm_tags.medium}</span>
                  </div>
                )}
              </div>

              {/* Device & OS */}
              <div className="flex-shrink-0 w-32">
                <div className="flex items-center gap-2 text-sm text-muted-light">
                  {session.deviceType === 'mobile' ? <Smartphone className="w-4 h-4 text-muted" /> : <Monitor className="w-4 h-4 text-muted" />}
                  <span className="capitalize">{session.os}</span>
                </div>
              </div>

              {/* Behavior Metrics */}
              <div className="flex items-center gap-5 w-48">
                <div className="flex flex-col gap-0.5" title="Duração da Sessão">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Tempo</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-light" />
                    {formatDuration(session.durationSeconds)}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5" title="Buscas Realizadas">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Buscas</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Search className="w-3.5 h-3.5 text-muted-light" />
                    {session.searchCount}
                  </div>
                </div>
              </div>

              {/* Wallet Saved */}
              <div className="text-right w-36 pr-4">
                <span className="text-[10px] text-muted uppercase tracking-wider block mb-0.5">Dinheiro Salvo</span>
                <span className={`text-lg font-bold tracking-tight ${session.walletSaved > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-muted-light'}`}>
                  {formatCurrency(session.walletSaved)}
                </span>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all duration-300">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over Panel */}
      {selectedSession && (
        <VisitorTimelinePanel 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
}
