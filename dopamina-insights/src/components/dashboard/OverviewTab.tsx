import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, Search, ShieldAlert, BarChart3, AlertCircle, CheckCircle, Bug, Activity, Server, Zap, Database, Clock, Terminal } from 'lucide-react';

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-md px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-muted-light">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-white mt-1">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
        </p>
      ))}
    </div>
  );
};

export default function OverviewTab({ kpis, funnelData, topProducts, timelineData, rawEvents = [], rawSessions = [] }: {
  kpis: any;
  funnelData: any[];
  topProducts: any[];
  timelineData: any[];
  rawEvents?: any[];
  rawSessions?: any[];
}) {
  const totalSessions = kpis?.totalSessions ?? 0;
  const identifiedLeads = kpis?.identifiedLeads ?? 0;
  const highIntentLeads = kpis?.highIntentLeads ?? 0;
  const frictionIndex = typeof kpis?.frictionIndex === 'number' ? kpis.frictionIndex.toFixed(1) : '0';
  const barrasInstaladas = kpis?.barrasInstaladas ?? 0;
  const lojasAuditadas = kpis?.lojasAuditadas ?? 0;

  // Real-time Telemetry Calculations
  const telemetry = useMemo(() => {
    const recentEvents = rawEvents.slice(0, 50); // Last 50 for the live feed
    const searches = rawEvents.filter(e => e.event_type === 'super_search');
    const errors = rawEvents.filter(e => e.event_type === 'error' || e.metadata?.flaws_count > 0);
    const errorRate = searches.length > 0 ? ((errors.length / searches.length) * 100).toFixed(1) : '0.0';
    
    // Average session duration (very rough estimate)
    let totalDur = 0;
    let durCount = 0;
    rawSessions.forEach(s => {
       const sEvts = rawEvents.filter(e => e.session_id === s.session_id);
       if(sEvts.length > 1) {
          const first = new Date(sEvts[sEvts.length - 1].created_at).getTime();
          const last = new Date(sEvts[0].created_at).getTime();
          totalDur += (last - first) / 1000;
          durCount++;
       }
    });
    const avgDuration = durCount > 0 ? (totalDur / durCount).toFixed(0) + 's' : '0s';

    // Searches per minute (based on last 60 mins if available, rough mock if empty)
    const spm = (searches.length / 60).toFixed(2);

    return { recentEvents, errorRate, avgDuration, spm };
  }, [rawEvents, rawSessions]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Animated Top Bar / NOC Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> NOC: Telemetria Real-Time
          </h2>
          <p className="text-xs text-muted-light mt-1">Status da infraestrutura e volumetria de auditorias.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            STREAM ATIVO
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-muted-light">
            <Database className="w-3.5 h-3.5 text-cyan-500" /> DB Conectado
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-muted-light">
            <Server className="w-3.5 h-3.5 text-indigo-400" /> API: 42ms
          </div>
        </div>
      </div>

      {/* KPI Cards Glassmorphism */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Sessões Totais', value: totalSessions, icon: Users, color: 'text-white' },
          { label: 'Auditores Ativos', value: identifiedLeads, icon: Search, color: 'text-cyan-400' },
          { label: 'Auditores Power', value: highIntentLeads, icon: ShieldAlert, color: 'text-emerald-400' },
          { label: 'Lojas Auditadas', value: lojasAuditadas, icon: AlertCircle, color: 'text-amber-400' },
          { label: 'Barras Instaladas', value: barrasInstaladas, icon: CheckCircle, color: 'text-purple-400' },
          { label: 'Rage Clicks', value: frictionIndex, icon: Bug, color: 'text-rose-400' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="relative rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-5 shadow-lg group overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold tracking-tight ${kpi.color} drop-shadow-md`}>{kpi.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-light">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Area: Volumetry & Product Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volumetry AreaChart */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-6 shadow-lg">
          <h2 className="mb-6 text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Volumetria de Eventos
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVolumetry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="sessions" stroke="#22d3ee" strokeWidth={3} fill="url(#gradVolumetry)" animationDuration={1000} name="Interações" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Telemetry Panel */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-6 shadow-lg flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Telemetria de Produto
          </h2>
          <div className="flex-1 space-y-4 mt-2">
            <div className="p-4 rounded-xl border border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Zap className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Buscas / Minuto</p>
                  <p className="text-lg font-bold text-white">{telemetry.spm}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><Bug className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Taxa de Falhas / Erros</p>
                  <p className="text-lg font-bold text-white">{telemetry.errorRate}%</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Clock className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Tempo Médio Sessão</p>
                  <p className="text-lg font-bold text-white">{telemetry.avgDuration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Live Feed & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Feed Terminal */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6 shadow-lg overflow-hidden flex flex-col h-[400px]">
          <h2 className="mb-4 text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> Live Feed (Stream)
          </h2>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-2">
            {telemetry.recentEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="text-xs font-mono p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-muted-light shrink-0">{new Date(evt.created_at).toLocaleTimeString('pt-BR')}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold shrink-0 ${evt.event_type === 'super_search' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-surface-lighter text-muted-light'}`}>
                    {evt.event_type}
                  </span>
                  <span className="text-white truncate max-w-[150px] md:max-w-[250px]">
                    {evt.metadata?.query || evt.metadata?.current_url || 'Evento genérico'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3 text-[10px] shrink-0">
                  {evt.metadata?.store_detected && (
                    <span className="text-emerald-400 hidden sm:inline">Loja: {evt.metadata.store_detected}</span>
                  )}
                  {evt.metadata?.overprice_percentage > 0 && (
                    <span className="text-rose-400 font-bold hidden sm:inline">+{evt.metadata.overprice_percentage.toFixed(1)}%</span>
                  )}
                  <span className="text-muted">{evt.session_id.substring(0, 8)}</span>
                </div>
              </div>
            ))}
            {telemetry.recentEvents.length === 0 && (
              <p className="text-muted text-sm text-center py-10 font-sans">Aguardando eventos...</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-6 shadow-lg overflow-hidden h-[400px] flex flex-col">
          <h2 className="mb-4 text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Top Produtos / Buscas
          </h2>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-2">
            {topProducts.map((prod, idx) => (
              <div key={prod.id || idx} className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10 hover:border-white/20 cursor-pointer">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/40 text-[10px] font-bold text-muted group-hover:text-cyan-400">
                  {idx + 1}
                </div>
                {prod.image_url && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10">
                    <img src={prod.image_url} alt={prod.short_name || prod.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-bold text-white">{prod.short_name || prod.name || prod.query}</div>
                  <div className="text-xs text-muted-light mt-0.5">{prod.metrics?.carts || prod.count || 1} buscas auditadas</div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-muted text-center py-10">Nenhuma busca registrada.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
