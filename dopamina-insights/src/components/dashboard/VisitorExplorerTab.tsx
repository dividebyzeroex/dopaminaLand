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
      const sessionEvents = events.filter(e => e.session_id === session.id);
      
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
      let archetypeColor = 'bg-gray-500/20 text-gray-400';
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
      
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por ID, localização ou dispositivo..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#ccff00]/50 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Todas as Sessões
          </button>
          <button 
            onClick={() => setFilterType('frustrated')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'frustrated' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <Activity className="w-3 h-3" /> Alta Frustração
          </button>
          <button 
            onClick={() => setFilterType('hunters')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'hunters' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <Target className="w-3 h-3" /> Caçadores de Pechincha
          </button>
        </div>
      </div>

      {/* Smart Table */}
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold">Visitante / Arquétipo</th>
                <th className="p-4 font-semibold">Localização & GA4</th>
                <th className="p-4 font-semibold">Dispositivo</th>
                <th className="p-4 font-semibold">Comportamento</th>
                <th className="p-4 font-semibold text-right">Dinheiro Salvo</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                    Nenhum visitante encontrado com estes filtros.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-gray-300">
                          {session.id.substring(0, 8)}...
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${session.archetypeColor}`}>
                            {session.archetype}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          {session.location.city || 'Desconhecido'}, {session.location.country}
                        </div>
                        {session.utm_tags?.source && (
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                              {session.utm_tags.source} / {session.utm_tags.medium}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {session.deviceType === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        <span className="capitalize">{session.os}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-400" title="Duração da Sessão">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(session.durationSeconds)}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400" title="Buscas Realizadas">
                          <Search className="w-3.5 h-3.5" />
                          {session.searchCount}
                        </div>
                        {session.frustrationScore > 0 && (
                          <div className="flex items-center gap-1.5 text-rose-400" title="Frustration Score">
                            <Activity className="w-3.5 h-3.5" />
                            {session.frustrationScore}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <span className={`text-sm font-bold ${session.walletSaved > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {formatCurrency(session.walletSaved)}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 text-white">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
