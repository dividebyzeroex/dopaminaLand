import { useMemo, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, LineChart
} from 'recharts';
import { Activity, Server, Zap, Database, Clock, Terminal, Globe, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

const ApmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-[#2a2e37] bg-[#111217] px-3 py-2 shadow-2xl font-mono text-xs z-50 relative">
      <p className="text-[#a1a1aa] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-3 justify-between mt-1">
          <span className="flex items-center gap-1.5 text-[#e4e4e7]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-white">
            {typeof p.value === 'number' ? p.value.toLocaleString('en-US') : p.value}
          </span>
        </div>
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
  const [logFilter, setLogFilter] = useState<'ALL' | 'ERROR' | 'INFO'>('ALL');

  // Sparkline Mock Data (for visual density)
  const sparklineData = useMemo(() => Array.from({length: 20}).map(() => ({ value: Math.random() * 100 })), []);

  // Multi-axis Volumetry Data (mocking errors based on timeline)
  const apmTimeline = useMemo(() => {
    return timelineData.map(t => ({
      ...t,
      errors: Math.floor(t.sessions * (Math.random() * 0.15)), // 0-15% error rate mock
      latency: Math.floor(Math.random() * 200) + 20
    }));
  }, [timelineData]);

  // Real-time Telemetry Calculations
  const telemetry = useMemo(() => {
    const recentEvents = rawEvents.slice(0, 100); 
    const searches = rawEvents.filter(e => e.event_type === 'super_search');
    const errors = rawEvents.filter(e => e.event_type === 'error' || e.metadata?.flaws_count > 0);
    const errorRate = searches.length > 0 ? ((errors.length / searches.length) * 100) : 0;
    
    let totalDur = 0; let durCount = 0;
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
    const spm = (searches.length / 60).toFixed(2);

    return { 
      recentEvents, 
      errorRate: errorRate.toFixed(1), 
      isErrorCritical: errorRate > 5,
      avgDuration, 
      spm 
    };
  }, [rawEvents, rawSessions]);

  const filteredLogs = telemetry.recentEvents.filter(e => {
    const isError = e.event_type === 'error' || e.metadata?.overprice_percentage > 0;
    if (logFilter === 'ERROR') return isError;
    if (logFilter === 'INFO') return !isError;
    return true;
  });

  return (
    <div className="bg-[#0b0f19] text-[#e4e4e7] min-h-screen p-2 space-y-4 font-sans animate-fade-in -mx-4 -my-8 px-4 py-8">
      {/* Topology & Status Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Topology Map */}
        <div className="flex-1 bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20" />
          
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-10 h-10 rounded border border-[#2a2e37] bg-[#111217] flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Edge Global</span>
          </div>
          
          <div className="flex-1 h-[1px] bg-[#2a2e37] relative flex items-center justify-center">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-ping absolute" />
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-10 h-10 rounded border border-[#2a2e37] bg-[#111217] flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">API Core</span>
          </div>

          <div className="flex-1 h-[1px] bg-[#2a2e37] relative flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute animate-pulse" />
          </div>

          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-10 h-10 rounded border border-[#2a2e37] bg-[#111217] flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Supabase DB</span>
          </div>
        </div>

        {/* Global Health */}
        <div className="w-full lg:w-80 bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4 flex flex-col justify-center gap-3 relative">
          <div className={`absolute top-0 left-0 w-full h-0.5 ${telemetry.isErrorCritical ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#a1a1aa]">
            <span>System Health</span>
            <span className={telemetry.isErrorCritical ? 'text-red-400' : 'text-emerald-400'}>
              {telemetry.isErrorCritical ? 'WARNING' : 'OPERATIONAL'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold">{100 - parseFloat(telemetry.errorRate)}%</span>
            <Activity className={`w-6 h-6 ${telemetry.isErrorCritical ? 'text-red-500' : 'text-emerald-500'}`} />
          </div>
        </div>
      </div>

      {/* Strict KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'SESSÕES TOTAIS', value: kpis?.totalSessions ?? 0, trend: '+12%', up: true },
          { label: 'AUDITORES ATIVOS', value: kpis?.identifiedLeads ?? 0, trend: '+4%', up: true },
          { label: 'BUSCAS / MINUTO', value: telemetry.spm, trend: '-1.2%', up: false },
          { label: 'TAXA DE ERROS', value: telemetry.errorRate + '%', alert: telemetry.isErrorCritical },
          { label: 'TEMPO SESSÃO', value: telemetry.avgDuration, trend: '+0.5s', up: true },
          { label: 'LOJAS MAP', value: kpis?.lojasAuditadas ?? 0, trend: '+2', up: true }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4 relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-[#71717a] font-bold">{kpi.label}</span>
                {kpi.alert && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className={`text-xl font-mono font-bold ${kpi.alert ? 'text-red-400' : 'text-white'}`}>{kpi.value}</span>
                {kpi.trend && (
                  <span className={`flex items-center text-[10px] font-mono ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                )}
              </div>
            </div>
            {/* Background Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-20 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke={kpi.alert ? '#ef4444' : '#3b82f6'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* APM Main Multi-Axis Chart */}
      <div className="bg-[#181b1f] border border-[#2a2e37] rounded-sm p-4 h-[350px] flex flex-col relative z-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> VSL & Telemetria Combinada
          </h2>
          <MoreHorizontal className="w-4 h-4 text-[#71717a] cursor-pointer" />
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={apmTimeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#ef4444', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip content={<ApmTooltip />} cursor={{ fill: '#27272a', opacity: 0.2 }} />
              <Area yAxisId="left" type="step" dataKey="sessions" fill="#1e3a8a" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={0.3} name="Total Interações" animationDuration={500} />
              <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2, fill: '#ef4444' }} name="Volume Erros" animationDuration={500} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Explorer & Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
        {/* Log Terminal (2/3) */}
        <div className="col-span-1 lg:col-span-2 bg-[#111217] border border-[#2a2e37] rounded-sm flex flex-col overflow-hidden relative">
          {/* Terminal Header */}
          <div className="bg-[#181b1f] border-b border-[#2a2e37] p-2 px-4 flex justify-between items-center">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Log Explorer
            </h2>
            <div className="flex items-center gap-2 bg-[#111217] rounded border border-[#2a2e37] p-0.5">
              {(['ALL', 'INFO', 'ERROR'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1 text-[10px] font-mono rounded-sm transition ${logFilter === f ? 'bg-[#2a2e37] text-white' : 'text-[#71717a] hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          {/* Logs */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] p-4 space-y-1.5 custom-scrollbar">
            {filteredLogs.map((evt, idx) => {
              const isErr = evt.event_type === 'error' || evt.metadata?.overprice_percentage > 0;
              const levelStr = isErr ? '[ERR] ' : '[INFO]';
              const levelColor = isErr ? 'text-red-400' : 'text-blue-400';
              const time = new Date(evt.created_at).toISOString().split('T')[1].substring(0, 12);
              
              return (
                <div key={idx} className="flex gap-3 hover:bg-[#181b1f] px-2 py-0.5 -mx-2 rounded transition-colors group">
                  <span className="text-[#52525b] shrink-0">{time}</span>
                  <span className={`${levelColor} font-bold shrink-0 w-[45px]`}>{levelStr}</span>
                  <span className="text-[#a1a1aa] shrink-0">{evt.event_type.padEnd(14, ' ')}</span>
                  <span className="text-[#e4e4e7] truncate">
                    {evt.metadata?.query ? `QUERY="${evt.metadata.query}"` : ''}
                    {evt.metadata?.store_detected ? ` STORE="${evt.metadata.store_detected}"` : ''}
                    {evt.metadata?.overprice_percentage > 0 ? ` OVERPRICE=+${evt.metadata.overprice_percentage.toFixed(1)}%` : ''}
                    {!evt.metadata?.query && !evt.metadata?.store_detected ? JSON.stringify(evt.metadata || {}) : ''}
                  </span>
                  <span className="text-[#3f3f46] ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {evt.session_id.substring(0, 8)}
                  </span>
                </div>
              );
            })}
            {filteredLogs.length === 0 && (
              <div className="text-[#52525b] text-center pt-10">No logs matching filter.</div>
            )}
          </div>
        </div>

        {/* Top Products / Queries Dense List */}
        <div className="col-span-1 bg-[#181b1f] border border-[#2a2e37] rounded-sm flex flex-col overflow-hidden">
          <div className="border-b border-[#2a2e37] p-2 px-4 flex justify-between items-center">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Top Entities
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 hover:bg-[#2a2e37] rounded-sm cursor-pointer transition-colors">
                <span className="font-mono text-[10px] text-[#52525b] w-4">{idx + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#e4e4e7] truncate">{prod.short_name || prod.name || prod.query}</div>
                  <div className="text-[10px] font-mono text-[#a1a1aa] mt-0.5">
                    VOL: {prod.metrics?.carts || prod.count || 1}
                  </div>
                </div>
                {prod.image_url && (
                  <img src={prod.image_url} alt="" className="w-8 h-8 rounded-sm object-cover border border-[#3f3f46] opacity-80" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
