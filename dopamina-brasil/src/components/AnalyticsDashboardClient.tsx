'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

const COLORS = ['#ff00ff', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'ux' | 'marketing'>('visao_geral');

  // Dashboard Data State
  const [kpis, setKpis] = useState({
    totalSessions: 0,
    totalCheckouts: 0,
    conversionRate: 0,
    fakeRevenue: 0,
    aov: 0,
    cartAbandonment: 0
  });
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  // Demographics / Marketing State
  const [demographics, setDemographics] = useState({
    gender: [] as any[],
    os: [] as any[],
    state: [] as any[]
  });
  const [marketing, setMarketing] = useState({
    utmSource: [] as any[],
    utmMedium: [] as any[],
    referrer: [] as any[]
  });

  // UX State
  const [uxMetrics, setUxMetrics] = useState({
    avgDwellTime: 0,
    rageClicksCount: 0,
    scrollDepthMap: [] as any[]
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dopamina') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setError('Senha incorreta. Dica: dopamina');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Sessions (Demographics & Marketing)
      const { data: sessionData, count: sessionCount } = await supabase
        .from('intent_sessions')
        .select('*', { count: 'exact' });

      const genderMap: Record<string, number> = {};
      const osMap: Record<string, number> = {};
      const stateMap: Record<string, number> = {};
      const sourceMap: Record<string, number> = {};
      const mediumMap: Record<string, number> = {};
      const referrerMap: Record<string, number> = {};

      sessionData?.forEach((sess) => {
        const info = sess.device_info;
        if (info) {
          const g = info.mock_gender || 'Desconhecido';
          const o = info.os_name || 'Desconhecido';
          const s = info.state || 'Desconhecido';
          const src = info.utm_source || 'Direto/Orgânico';
          const med = info.utm_medium || 'N/A';
          const ref = info.referrer ? new URL(info.referrer).hostname : 'Direto';

          genderMap[g] = (genderMap[g] || 0) + 1;
          osMap[o] = (osMap[o] || 0) + 1;
          stateMap[s] = (stateMap[s] || 0) + 1;
          sourceMap[src] = (sourceMap[src] || 0) + 1;
          mediumMap[med] = (mediumMap[med] || 0) + 1;
          referrerMap[ref] = (referrerMap[ref] || 0) + 1;
        }
      });

      const formatMap = (map: Record<string, number>) => Object.keys(map).map(name => ({ name, value: map[name] })).sort((a,b) => b.value - a.value);

      setDemographics({
        gender: formatMap(genderMap),
        os: formatMap(osMap).slice(0, 5),
        state: formatMap(stateMap).slice(0, 7)
      });

      setMarketing({
        utmSource: formatMap(sourceMap).slice(0, 5),
        utmMedium: formatMap(mediumMap).slice(0, 5),
        referrer: formatMap(referrerMap).slice(0, 5)
      });

      // 2. Fetch Events (Funnel, Products, UX)
      const { data: events, error: eventsError } = await supabase
        .from('intent_events')
        .select('event_type, price_displayed, created_at, product_id, metadata');

      if (eventsError) throw eventsError;

      let viewCount = 0;
      let cartCount = 0;
      let checkoutCount = 0;
      let fakeRev = 0;
      
      let totalDwellTime = 0;
      let dwellEvents = 0;
      let rageClicks = 0;
      const scrollMap: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };

      const timelineMap: Record<string, number> = {};
      const productInteractions: Record<string, { views: number, carts: number, rev: number }> = {};

      events?.forEach((ev) => {
        // Timeline (Group by Date)
        const dateStr = new Date(ev.created_at).toLocaleDateString('pt-BR');
        timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;

        // Funnel & E-commerce
        if (ev.event_type === 'view_item') viewCount++;
        if (ev.event_type === 'add_to_cart') cartCount++;
        if (ev.event_type === 'fake_checkout') {
          checkoutCount++;
          fakeRev += ev.price_displayed || 0;
        }

        // UX Telemetry
        if (ev.event_type === 'page_leave' && ev.metadata?.dwell_time_seconds) {
          totalDwellTime += ev.metadata.dwell_time_seconds;
          dwellEvents++;
        }
        if (ev.event_type === 'rage_click') {
          rageClicks++;
        }
        if (ev.event_type === 'scroll_depth' && ev.metadata?.depth_percentage) {
          const depth = `${ev.metadata.depth_percentage}%`;
          if (scrollMap[depth] !== undefined) scrollMap[depth]++;
        }

        // Product Heatmap
        if (ev.product_id && ['view_item', 'add_to_cart', 'fake_checkout'].includes(ev.event_type)) {
          if (!productInteractions[ev.product_id]) {
            productInteractions[ev.product_id] = { views: 0, carts: 0, rev: 0 };
          }
          if (ev.event_type === 'view_item') productInteractions[ev.product_id].views++;
          if (ev.event_type === 'add_to_cart') productInteractions[ev.product_id].carts++;
          if (ev.event_type === 'fake_checkout') productInteractions[ev.product_id].rev += ev.price_displayed || 0;
        }
      });

      // Format KPIs
      const totalSess = sessionCount || 1;
      const safeCartCount = cartCount || 1;
      setKpis({
        totalSessions: sessionCount || 0,
        totalCheckouts: checkoutCount,
        conversionRate: ((checkoutCount / totalSess) * 100) || 0,
        fakeRevenue: fakeRev,
        aov: checkoutCount > 0 ? fakeRev / checkoutCount : 0,
        cartAbandonment: ((cartCount - checkoutCount) / safeCartCount) * 100
      });

      // Format Funnel
      setFunnelData([
        { name: 'Sessões Iniciais', value: sessionCount || 0 },
        { name: 'Visualizações', value: viewCount },
        { name: 'Adições ao Carrinho', value: cartCount },
        { name: 'Checkouts Falsos', value: checkoutCount },
      ]);

      // Format Timeline
      const formattedTimeline = Object.keys(timelineMap).map((date) => ({
        date, interacoes: timelineMap[date],
      }));
      setTimelineData(formattedTimeline);

      // Format UX Metrics
      setUxMetrics({
        avgDwellTime: dwellEvents > 0 ? Math.round(totalDwellTime / dwellEvents) : 0,
        rageClicksCount: rageClicks,
        scrollDepthMap: Object.keys(scrollMap).map(k => ({ name: k, value: scrollMap[k] }))
      });

      // Format Products
      const topIds = Object.keys(productInteractions)
        .sort((a, b) => productInteractions[b].carts - productInteractions[a].carts)
        .slice(0, 5);

      if (topIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, short_name, image_url')
          .in('id', topIds);

        const formattedTopProducts = productsData?.map((p) => ({
          ...p,
          metrics: productInteractions[p.id],
        })) || [];

        formattedTopProducts.sort((a, b) => b.metrics.carts - a.metrics.carts);
        setTopProducts(formattedTopProducts);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface-light p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-4 font-[var(--font-display)] text-2xl font-black text-foreground">
              Acesso Restrito
            </h1>
            <p className="text-sm text-muted">Dashboard de Insights Avançados v3</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-magenta"
              autoFocus
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              className="rounded-xl bg-magenta px-8 py-4 font-extrabold text-white transition hover:scale-105 active:scale-95"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderTabs = () => (
    <div className="mb-8 flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
      {[
        { id: 'visao_geral', label: 'Visão Geral & Vendas' },
        { id: 'ux', label: 'Comportamento (UX)' },
        { id: 'marketing', label: 'Aquisição & Marketing' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-6 py-3 font-bold whitespace-nowrap transition border-b-2 ${
            activeTab === tab.id 
              ? 'border-magenta text-magenta' 
              : 'border-transparent text-muted hover:text-foreground hover:border-border'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
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

      {renderTabs()}

      {loading && timelineData.length === 0 ? (
        <div className="flex py-20 justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-magenta border-t-transparent"></span>
        </div>
      ) : (
        <>
          {/* TAB: VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="animate-fade-in">
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
                  <div className="mt-2 text-4xl font-black text-magenta">
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

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">📉 Funil de Intenção</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(255, 0, 255, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="value" fill="#ff00ff" radius={[8, 8, 0, 0]} />
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
            </div>
          )}

          {/* TAB: UX & BEHAVIOR */}
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">💻 Demografia Tecnológica</h2>
                  <div className="flex flex-col gap-3">
                    {demographics.os.map((st, idx) => (
                      <div key={st.name} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{st.name}</span>
                        </div>
                        <div className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{st.value} sessões</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MARKETING */}
          {activeTab === 'marketing' && (
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
                  Tráfego por Origem (Referrer)
                </h2>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketing.referrer} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                        {marketing.referrer.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
                  Campanhas (UTM Source)
                </h2>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketing.utmSource} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                      <Tooltip cursor={{ fill: 'rgba(255, 0, 255, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
                  Gênero Profiling (Mock)
                </h2>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={demographics.gender} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" stroke="none">
                        {demographics.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#f59e0b', '#10b981'][index % 2]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
