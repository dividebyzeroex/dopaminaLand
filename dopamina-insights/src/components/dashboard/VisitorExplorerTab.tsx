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
      let archetype = 'Explorer';
      let archetypeColor = 'bg-[#111217] text-[#71717a] border-[#2a2e37]';
      if (searchCount > 3 && walletSaved > 1000) {
        archetype = 'Bargain Hunter';
        archetypeColor = 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50';
      } else if (rageClicks > 2) {
        archetype = 'Frustrated';
        archetypeColor = 'bg-rose-900/20 text-rose-400 border-rose-900/50';
      } else if (searchCount >= 1 && searchCount <= 3) {
        archetype = 'Focused Buyer';
        archetypeColor = 'bg-blue-900/20 text-blue-400 border-blue-900/50';
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
    if (filterType === 'hunters' && session.archetype !== 'Bargain Hunter') return false;
    
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
    <div className="space-y-4 font-sans animate-fade-in py-2">
      
      {/* Filters & Search - APM Style */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#181b1f] p-3 rounded-sm border border-[#2a2e37]">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a] group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Trace ID, location, or device..."
            className="w-full bg-[#111217] border border-[#2a2e37] rounded-sm pl-9 pr-4 py-1.5 text-[11px] font-mono focus:outline-none focus:border-blue-500 text-[#e4e4e7] placeholder:text-[#52525b] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              filterType === 'all' 
                ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' 
                : 'bg-[#111217] text-[#71717a] border-[#2a2e37] hover:bg-[#2a2e37] hover:text-[#e4e4e7]'
            }`}
          >
            All Sessions
          </button>
          <button 
            onClick={() => setFilterType('frustrated')}
            className={`px-4 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterType === 'frustrated' 
                ? 'bg-rose-900/20 text-rose-400 border-rose-900/50' 
                : 'bg-[#111217] text-[#71717a] border-[#2a2e37] hover:bg-[#2a2e37] hover:text-[#e4e4e7]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> High Frustration
          </button>
          <button 
            onClick={() => setFilterType('hunters')}
            className={`px-4 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterType === 'hunters' 
                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' 
                : 'bg-[#111217] text-[#71717a] border-[#2a2e37] hover:bg-[#2a2e37] hover:text-[#e4e4e7]'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Bargain Hunters
          </button>
        </div>
      </div>

      {/* Styled List (Grid of Rows) */}
      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2a2e37] rounded-sm bg-[#111217]">
            <p className="font-mono text-[11px] text-[#52525b] uppercase tracking-wider">No traces found for the selected criteria.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div 
              key={session.id} 
              onClick={() => setSelectedSession(session)}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-[#181b1f] border border-[#2a2e37] hover:border-blue-500/50 rounded-sm cursor-pointer transition-colors overflow-hidden"
            >
              {/* Archetype & ID */}
              <div className="flex items-center gap-3 min-w-[200px]">
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center border ${session.archetypeColor}`}>
                  {session.archetype === 'Bargain Hunter' && <Target className="w-4 h-4" />}
                  {session.archetype === 'Frustrated' && <Activity className="w-4 h-4" />}
                  {session.archetype === 'Focused Buyer' && <Search className="w-4 h-4" />}
                  {session.archetype === 'Explorer' && <MousePointer2 className="w-4 h-4" />}
                </div>
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${session.archetypeColor.split(' ')[1]}`}>
                    {session.archetype}
                  </span>
                  <p className="font-mono text-[11px] text-[#71717a] mt-0.5">
                    {session.id.substring(0, 16)}...
                  </p>
                </div>
              </div>

              {/* Location & GA4 */}
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#e4e4e7] uppercase">
                  <MapPin className="w-3.5 h-3.5 text-[#52525b]" />
                  {session.location.city || 'Unknown'}, {session.location.country}
                </div>
                {session.utm_tags?.source && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-blue-900/20 border border-blue-900/50 text-blue-400 text-[9px] rounded-sm uppercase tracking-wider font-bold">
                      {session.utm_tags.source}
                    </span>
                    <span className="text-[#52525b] text-[9px] font-mono">— {session.utm_tags.medium}</span>
                  </div>
                )}
              </div>

              {/* Device & OS */}
              <div className="flex-shrink-0 w-28">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#71717a] uppercase">
                  {session.deviceType === 'mobile' ? <Smartphone className="w-3.5 h-3.5 text-[#52525b]" /> : <Monitor className="w-3.5 h-3.5 text-[#52525b]" />}
                  <span>{session.os}</span>
                </div>
              </div>

              {/* Behavior Metrics */}
              <div className="flex items-center gap-4 w-40">
                <div className="flex flex-col gap-0.5" title="Session Duration">
                  <span className="font-mono text-[9px] text-[#52525b] uppercase tracking-wider">Time</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#e4e4e7]">
                    <Clock className="w-3 h-3 text-[#71717a]" />
                    {formatDuration(session.durationSeconds)}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5" title="Queries Executed">
                  <span className="font-mono text-[9px] text-[#52525b] uppercase tracking-wider">Queries</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#e4e4e7]">
                    <Search className="w-3 h-3 text-[#71717a]" />
                    {session.searchCount}
                  </div>
                </div>
              </div>

              {/* Wallet Saved */}
              <div className="text-right w-28 pr-2">
                <span className="font-mono text-[9px] text-[#52525b] uppercase tracking-wider block mb-0.5">Wallet Impact</span>
                <span className={`font-mono text-xs font-bold tracking-tight ${session.walletSaved > 0 ? 'text-emerald-400' : 'text-[#71717a]'}`}>
                  {formatCurrency(session.walletSaved)}
                </span>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-[#111217] border border-[#2a2e37] flex items-center justify-center group-hover:bg-blue-900/20 group-hover:border-blue-900/50 group-hover:text-blue-400 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
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
