import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, Mail, TrendingUp, Flame, AlertCircle } from 'lucide-react';

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#121214]/90 px-4 py-3 shadow-2xl backdrop-blur-md">
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
  return (
    <div className="animate-fade-in space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Sessões Totais', value: kpis.totalSessions, icon: Users, color: 'text-foreground' },
          { label: 'Leads Identificados', value: kpis.identifiedLeads, icon: Mail, color: 'text-indigo-500' },
          { label: 'Taxa de Identificação', value: `${kpis.identificationRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Alta Intenção', value: kpis.highIntentLeads, icon: Flame, color: 'text-rose-500' },
          { label: 'Índice de Fricção', value: `${kpis.frictionIndex.toFixed(1)}%`, icon: AlertCircle, color: 'text-amber-500' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-xl border border-border bg-surface-light p-6 shadow-sm hover:border-white/20 transition-colors">
              <Icon className="h-6 w-6 text-muted mb-4" />
              <div className={`text-3xl font-semibold tracking-tight ${kpi.color}`}>{kpi.value}</div>
              <div className="mt-1 text-xs font-medium text-muted">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Funnel + Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold text-foreground">Funil de Intenção</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.3} />
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
          <h2 className="mb-6 text-sm font-semibold text-foreground">Top Produtos (Adições ao Carrinho)</h2>
          <div className="flex flex-col gap-3">
            {topProducts.map((prod, idx) => (
              <div key={prod.id} className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5 transition hover:bg-surface-lighter">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-lighter text-[10px] font-bold text-muted group-hover:text-foreground">
                  {idx + 1}
                </div>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-lighter">
                  <img src={prod.image_url} alt={prod.short_name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{prod.short_name}</div>
                  <div className="text-xs text-muted">{prod.metrics.carts} adições</div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-muted">Nenhum dado de produto ainda.</p>}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold text-foreground">Timeline de Interações</h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="interacoes" stroke="#10b981" strokeWidth={2} fill="url(#gradTimeline)" animationDuration={800} name="Interações" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
