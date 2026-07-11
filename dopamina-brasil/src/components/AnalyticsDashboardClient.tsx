'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useInsightsData } from '@/hooks/useInsightsData';
import PostHogTab from '@/components/insights/PostHogTab';

const COLORS = ['#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981', '#ff00ff'];

// ── Glassmorphism Tooltip ──
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

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'posthog' | 'ga4' | 'ecommerce' | 'intent' | 'ux' | 'marketing'>('overview');

  // Intent UI state
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState<'all' | 'Awareness' | 'Consideration' | 'Decision'>('all');
  const [leadSortBy, setLeadSortBy] = useState<'score' | 'events' | 'fakeRev'>('score');
  const [crmIntegrationStatus, setCrmIntegrationStatus] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});

  const {
    loading, fetchDashboardData,
    kpis, funnelData, topProducts, timelineData, demographics, hardware, uxMetrics, ecommerceInsights,
    intentData, scoreWeights, setScoreWeights,
    ga4Data, posthogData,
  } = useInsightsData();

  const handleCrmSync = (leadId: string, type: 'hubspot' | 'salesforce' | 'slack') => {
    const key = `${leadId}-${type}`;
    setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'loading' }));
    setTimeout(() => {
      setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'success' }));
      setSuccessToast(`Lead sincronizado com o ${type.toUpperCase()}! 🚀`);
      setTimeout(() => setSuccessToast(null), 3000);
    }, 1200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dopamina') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setError('Senha incorreta. Dica: dopamina');
    }
  };

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface-light p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-4 font-[var(--font-display)] text-2xl font-black text-foreground">
              Acesso Restrito
            </h1>
            <p className="text-sm text-muted">Dashboard de Insights Avançados v4</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
              autoFocus
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button type="submit" className="rounded-xl bg-neon px-8 py-4 font-extrabold text-white transition hover:scale-105 active:scale-95">
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: '📊 Visão Geral' },
    { id: 'posthog', label: '🦔 PostHog Analytics' },
    { id: 'ga4', label: '📈 Google Analytics' },
    { id: 'ecommerce', label: '🛒 E-commerce' },
    { id: 'intent', label: '🎯 Intent Data B2B' },
    { id: 'ux', label: '🖱️ Telemetria UX' },
    { id: 'marketing', label: '📣 Campanhas' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-4xl font-black text-foreground md:text-5xl">
            Telemetria Avançada 📡
          </h1>
          <p className="mt-2 text-lg font-medium text-muted">
            Insights de Comportamento, Marketing e Intenção de Compra.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="rounded-xl bg-surface-light px-6 py-3 font-bold text-foreground transition hover:bg-border"
        >
          {loading ? 'Atualizando...' : '🔄 Atualizar Dados'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-bold whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id
                ? 'border-neon text-neon'
                : 'border-transparent text-muted hover:text-foreground hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && timelineData.length === 0 ? (
        <div className="flex py-20 justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-neon border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ═══════════ TAB: VISÃO GERAL ═══════════ */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              {/* KPI Cards */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="text-2xl">👥</div>
                  <div className="mt-2 text-4xl font-black text-foreground">{kpis.totalSessions}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Sessões Totais</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="text-2xl">💸</div>
                  <div className="mt-2 text-4xl font-black text-emerald-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(kpis.fakeRevenue)}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Faturamento "Perdido"</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="text-2xl">🛍️</div>
                  <div className="mt-2 text-4xl font-black text-neon">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.aov)}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Ticket Médio (AOV)</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div className="text-2xl">🏃</div>
                  <div className="mt-2 text-4xl font-black text-rose-500">{kpis.cartAbandonment.toFixed(1)}%</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Abandono de Carrinho</div>
                </div>
              </div>

              {/* Funnel + Top Products */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">📉 Funil de Intenção</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="gradFunnel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff00ff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip content={<GlassTooltip />} />
                        <Bar dataKey="value" fill="url(#gradFunnel)" radius={[12, 12, 0, 0]} animationDuration={800} animationEasing="ease-out" name="Quantidade" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-1 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">🔥 Top Produtos</h2>
                  <div className="flex flex-col gap-4">
                    {topProducts.map((prod, idx) => (
                      <div key={prod.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface-light p-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">{idx + 1}</div>
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                          <img src={prod.image_url} alt={prod.short_name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-bold text-foreground">{prod.short_name}</div>
                          <div className="text-xs text-muted">{prod.metrics.carts} adições ao carrinho</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {timelineData.length > 0 && (
                <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">📅 Timeline de Interações</h2>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradTimeline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <Tooltip content={<GlassTooltip />} />
                        <Area type="monotone" dataKey="interacoes" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradTimeline)" animationDuration={800} name="Interações" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: POSTHOG ═══════════ */}
          {activeTab === 'posthog' && (
            <PostHogTab data={posthogData} />
          )}

          {/* ═══════════ TAB: GOOGLE ANALYTICS ═══════════ */}
          {activeTab === 'ga4' && (
            <div className="animate-fade-in space-y-6">
              {ga4Data && ga4Data !== 'empty' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl border-2 border-neon bg-neon/5 p-6 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neon" />
                      </span>
                      <div className="text-xs font-bold uppercase tracking-wider text-neon">Agora</div>
                    </div>
                    <div className="text-4xl font-black text-foreground">{ga4Data.realtimeUsers || '0'}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Usuários Ativos (30m)</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="text-2xl">👥</div>
                    <div className="mt-2 text-4xl font-black text-foreground">{ga4Data.activeUsers}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Usuários Ativos (30d)</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="text-2xl">🌐</div>
                    <div className="mt-2 text-4xl font-black text-foreground">{ga4Data.sessions}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Sessões (30d)</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="text-2xl">👀</div>
                    <div className="mt-2 text-4xl font-black text-foreground">{ga4Data.pageViews}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Page Views (30d)</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                    <div className="text-2xl">⚡</div>
                    <div className="mt-2 text-4xl font-black text-foreground">{ga4Data.bounceRate}%</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Taxa de Rejeição</div>
                  </div>
                </div>
              ) : ga4Data === 'empty' ? (
                <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
                  <div className="text-4xl mb-4">⏳</div>
                  <h3 className="text-xl font-bold text-foreground">Processando Dados...</h3>
                  <p className="mt-2 text-muted max-w-lg mx-auto">A API conectou com sucesso, mas o Google Analytics ainda não processou os dados desta propriedade. O GA4 costuma levar de 24 a 48 horas.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-foreground">API do Google Analytics não configurada</h3>
                  <p className="mt-2 text-muted max-w-lg mx-auto">Configure <code>GA_PROPERTY_ID</code>, <code>GA_CLIENT_EMAIL</code> e <code>GA_PRIVATE_KEY</code> no painel da Vercel.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: E-COMMERCE ═══════════ */}
          {activeTab === 'ecommerce' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface-light p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><span>🔍</span> Termos Mais Buscados</h3>
                  {ecommerceInsights.searchTerms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {ecommerceInsights.searchTerms.map((term, i) => (
                        <span key={i} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm">
                          <span className="font-medium text-foreground">{term.name}</span>
                          <span className="text-muted">{term.value}x</span>
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted">Nenhuma busca registrada ainda.</p>}
                </div>
                <div className="rounded-2xl border border-border bg-surface-light p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><span>🤝</span> Comprados Juntos (Cesta)</h3>
                  {ecommerceInsights.boughtTogether.length > 0 ? (
                    <div className="space-y-3">
                      {ecommerceInsights.boughtTogether.map((pair, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                          <span className="text-sm font-medium text-foreground">{pair.name}</span>
                          <span className="shrink-0 rounded-full bg-neon/10 px-2 py-1 text-xs font-bold text-neon">{pair.value} pedidos</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted">Nenhum padrão de cesta identificado.</p>}
                </div>
              </div>

              {/* Carrinhos Abandonados */}
              <div className="rounded-2xl border border-border bg-surface-light p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><span>🛒</span> Carrinhos Abandonados (Lost Revenue)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Sessão ID</th>
                        <th className="pb-3 font-medium">Valor Perdido</th>
                        <th className="pb-3 font-medium">Itens no Carrinho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ecommerceInsights.abandonedCarts.map((cart, i) => (
                        <tr key={i} className="transition hover:bg-surface">
                          <td className="py-4 text-foreground">{cart.date}</td>
                          <td className="py-4 text-muted"><code className="rounded bg-surface px-1">{cart.sid.split('-')[0]}</code></td>
                          <td className="py-4 font-bold text-pop">R$ {cart.value.toFixed(2)}</td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1">
                              {cart.items.map((item: any, j: number) => (
                                <span key={j} className="text-xs text-muted">• {item.qty}x {item.name}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {ecommerceInsights.abandonedCarts.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-muted">Nenhum carrinho abandonado. A conversão está voando!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Funil de Produtos */}
              <div className="rounded-2xl border border-border bg-surface-light p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><span>📦</span> Funil de Produtos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-medium">Produto</th>
                        <th className="pb-3 font-medium text-center">Visualizações</th>
                        <th className="pb-3 font-medium text-center">Adições ao Carrinho</th>
                        <th className="pb-3 font-medium text-right">Faturamento (Fake)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ecommerceInsights.topProducts.map((p, i) => (
                        <tr key={i} className="transition hover:bg-surface">
                          <td className="py-4 text-foreground max-w-[250px] truncate" title={p.name}>{p.name}</td>
                          <td className="py-4 text-center text-muted">{p.views}</td>
                          <td className="py-4 text-center text-muted">{p.carts}</td>
                          <td className="py-4 text-right font-bold text-neon">R$ {p.rev.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: INTENT DATA B2B ═══════════ */}
          {activeTab === 'intent' && (
            <div className="animate-fade-in space-y-8 pb-12">
              {/* Funnel Stages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm border-t-4 border-t-cyan-400">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">1. Awareness (Frio)</h3>
                  <p className="mt-2 text-4xl font-black text-cyan-500">{intentData.funnelStages.awareness}</p>
                  <p className="text-xs text-muted mt-1">Apenas navegando (Score &lt; 20)</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm border-t-4 border-t-amber-400">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">2. Consideration (Morno)</h3>
                  <p className="mt-2 text-4xl font-black text-amber-500">{intentData.funnelStages.consideration}</p>
                  <p className="text-xs text-muted mt-1">Engajados (Score 20-50)</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm border-t-4 border-t-rose-500">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">3. Decision (Quente)</h3>
                  <p className="mt-2 text-4xl font-black text-rose-500">{intentData.funnelStages.decision}</p>
                  <p className="text-xs text-muted mt-1">Alta intenção (Score &gt; 50)</p>
                </div>
              </div>

              {/* Algorithm Settings */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">⚙️ Algoritmo de Intent Score</h2>
                  <button onClick={() => setShowWeightSettings(!showWeightSettings)} className="rounded-xl bg-surface px-4 py-2 text-xs font-bold text-muted transition hover:bg-border">
                    {showWeightSettings ? 'Recolher 🔼' : 'Ajustar Pesos ⚙️'}
                  </button>
                </div>
                <p className="text-xs text-muted mb-4">Personalize a pontuação atribuída a cada evento para calibrar os estágios do funil B2B.</p>
                {showWeightSettings ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border animate-fade-in">
                    {Object.entries(scoreWeights).map(([key, val]) => {
                      const labels: Record<string, string> = { view_item: 'Visualização de Item', add_to_cart: 'Adição ao Carrinho', fake_checkout: 'Checkout (Simulado)', rage_click: 'Rage Clicks', share_product: 'Compartilhar', dwell_time_exceeded: 'Dwell Time', search: 'Busca Realizada', cart_abandoned: 'Carrinho Abandonado (Penalidade)' };
                      const isNeg = key === 'cart_abandoned';
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">{labels[key] || key}</span>
                            <span className={isNeg ? 'text-rose-500' : 'text-neon'}>{val} pts</span>
                          </div>
                          <input type="range" min={isNeg ? -30 : 0} max={isNeg ? 0 : key === 'fake_checkout' ? 100 : 50} step={1} value={val} onChange={(e) => setScoreWeights({ ...scoreWeights, [key]: parseInt(e.target.value) })} className={`w-full ${isNeg ? 'accent-rose-500' : 'accent-neon'}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-surface-light px-4 py-3 flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Status do Algoritmo: Padrão Calibrado 🚀</span>
                    <button onClick={() => setShowWeightSettings(true)} className="font-bold text-neon hover:underline">Visualizar Variáveis</button>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="relative w-full md:w-80">
                  <input type="text" placeholder="Buscar por sessão, UF, fonte..." value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon transition" />
                </div>
                <div className="flex w-full md:w-auto gap-4">
                  <select value={leadStageFilter} onChange={(e: any) => setLeadStageFilter(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon cursor-pointer">
                    <option value="all">Todos os Estágios</option>
                    <option value="Decision">Decision (Quente)</option>
                    <option value="Consideration">Consideration (Morno)</option>
                    <option value="Awareness">Awareness (Frio)</option>
                  </select>
                  <select value={leadSortBy} onChange={(e: any) => setLeadSortBy(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon cursor-pointer">
                    <option value="score">Ordenar por Intent Score</option>
                    <option value="events">Ordenar por Ações</option>
                    <option value="fakeRev">Ordenar por Receita Potencial</option>
                  </select>
                </div>
              </div>

              {/* Leads Table */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">🎯 Radar de Intenção (Top Leads)</h2>
                  <span className="flex items-center gap-2 text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Live
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Sessão / Dispositivo</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Origem / Canal</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Estágio & Score</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Interesses</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right text-xs">Receita Potencial</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right text-xs">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {intentData.topLeads
                        .filter(lead => {
                          const query = leadSearchQuery.toLowerCase().trim();
                          const matchesSearch = !query || lead.deviceLocal.toLowerCase().includes(query) || lead.source.toLowerCase().includes(query) || lead.id.toLowerCase().includes(query);
                          const matchesStage = leadStageFilter === 'all' || lead.stage === leadStageFilter;
                          return matchesSearch && matchesStage;
                        })
                        .sort((a, b) => {
                          if (leadSortBy === 'score') return b.score - a.score;
                          if (leadSortBy === 'events') return b.events - a.events;
                          return b.fakeRev - a.fakeRev;
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="transition hover:bg-surface-light">
                            <td className="py-4 font-bold text-foreground">
                              <div className="text-sm font-black">{lead.deviceLocal}</div>
                              <div className="text-[10px] text-muted font-mono">{lead.id.split('-')[0]}...</div>
                            </td>
                            <td className="py-4 text-muted max-w-[150px] truncate">
                              <span className="text-xs font-semibold bg-surface px-2 py-1 rounded-lg border border-border block w-max max-w-[140px] truncate">{lead.source}</span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold mb-1.5 ${lead.stage === 'Decision' ? 'bg-rose-100 text-rose-700' : lead.stage === 'Consideration' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>{lead.stage}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-foreground text-xs">{lead.score}</span>
                                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-light">
                                  <div className={`h-full rounded-full ${lead.score > 50 ? 'bg-rose-500' : lead.score > 20 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (lead.score / 100) * 100)}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col gap-1 max-w-[220px]">
                                {lead.carts.length > 0 && <div className="text-xs"><span className="font-bold text-purple-600">🛒 </span><span className="text-foreground font-semibold truncate">{lead.carts.join(', ')}</span></div>}
                                {lead.views.length > 0 && <div className="text-xs"><span className="font-bold text-muted">👀 </span><span className="text-muted truncate">{lead.views.join(', ')}</span></div>}
                                {lead.carts.length === 0 && lead.views.length === 0 && <span className="text-xs text-muted">Apenas navegou</span>}
                              </div>
                            </td>
                            <td className="py-4 text-right font-black text-neon text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.fakeRev)}
                            </td>
                            <td className="py-4 text-right">
                              <button onClick={() => setSelectedLead(lead)} className="rounded-lg bg-surface hover:bg-border px-3 py-1.5 text-xs font-bold text-foreground transition">Ver ➔</button>
                            </td>
                          </tr>
                        ))}
                      {intentData.topLeads.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-muted">Nenhum lead com intenção detectado ainda.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lead Drawer */}
              {selectedLead && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                  <div className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] border-l border-border bg-white shadow-2xl">
                    <div className="flex h-full flex-col overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-border p-6 bg-surface-light">
                        <div>
                          <h2 className="text-md font-black text-foreground">{selectedLead.deviceLocal}</h2>
                          <p className="text-xs text-muted font-mono">{selectedLead.id}</p>
                        </div>
                        <button onClick={() => setSelectedLead(null)} className="rounded-lg p-2 text-muted hover:bg-border hover:text-foreground text-sm font-bold">✕</button>
                      </div>
                      <div className="flex-1 p-6 space-y-8">
                        {/* Score Card */}
                        <div className="rounded-2xl border border-border bg-surface-light p-5 space-y-4 shadow-inner">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Inteligência de Compra</h3>
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativa
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Intent Score</div>
                              <div className="text-3xl font-black text-foreground mt-0.5">{selectedLead.score}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Temperatura</div>
                              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${selectedLead.stage === 'Decision' ? 'bg-rose-100 text-rose-700' : selectedLead.stage === 'Consideration' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>
                                {selectedLead.stage === 'Decision' ? '🔥 Quente' : selectedLead.stage === 'Consideration' ? '⚡ Morno' : '❄️ Frio'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-muted">Probabilidade de Compra</span>
                              <span className="text-foreground">{Math.min(99, Math.max(5, selectedLead.score * 1.3)).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                              <div className={`h-full rounded-full transition-all duration-500 ${selectedLead.score > 50 ? 'bg-rose-500' : selectedLead.score > 20 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, Math.max(5, selectedLead.score * 1.3))}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Dados da Sessão</h3>
                          <div className="rounded-2xl border border-border divide-y divide-border text-xs bg-white">
                            <div className="flex justify-between p-3.5"><span className="text-muted">Dispositivo</span><span className="font-bold text-foreground">{selectedLead.deviceLocal}</span></div>
                            <div className="flex justify-between p-3.5"><span className="text-muted">Origem</span><span className="font-bold text-foreground">{selectedLead.source}</span></div>
                            <div className="flex justify-between p-3.5"><span className="text-muted">Última atividade</span><span className="font-bold text-foreground">{selectedLead.lastActive}</span></div>
                            <div className="flex justify-between p-3.5"><span className="text-muted">Total de eventos</span><span className="font-bold text-foreground">{selectedLead.events}</span></div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Jornada de Ações</h3>
                          <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
                            {selectedLead.timeline?.map((item: any, idx: number) => {
                              let icon = '👀', color = 'bg-slate-400', text = `Viu: ${item.product_name || 'Produto'}`;
                              if (item.event_type === 'add_to_cart') { icon = '🛒'; color = 'bg-purple-600 text-white'; text = `Carrinho: ${item.product_name || 'Produto'}`; }
                              else if (item.event_type === 'fake_checkout') { icon = '⚡'; color = 'bg-rose-500 text-white'; text = `Checkout R$ ${item.price_displayed?.toFixed(2)}`; }
                              else if (item.event_type === 'rage_click') { icon = '💢'; color = 'bg-red-500 text-white animate-pulse'; text = 'Rage Click!'; }
                              else if (item.event_type === 'search') { icon = '🔍'; color = 'bg-cyan-500 text-white'; text = `Buscou: "${item.metadata?.query || ''}"`; }
                              else if (item.event_type === 'share_product') { icon = '🔗'; color = 'bg-indigo-500 text-white'; text = `Compartilhou: ${item.product_name}`; }
                              else if (item.event_type === 'dwell_time_exceeded') { icon = '⏱️'; color = 'bg-amber-500 text-white'; text = 'Tempo de leitura alto'; }
                              else if (item.event_type === 'cart_abandoned') { icon = '🏃'; color = 'bg-orange-500 text-white'; text = `Abandonou R$ ${item.price_displayed?.toFixed(2)}`; }
                              return (
                                <div key={item.id || idx} className="relative text-xs">
                                  <span className={`absolute -left-[37px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-white ${color}`}>{icon}</span>
                                  <div>
                                    <div className="font-bold text-foreground">{text}</div>
                                    <div className="text-[10px] text-muted mt-0.5">{new Date(item.created_at).toLocaleTimeString('pt-BR')}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CRM Sync */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Sincronizar CRM</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {(['hubspot', 'salesforce', 'slack'] as const).map(type => {
                              const icons = { hubspot: '🟠', salesforce: '🔵', slack: '💬' };
                              const labels = { hubspot: 'HubSpot', salesforce: 'Salesforce', slack: 'Slack' };
                              const key = `${selectedLead.id}-${type}`;
                              const status = crmIntegrationStatus[key];
                              return (
                                <button key={type} onClick={() => handleCrmSync(selectedLead.id, type)} disabled={status === 'loading'}
                                  className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold text-foreground transition hover:bg-surface-light disabled:opacity-70">
                                  <div className="flex items-center gap-2"><span>{icons[type]}</span><span>{labels[type]}</span></div>
                                  {status === 'loading' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" /> : status === 'success' ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-xs text-muted">Sync</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Toast */}
              {successToast && (
                <div className="fixed bottom-6 left-6 z-[100] rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg animate-bounce flex items-center gap-2 text-sm border-2 border-white">
                  <span>✨</span><span>{successToast}</span>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: UX TELEMETRY ═══════════ */}
          {activeTab === 'ux' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Dwell Time Médio</h3>
                    <p className="mt-1 text-3xl font-black text-foreground">{uxMetrics.avgDwellTime}s</p>
                    <p className="text-xs text-muted mt-1">Tempo na página antes de sair</p>
                  </div>
                  <div className="text-4xl">⏱️</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Rage Clicks Detectados</h3>
                    <p className="mt-1 text-3xl font-black text-rose-500">{uxMetrics.rageClicksCount}</p>
                    <p className="text-xs text-muted mt-1">Cliques múltiplos em frustração</p>
                  </div>
                  <div className="text-4xl">💢</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">📜 Profundidade de Scroll</h2>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={uxMetrics.scrollDepthMap} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="gradScroll" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip content={<GlassTooltip />} />
                        <Bar dataKey="value" fill="url(#gradScroll)" radius={[12, 12, 0, 0]} animationDuration={800} name="Usuários" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">💻 Demografia Tecnológica</h2>
                  <div className="flex flex-col gap-3">
                    {demographics.os.map((st) => (
                      <div key={st.name} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                        <span className="text-sm font-bold text-foreground">{st.name}</span>
                        <div className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{st.value} sessões</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hardware Fingerprint */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">🔋 Hardware & Conexão</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { title: 'Rede', data: hardware.connection },
                    { title: 'Memória RAM', data: hardware.ram },
                    { title: 'Processador', data: hardware.cores },
                    { title: 'Tema', data: hardware.theme },
                  ].map(section => (
                    <div key={section.title} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{section.title}</h3>
                      {section.data.length > 0 ? section.data.map(c => (
                        <div key={c.name} className="flex justify-between items-center text-sm font-medium">
                          <span>{c.name}</span>
                          <span className="text-neon font-bold">{c.value}</span>
                        </div>
                      )) : <div className="text-sm text-muted">Sem dados</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB: MARKETING ═══════════ */}
          {activeTab === 'marketing' && (
            <div className="animate-fade-in space-y-8 pb-12">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-[var(--font-display)] text-2xl font-black text-foreground">📣 Central de Conteúdo e Campanhas</h2>
                    <p className="text-sm text-muted mt-1">Idéias de posts de alta conversão para redes sociais.</p>
                  </div>
                  <span className="text-3xl shrink-0">💡</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { badge: '🎬 Reels', badgeColor: 'bg-pink-100 text-pink-700', obj: 'Atração', title: 'Cleiton contra o Tempo', desc: 'Roteiro focado em demonstrar a velocidade de entrega do motoboy "Cleiton".', script: 'Roteiro: Alguém rolando o celular triste. Fatura R$ 0,15. Abertura do Dopaminado e compra grátis. Moto do Cleiton cortando giro.', prompt: '3D render, delivery courier character wearing a green cybernetic helmet, riding an electric neon scooter, cyberpunk background' },
                  { badge: '🎠 Carrossel', badgeColor: 'bg-blue-100 text-blue-700', obj: 'Engajamento', title: 'O Ciclo da Compra por Impulso', desc: 'Infográfico cômico explicando a psicologia por trás da dopamina.', script: 'Slide 1: Ciclo do Consumidor. Slide 2: Tédio. Slide 3: O clique. Slide 4: A ressaca da fatura. Slide 5: Solução Dopaminado.', prompt: 'Instagram post, dark mode cyberpunk, neon purple and lime green accents, minimalist tech interface design' },
                  { badge: '🖼️ Meme', badgeColor: 'bg-purple-100 text-purple-700', obj: 'Viralidade', title: 'A Fatura Invisível', desc: 'Meme contrastando um carrinho alto com custo zero.', script: 'Sem faturas. Sem ligações de cobrança. Apenas dopamina direto no celular. Compre tudo o que não precisa!', prompt: '3D render, cyberpunk smartphone floating, neon interface, electric violet and glowing neon lime-green' },
                  { badge: '📱 Stories', badgeColor: 'bg-amber-100 text-amber-700', obj: 'Conversão', title: 'Termômetro de Dopamina Diária', desc: 'Enquetes interativas para medir vontade de consumo impulsivo.', script: 'Enquete: Onde você busca dopamina hoje? Opções: comprando blusas, comendo doces, no Dopaminado de graça.', prompt: 'Escreva 5 frases curtas e impactantes para Instagram sobre o app Dopaminado. Tom humorístico e sarcástico.' },
                ].map((post, i) => (
                  <div key={i} className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full ${post.badgeColor} px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider`}>{post.badge}</span>
                        <span className="text-xs text-muted font-bold">Objetivo: {post.obj}</span>
                      </div>
                      <h3 className="text-lg font-black text-foreground">{post.title}</h3>
                      <p className="text-xs text-muted">{post.desc}</p>
                      <div className="rounded-xl bg-surface-light p-3.5 border border-border text-xs">
                        <div className="font-bold text-foreground">Roteiro:</div>
                        <p className="text-muted leading-relaxed italic mt-1">{post.script}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(post.script); setSuccessToast('Copiado! 📋'); setTimeout(() => setSuccessToast(null), 2000); }}
                        className="flex-1 rounded-xl bg-surface hover:bg-border py-2.5 text-xs font-bold text-foreground transition text-center">Copiar Roteiro</button>
                      <button onClick={() => { navigator.clipboard.writeText(post.prompt); setSuccessToast('Prompt Canva copiado! 🎨'); setTimeout(() => setSuccessToast(null), 2000); }}
                        className="rounded-xl border border-border hover:bg-surface-light px-4 py-2.5 text-xs font-bold text-foreground transition">Prompt 🎨</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Success Toast */}
          {successToast && activeTab !== 'intent' && (
            <div className="fixed bottom-6 left-6 z-[100] rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg animate-bounce flex items-center gap-2 text-sm border-2 border-white">
              <span>✨</span><span>{successToast}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
