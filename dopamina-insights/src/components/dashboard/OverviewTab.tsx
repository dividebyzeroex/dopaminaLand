import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, Search, ShieldAlert, BarChart3, AlertCircle, CheckCircle, Bug } from 'lucide-react';

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface-light px-4 py-3 shadow-md ">
      <p className="text-xs font-semibold text-muted">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold text-foreground mt-1">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
        </p>
      ))}
    </div>
  );
};

export default function OverviewTab({ kpis, funnelData, topProducts, timelineData }: {
  kpis: any;
  funnelData: any[];
  topProducts: any[];
  timelineData: any[];
}) {
  const totalSessions = kpis?.totalSessions ?? 0;
  const identifiedLeads = kpis?.identifiedLeads ?? 0;
  const highIntentLeads = kpis?.highIntentLeads ?? 0;
  const frictionIndex = typeof kpis?.frictionIndex === 'number' ? kpis.frictionIndex.toFixed(1) : '0';
  const barrasInstaladas = kpis?.barrasInstaladas ?? 0;
  const lojasAuditadas = kpis?.lojasAuditadas ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Cockpit de Auditoria de Mercado</h2>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          TEMPO REAL
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {[
          { label: 'Sessões Totais', value: totalSessions, icon: Users, color: 'text-foreground' },
          { label: 'Auditores Ativos', value: identifiedLeads, icon: Search, color: 'text-cyan-400' },
          { label: 'Auditores Power', value: highIntentLeads, icon: ShieldAlert, color: 'text-emerald-400' },
          { label: 'Lojas Auditadas', value: lojasAuditadas, icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Barras Instaladas', value: barrasInstaladas, icon: CheckCircle, color: 'text-purple-400' },
          { label: 'Rage Clicks (Fricção)', value: frictionIndex, icon: Bug, color: 'text-rose-500' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-xl border border-border bg-surface-light p-5 shadow-sm hover:border-border transition-colors flex flex-col justify-between">
              <Icon className="h-5 w-5 text-muted mb-3" />
              <div>
                <div className={`text-2xl font-semibold tracking-tight ${kpi.color}`}>{kpi.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel + Top Audited Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold text-foreground">Funil Comportamental de Auditoria</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip content={<GlassTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Bar dataKey="value" fill="url(#gradFunnel)" radius={[6, 6, 0, 0]} animationDuration={800} name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 rounded-xl border border-border bg-surface-light p-6 shadow-sm overflow-hidden">
          <h2 className="mb-6 text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Top Produtos / Buscas
          </h2>
          <div className="flex flex-col gap-3">
            {topProducts.map((prod, idx) => (
              <div key={prod.id || idx} className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5 transition hover:bg-surface-lighter">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-lighter text-[10px] font-bold text-muted group-hover:text-foreground">
                  {idx + 1}
                </div>
                {prod.image_url && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-lighter">
                    <img src={prod.image_url} alt={prod.short_name || prod.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{prod.short_name || prod.name || prod.query}</div>
                  <div className="text-xs text-muted">{prod.metrics?.carts || prod.count || 1} auditorias</div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-muted">Nenhuma auditoria registrada ainda.</p>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold text-foreground">Timeline de Auditorias e Eventos</h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="sessions" stroke="#06b6d4" strokeWidth={2} fill="url(#gradTimeline)" animationDuration={800} name="Eventos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
