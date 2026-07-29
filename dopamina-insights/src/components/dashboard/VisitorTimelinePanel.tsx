import React from 'react';
import { X, MapPin, Monitor, Clock, PlayCircle, Briefcase, BarChart2, AlertTriangle, Search, Activity, Target } from 'lucide-react';

interface VisitorTimelinePanelProps {
  session: any;
  onClose: () => void;
}

export function VisitorTimelinePanel({ session, onClose }: VisitorTimelinePanelProps) {
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'super_search': return <Search className="w-4 h-4 text-blue-400" />;
      case 'rage_click': return <Activity className="w-4 h-4 text-rose-400" />;
      case 'page_leave': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'super_search': return 'bg-blue-500/10 border-blue-500/20';
      case 'rage_click': return 'bg-rose-500/10 border-rose-500/20';
      case 'page_leave': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-xl h-full bg-[#111] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              Explorador de Sessão
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${session.archetypeColor}`}>
                {session.archetype}
              </span>
            </h2>
            <p className="text-sm text-gray-400 font-mono mt-1">ID: {session.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* DNA Section (Location & Device) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Localização</span>
              </div>
              <p className="text-sm text-white font-medium">{session.location.city || 'Desconhecido'}, {session.location.country}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">IP: {session.location.ip || 'Oculto'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Dispositivo</span>
              </div>
              <p className="text-sm text-white font-medium capitalize">{session.os} ({session.deviceType})</p>
              <p className="text-xs text-gray-500 mt-1">Navegador Padrão</p>
            </div>
          </div>

          {/* Integrations Row */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Integrações H53</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* GA4 */}
              <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Google Analytics</span>
                </div>
                {session.utm_tags?.source ? (
                  <>
                    <p className="text-xs text-white truncate"><span className="text-gray-500">Source:</span> {session.utm_tags.source}</p>
                    <p className="text-xs text-white truncate"><span className="text-gray-500">Medium:</span> {session.utm_tags.medium}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Tráfego Direto / Orgânico</p>
                )}
              </div>

              {/* PostHog */}
              <button className="bg-orange-500/5 border border-orange-500/20 p-3 rounded-lg flex flex-col justify-center items-start text-left hover:bg-orange-500/10 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">PostHog</span>
                </div>
                <p className="text-xs text-gray-300 group-hover:text-white transition-colors">Assistir Session Replay</p>
              </button>

              {/* HubSpot */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">HubSpot CRM</span>
                </div>
                {session.frustrationScore > 50 ? (
                  <p className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded inline-block">At risk (Frustração)</p>
                ) : session.walletSaved > 500 ? (
                  <p className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">Hot Lead (Impactado)</p>
                ) : (
                  <p className="text-xs text-gray-500">Lead Anônimo</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
              Timeline Neuro-Mapeada
              <span className="text-gray-600 font-mono lowercase">{session.events.length} eventos</span>
            </h3>
            
            <div className="relative pl-4 border-l border-white/10 space-y-6">
              {session.events.map((event: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#111] border-2 border-gray-600" />
                  
                  <div className="flex gap-4">
                    <span className="text-xs text-gray-500 font-mono mt-0.5 min-w-[60px]">
                      {formatTime(event.created_at)}
                    </span>
                    
                    <div className={`flex-1 p-3 rounded-lg border ${getEventColor(event.event_type)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {getEventIcon(event.event_type)}
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {/* Event Specific Metadata */}
                      {event.event_type === 'super_search' && event.metadata && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-white font-medium">"{event.metadata.search_term}"</p>
                          {event.metadata.market_price && (
                            <p className="text-xs text-gray-400">
                              Preço H53: <span className="text-[#ccff00]">R$ {event.metadata.market_price}</span> 
                              {event.metadata.overprice_percentage > 0 && (
                                <span className="text-rose-400 ml-2">(+{event.metadata.overprice_percentage}%)</span>
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {event.event_type === 'rage_click' && (
                        <p className="text-xs text-rose-400 mt-1 font-medium">
                          Detectado na URL: {event.url.substring(0, 40)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
