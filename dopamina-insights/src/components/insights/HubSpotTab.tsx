'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import type { HubSpotCrmData } from '@/hooks/useInsightsData';

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/20 bg-zinc-900/90 px-4 py-3 shadow-[0_0_40px_rgba(249,115,22,0.05)] backdrop-blur-md text-white text-xs">
      <p className="font-extrabold text-zinc-300">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-black mt-1 text-orange-400">
          {p.name}: {typeof p.value === 'number' ? (
            p.dataKey === 'amount' 
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)
              : p.value.toLocaleString('pt-BR')
          ) : p.value}
        </p>
      ))}
    </div>
  );
};

const STAGE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

export default function HubSpotTab({ data }: { data: HubSpotCrmData | null; error?: string | null }) {
  if (!data || !data.kpis) {
    return (
      <div className="animate-fade-in py-12">
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/30 p-12 text-center text-white shadow-[0_0_40px_rgba(249,115,22,0.05)]">
          <div className="text-6xl mb-6 animate-pulse">🟠</div>
          <h3 className="text-2xl font-black tracking-tight">HubSpot Enterprise CRM Não Conectado</h3>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
            Para visualizar o pipeline comercial em tempo real, forecasting de receita e contatos do HubSpot, certifique-se de que a chave <code className="rounded bg-zinc-800 px-2 py-1 text-orange-400 font-mono text-xs">HUBSPOT_ACCESS_TOKEN</code> está ativa no arquivo <code className="rounded bg-zinc-800 px-2 py-1 text-orange-400 font-mono text-xs">.env.local</code>.
          </p>
          <div className="mt-6 rounded-2xl bg-zinc-900/80 border border-white/10 p-5 text-left max-w-lg mx-auto font-mono text-xs text-zinc-300">
            <span className="text-zinc-500"># HubSpot Private App Access Token</span>
            <br />
            <span className="text-orange-400">HUBSPOT_ACCESS_TOKEN</span>=<span className="text-emerald-400">pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</span>
          </div>
          <p className="mt-6 text-xs text-zinc-500 max-w-md mx-auto">
            Necessita das permissões de leitura: <code className="text-zinc-400">crm.objects.contacts.read</code>, <code className="text-zinc-400">crm.objects.deals.read</code> e <code className="text-zinc-400">crm.objects.companies.read</code>.
          </p>
        </div>
      </div>
    );
  }

  const { kpis, pipelineFunnel, lifecycleStages, topDeals, recentContacts, topCompanies } = data;

  const formattedPipelineValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(kpis.pipelineValue || 0);
  const formattedClosedWonValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(kpis.closedWonValue || 0);
  const formattedAvgTicket = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.avgDealSize || 0);

  return (
    <div className="animate-fade-in space-y-8 pb-16">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Total Contacts */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition hover:border-orange-500/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span>CONTATOS</span>
            <span className="text-orange-400">CRM</span>
          </div>
          <p className="mt-2 text-3xl font-black text-white">{kpis.totalContacts?.toLocaleString('pt-BR') || 0}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Leads mapeados na base</p>
        </div>

        {/* Total Deals */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition hover:border-blue-500/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span>NEGÓCIOS</span>
            <span className="text-blue-400">Pipeline</span>
          </div>
          <p className="mt-2 text-3xl font-black text-white">{kpis.totalDeals?.toLocaleString('pt-BR') || 0}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Oportunidades criadas</p>
        </div>

        {/* Pipeline Value */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-xl transition hover:border-emerald-500/50">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>VALOR DO PIPELINE</span>
            <span>R$</span>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-400">{formattedPipelineValue}</p>
          <p className="mt-1 text-[11px] text-emerald-200/70">Volume total em negociação</p>
        </div>

        {/* Closed Won */}
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 shadow-xl transition hover:border-orange-500/50">
          <div className="flex items-center justify-between text-xs font-bold text-orange-400">
            <span>FECHADO (WON)</span>
            <span>🎉</span>
          </div>
          <p className="mt-2 text-3xl font-black text-orange-400">{kpis.closedWonCount || 0}</p>
          <p className="mt-1 text-[11px] text-orange-200/70">{formattedClosedWonValue} em receitas</p>
        </div>

        {/* Win Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span>WIN RATE</span>
            <span className="text-indigo-400">Conversão</span>
          </div>
          <p className="mt-2 text-3xl font-black text-indigo-400">{kpis.winRate || 0}%</p>
          <p className="mt-1 text-[11px] text-zinc-500">Taxa de ganho comercial</p>
        </div>

        {/* Average Ticket */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition hover:border-purple-500/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
            <span>TICKET MÉDIO</span>
            <span className="text-purple-400">ACV</span>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-300">{formattedAvgTicket}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Valor médio por contrato</p>
        </div>
      </div>

      {/* Pipeline Funnel & Lifecycle Stages Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Pipeline Value Bar Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-[0_0_40px_rgba(249,115,22,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-[var(--font-display)] text-lg font-black uppercase tracking-wide text-white flex items-center gap-2">
                <span>📊 Distribuição Financeira por Estágio do Pipeline</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Volume em R$ em cada etapa do processo de vendas do HubSpot</p>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shrink-0">
              {pipelineFunnel?.length || 0} Estágios Ativos
            </span>
          </div>

          {pipelineFunnel && pipelineFunnel.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineFunnel} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradHubspotPipeline" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#f8fafc', fontSize: 11, fontWeight: 700 }} width={160} />
                    <Tooltip content={<GlassTooltip />} />
                    <Bar dataKey="amount" fill="url(#gradHubspotPipeline)" radius={[0, 8, 8, 0]} animationDuration={800} name="Valor (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stage breakdown cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-zinc-800">
                {pipelineFunnel.map((st, idx) => (
                  <div key={st.stageId} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                    <span className="text-xs text-zinc-400 font-bold block truncate">{st.icon} {st.name}</span>
                    <span className="text-sm font-black text-white block mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(st.amount)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">{st.count} negócios</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40">
              <p className="text-sm text-zinc-400">Nenhum negócio ativo cadastrado no pipeline do HubSpot.</p>
            </div>
          )}
        </div>

        {/* Contacts Lifecycle Stages (Maturidade da Base) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-[0_0_40px_rgba(249,115,22,0.05)] flex flex-col justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-lg font-black uppercase tracking-wide text-white flex items-center gap-2 mb-2">
              <span>🎯 Estágio de Vida dos Contatos</span>
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Maturidade da base de leads (Subscriber → Customer)</p>

            {lifecycleStages && lifecycleStages.length > 0 ? (
              <div className="space-y-4">
                {lifecycleStages.map((lc, i) => {
                  const maxCount = lifecycleStages[0]?.count || 1;
                  const pct = Math.round((lc.count / maxCount) * 100);
                  const color = STAGE_COLORS[i % STAGE_COLORS.length];
                  return (
                    <div key={lc.stageKey} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{lc.label}</span>
                        <span className="font-black text-orange-400">{lc.count.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500">Nenhum dado de estagio de vida disponível.</div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Empresas Cadastradas (B2B):</span>
            <span className="font-bold text-white">{kpis.totalCompanies || 0} contas</span>
          </div>
        </div>
      </div>

      {/* Top High-Value Deals & Recent Contacts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Deals Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-[0_0_40px_rgba(249,115,22,0.05)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>🔥 Maiores Oportunidades em Aberto</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Top 5 negócios por valor financeiro no HubSpot</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold font-mono">Ranking por R$</span>
          </div>

          {topDeals && topDeals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="pb-3">Negócio</th>
                    <th className="pb-3">Valor (R$)</th>
                    <th className="pb-3">Estágio</th>
                    <th className="pb-3 text-right">Fechamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-medium">
                  {topDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-zinc-900/60 transition">
                      <td className="py-3.5 font-bold text-white truncate max-w-[180px]">{deal.name}</td>
                      <td className="py-3.5 font-black text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.amount)}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-block bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {deal.stage}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-zinc-400 font-mono text-[11px]">{deal.closeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">Nenhum negócio ativo listado.</div>
          )}
        </div>

        {/* Recent Contacts Feed */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 shadow-[0_0_40px_rgba(249,115,22,0.05)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>⚡ Últimos Contatos e Leads Capturados</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Feed em tempo real das novas entradas no HubSpot</p>
            </div>
            <span className="text-xs text-orange-400 font-bold font-mono">Stream Live</span>
          </div>

          {recentContacts && recentContacts.length > 0 ? (
            <div className="space-y-3.5">
              {recentContacts.map((contact, i) => (
                <div key={contact.id || i} className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 hover:border-orange-500/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 font-black text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-white truncate">{contact.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{contact.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-800 text-orange-400 border border-zinc-700">
                      {contact.stage}
                    </span>
                    <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">{contact.createdDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">Nenhum contato recente registrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
