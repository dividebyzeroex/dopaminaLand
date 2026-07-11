'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { HubSpotCrmData } from '@/hooks/useInsightsData';

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-xs font-bold text-muted">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-foreground">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
        </p>
      ))}
    </div>
  );
};

export default function HubSpotTab({ data }: { data: HubSpotCrmData | null; error?: string | null }) {
  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">🟠</div>
          <h3 className="text-xl font-bold text-foreground">HubSpot CRM não configurado</h3>
          <p className="mt-2 text-muted max-w-lg mx-auto text-sm">
            Para visualizar dados comerciais reais do HubSpot, adicione a seguinte variável de ambiente no <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code>:
          </p>
          <div className="mt-4 rounded-xl bg-surface-light border border-border p-4 text-left max-w-md mx-auto">
            <code className="text-xs text-foreground block">
              <span className="block">HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>
            </code>
          </div>
          <p className="mt-4 text-xs text-muted max-w-md mx-auto">
            Lembre-se de conceder escopos de leitura para contatos e negócios (<code className="rounded bg-surface px-1">crm.objects.contacts.read</code> e <code className="rounded bg-surface px-1">crm.objects.deals.read</code>) no seu Private App no HubSpot.
          </p>
        </div>
      </div>
    );
  }

  const { kpis, pipelineFunnel, recentContacts } = data;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">HubSpot Live</span>
          </div>
          <div className="text-4xl font-black text-foreground">{kpis.totalContacts.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold text-muted">Contatos Totais (Leads)</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">💼</div>
          <div className="mt-2 text-4xl font-black text-foreground">{kpis.totalDeals.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Negócios no Pipeline</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">💰</div>
          <div className="mt-2 text-4xl font-black text-emerald-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(kpis.pipelineValue)}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Valor de Pipeline Total</div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🏆</div>
          <div className="mt-2 text-4xl font-black text-orange-500">{kpis.closedWon.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Negócios Ganhos (Won)</div>
        </div>
      </div>

      {/* Pipeline Stages Funnel & Recent Leads */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Pipeline Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
            📊 Funil Comercial por Estágio
          </h2>
          {pipelineFunnel.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineFunnel} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradHubspotPipeline" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.95} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 11, fontWeight: 700 }} width={160} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="value" fill="url(#gradHubspotPipeline)" radius={[0, 8, 8, 0]} animationDuration={800} name="Negócios" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-2xl bg-surface-light">
              <p className="text-sm text-muted">Nenhum negócio comercial cadastrado no pipeline.</p>
            </div>
          )}
        </div>

        {/* Recent Leads list */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8 flex flex-col justify-between">
          <div>
            <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
              ⚡ Últimos Contatos no CRM
            </h2>
            <div className="space-y-4">
              {recentContacts.map((contact, i) => (
                <div key={contact.id || i} className="flex items-start justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-foreground truncate">{contact.name}</p>
                    <p className="text-xs text-muted truncate">{contact.email}</p>
                    <p className="text-[10px] text-muted/70 mt-0.5">{contact.createdDate}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    contact.status === 'OPEN' ? 'bg-cyan-100 text-cyan-800' :
                    contact.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {contact.status}
                  </span>
                </div>
              ))}
              {recentContacts.length === 0 && (
                <p className="text-sm text-muted text-center py-8">Nenhum lead criado recentemente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
