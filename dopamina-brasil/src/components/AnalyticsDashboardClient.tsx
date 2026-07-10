'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import productsData from '@/data/products.json';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'ux' | 'ecommerce' | 'intent' | 'ga4'>('overview');

  // Intent Data State
  const [intentData, setIntentData] = useState({
    funnelStages: { awareness: 0, consideration: 0, decision: 0 },
    topLeads: [] as any[],
  });

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
  const [hardware, setHardware] = useState({
    connection: [] as any[],
    ram: [] as any[],
    cores: [] as any[],
    theme: [] as any[]
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

  // E-commerce Insights
  const [ecommerceInsights, setEcommerceInsights] = useState({
    searchTerms: [] as any[],
    abandonedCarts: [] as any[],
    boughtTogether: [] as any[],
    topProducts: [] as any[]
  });

  // GA4 State
  const [ga4Data, setGa4Data] = useState<any>(null);

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
        .from('sessions')
        .select('*', { count: 'exact' });

      const genderMap: Record<string, number> = {};
      const osMap: Record<string, number> = {};
      const stateMap: Record<string, number> = {};
      const sourceMap: Record<string, number> = {};
      const mediumMap: Record<string, number> = {};
      const referrerMap: Record<string, number> = {};
      const connMap: Record<string, number> = {};
      const ramMap: Record<string, number> = {};
      const coresMap: Record<string, number> = {};
      const themeMap: Record<string, number> = {};

      const safeSessionData = sessionData || [];

      safeSessionData.forEach((sess) => {
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

          if (info.connectionType) connMap[info.connectionType.toUpperCase()] = (connMap[info.connectionType.toUpperCase()] || 0) + 1;
          if (info.deviceMemory) ramMap[`${info.deviceMemory}GB`] = (ramMap[`${info.deviceMemory}GB`] || 0) + 1;
          if (info.hardwareConcurrency) coresMap[`${info.hardwareConcurrency} Núcleos`] = (coresMap[`${info.hardwareConcurrency} Núcleos`] || 0) + 1;
          
          const theme = info.prefersDarkMode === true ? 'Modo Escuro' : info.prefersDarkMode === false ? 'Modo Claro' : 'Desconhecido';
          themeMap[theme] = (themeMap[theme] || 0) + 1;
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

      setHardware({
        connection: formatMap(connMap).slice(0, 5),
        ram: formatMap(ramMap).slice(0, 5),
        cores: formatMap(coresMap).slice(0, 5),
        theme: formatMap(themeMap).slice(0, 3)
      });

      // 2. Fetch Events (Funnel, Products, UX)
      const { data: events, error: eventsError } = await supabase
        .from('intent_events')
        .select('id, session_id, event_type, price_displayed, created_at, product_id, metadata');

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
      
      // Intent Data per Session
      const sessionScores: Record<string, { 
        score: number, 
        events: number, 
        fakeRev: number, 
        lastActive: string,
        productsViewed: Set<string>,
        productsCarted: Set<string>
      }> = {};

      const searchMap: Record<string, number> = {};
      const abandonedList: any[] = [];
      const pairMap: Record<string, number> = {};

      const SCORE_MAP = {
        'fake_checkout': 50,
        'share_product': 30,
        'add_to_cart': 20,
        'dwell_time_exceeded': 10,
        'view_item': 5,
        'rage_click': 15,
        'search': 10,
        'cart_abandoned': -5,
        'checkout_basket': 0 // just for stats
      };

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

        // Intent Scoring
        const sid = ev.session_id;
        if (sid) {
          if (!sessionScores[sid]) {
            sessionScores[sid] = { 
              score: 0, 
              events: 0, 
              fakeRev: 0, 
              lastActive: ev.created_at,
              productsViewed: new Set(),
              productsCarted: new Set()
            };
          }
          sessionScores[sid].score += SCORE_MAP[ev.event_type as keyof typeof SCORE_MAP] || 0;
          sessionScores[sid].events += 1;
          if (ev.created_at > sessionScores[sid].lastActive) {
            sessionScores[sid].lastActive = ev.created_at;
          }
          if (ev.event_type === 'fake_checkout') {
             sessionScores[sid].fakeRev += ev.price_displayed || 0;
          }
          
          // Map real product names
          if (ev.product_id) {
            const product = productsData.find((p: any) => p.id === ev.product_id);
            const pName = product ? product.short_name : ev.product_id;
            if (ev.event_type === 'view_item') {
              sessionScores[sid].productsViewed.add(pName);
            }
            if (ev.event_type === 'add_to_cart') {
              sessionScores[sid].productsCarted.add(pName);
            }
          }
        }

        // New Ecommerce Insights
        if (ev.event_type === 'search' && ev.metadata?.query) {
          const q = ev.metadata.query.toLowerCase().trim();
          if (q.length > 2) searchMap[q] = (searchMap[q] || 0) + 1;
        }

        if (ev.event_type === 'cart_abandoned' && ev.metadata?.items) {
          // Avoid duplicates per session (only keep the latest abandoned cart)
          const existingIdx = abandonedList.findIndex(a => a.sid === sid);
          const val = ev.price_displayed || 0;
          const cartItem = {
            id: ev.id,
            sid: sid,
            date: new Date(ev.created_at).toLocaleString('pt-BR'),
            value: val,
            items: ev.metadata.items
          };
          if (existingIdx >= 0) {
            abandonedList[existingIdx] = cartItem;
          } else {
            abandonedList.push(cartItem);
          }
        }

        if (ev.event_type === 'checkout_basket' && ev.metadata?.items) {
          const items = ev.metadata.items as any[];
          if (items.length > 1) {
            for (let i = 0; i < items.length; i++) {
              for (let j = i + 1; j < items.length; j++) {
                const name1 = items[i].name || items[i].id;
                const name2 = items[j].name || items[j].id;
                const pair = [name1, name2].sort().join(' + ');
                pairMap[pair] = (pairMap[pair] || 0) + 1;
              }
            }
          }
        }
      });

      // Calculate B2B Intent Leads & Funnel
      let awareness = 0;
      let consideration = 0;
      let decision = 0;
      
      // Fallback for missing sessions
      let finalSessionData = sessionData || [];
      if (finalSessionData.length === 0 && events && events.length > 0) {
        const uniqueSids = Array.from(new Set(events.map(e => e.session_id).filter(Boolean)));
        finalSessionData = uniqueSids.map(sid => ({
           session_id: sid,
           created_at: new Date().toISOString(),
           device_info: { city: 'Fantasma', os_name: 'Desconhecido', browser_name: 'N/A' }
        }));
      }
      
      const leads = finalSessionData.map(sess => {
        const sid = sess.session_id;
        const stats = sessionScores[sid] || { score: 0, events: 0, fakeRev: 0, lastActive: sess.created_at, productsViewed: new Set(), productsCarted: new Set() };
        const score = stats.score;
        
        let stage = 'Awareness';
        if (score > 50) { stage = 'Decision'; decision++; }
        else if (score > 20) { stage = 'Consideration'; consideration++; }
        else { stage = 'Awareness'; awareness++; }
        
        const city = sess.device_info?.city || 'Desconhecido';
        const os = sess.device_info?.os_name || 'Desconhecido';
        const browser = sess.device_info?.browser_name || '';
        const source = sess.device_info?.utm_source || sess.device_info?.referrer || 'Tráfego Direto/Orgânico';
        const isMobile = sess.device_info?.is_mobile ? '📱' : '💻';
        
        return {
           id: sid,
           deviceLocal: `${isMobile} ${os} - ${city}`,
           source: source,
           score: score,
           stage: stage,
           events: stats.events,
           fakeRev: stats.fakeRev,
           lastActive: new Date(stats.lastActive).toLocaleString('pt-BR'),
           views: Array.from(stats.productsViewed),
           carts: Array.from(stats.productsCarted)
        };
      }).filter(lead => lead.events > 0).sort((a, b) => b.score - a.score).slice(0, 50);

      setIntentData({
         funnelStages: { awareness, consideration, decision },
         topLeads: leads
      });

      // Format KPIs
      const totalSess = finalSessionData.length > 0 ? finalSessionData.length : 1;
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

      // Calculate UX Metrics
      setUxMetrics({
        avgDwellTime: dwellEvents > 0 ? Math.floor(totalDwellTime / dwellEvents) : 0,
        rageClicksCount: rageClicks,
        scrollDepthMap: Object.keys(scrollMap).map(k => ({ name: k, value: scrollMap[k] }))
      });

      // Calculate Ecommerce Insights
      setEcommerceInsights({
        searchTerms: formatMap(searchMap).slice(0, 10),
        abandonedCarts: abandonedList.sort((a, b) => b.value - a.value).slice(0, 10),
        boughtTogether: formatMap(pairMap).slice(0, 10),
        topProducts: Object.keys(productInteractions).map(id => {
          const product = productsData.find((p: any) => p.id === id);
          return {
            id,
            name: product ? product.name : `Produto ${id.split('-')[0]}`,
            views: productInteractions[id].views,
            carts: productInteractions[id].carts,
            rev: productInteractions[id].rev
          };
        }).sort((a, b) => b.rev - a.rev).slice(0, 10)
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

      // 3. Fetch GA4 Data (if credentials are set)
      try {
        const ga4Res = await fetch('/api/analytics/ga4');
        if (ga4Res.ok) {
          const ga4Json = await ga4Res.json();
          if (ga4Json.data) {
            setGa4Data(ga4Json.data);
          } else if (ga4Json.data === null) {
            setGa4Data('empty'); // Explicitly set to empty string to differentiate from null (unconfigured/loading)
          }
        }
      } catch (err) {
        console.error('Failed to fetch GA4 data:', err);
      }

    } catch (err: any) {
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
              className="rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
              autoFocus
            />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              className="rounded-xl bg-neon px-8 py-4 font-extrabold text-white transition hover:scale-105 active:scale-95"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'intent', label: 'Intent Data B2B 🔥', icon: '🎯' },
    { id: 'ecommerce', label: 'Insights de E-commerce 🛒', icon: '🛍️' },
    { id: 'ux', label: 'Telemetria UX', icon: '🖱️' },
    { id: 'ga4', label: 'Google Analytics 📈', icon: '📈' },
  ];

  const renderTabs = () => (
    <div className="mb-8 flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
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
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-neon border-t-transparent"></span>
        </div>
      ) : (
        <>
          {/* TAB: VISÃO GERAL */}
          {activeTab === 'overview' && (
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

              {/* Hardware Fingerprint */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">🔋 Hardware & Conexão (Fingerprint Avançado)</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Conexão */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Rede</h3>
                    {hardware.connection.length > 0 ? hardware.connection.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-sm font-medium">
                        <span>{c.name}</span>
                        <span className="text-neon font-bold">{c.value}</span>
                      </div>
                    )) : <div className="text-sm text-muted">Sem dados</div>}
                  </div>
                  
                  {/* Memória RAM */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Memória RAM</h3>
                    {hardware.ram.length > 0 ? hardware.ram.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-sm font-medium">
                        <span>{c.name}</span>
                        <span className="text-neon font-bold">{c.value}</span>
                      </div>
                    )) : <div className="text-sm text-muted">Sem dados</div>}
                  </div>

                  {/* CPU */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Processador (Cores)</h3>
                    {hardware.cores.length > 0 ? hardware.cores.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-sm font-medium">
                        <span>{c.name}</span>
                        <span className="text-neon font-bold">{c.value}</span>
                      </div>
                    )) : <div className="text-sm text-muted">Sem dados</div>}
                  </div>

                  {/* Tema */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Preferência de Tema</h3>
                    {hardware.theme.length > 0 ? hardware.theme.map(c => (
                      <div key={c.name} className="flex justify-between items-center text-sm font-medium">
                        <span>{c.name}</span>
                        <span className="text-neon font-bold">{c.value}</span>
                      </div>
                    )) : <div className="text-sm text-muted">Sem dados</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOOGLE ANALYTICS */}
          {activeTab === 'ga4' && (
            <div className="animate-fade-in space-y-6">
              {ga4Data && ga4Data !== 'empty' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl border-2 border-neon bg-neon/5 p-6 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neon"></span>
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
                  <p className="mt-2 text-muted max-w-lg mx-auto">
                    A API conectou com sucesso, mas o Google Analytics ainda não processou os dados desta propriedade. 
                    O GA4 costuma levar de 24 a 48 horas para exibir métricas em propriedades recém-criadas.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-foreground">API do Google Analytics não configurada</h3>
                  <p className="mt-2 text-muted max-w-lg mx-auto">
                    Para visualizar as métricas do GA4 aqui, você precisa configurar as variáveis de ambiente 
                    <code>GA_PROPERTY_ID</code>, <code>GA_CLIENT_EMAIL</code> e <code>GA_PRIVATE_KEY</code> no painel da Vercel.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: E-COMMERCE INSIGHTS */}
          {activeTab === 'ecommerce' && (
            <div className="animate-fade-in space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Buscas Realizadas */}
                <div className="rounded-2xl border border-border bg-surface-light p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                    <span>🔍</span> Termos Mais Buscados
                  </h3>
                  {ecommerceInsights.searchTerms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {ecommerceInsights.searchTerms.map((term, i) => (
                        <span key={i} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm">
                          <span className="font-medium text-foreground">{term.name}</span>
                          <span className="text-muted">{term.value}x</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Nenhuma busca registrada ainda.</p>
                  )}
                </div>

                {/* Comprados Juntos */}
                <div className="rounded-2xl border border-border bg-surface-light p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                    <span>🤝</span> Comprados Juntos (Cesta)
                  </h3>
                  {ecommerceInsights.boughtTogether.length > 0 ? (
                    <div className="space-y-3">
                      {ecommerceInsights.boughtTogether.map((pair, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                          <span className="text-sm font-medium text-foreground">{pair.name}</span>
                          <span className="shrink-0 rounded-full bg-neon/10 px-2 py-1 text-xs font-bold text-neon">{pair.value} pedidos</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Nenhum padrão de cesta identificado.</p>
                  )}
                </div>
              </div>

              {/* Carrinhos Abandonados */}
              <div className="rounded-2xl border border-border bg-surface-light p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <span>🛒</span> Carrinhos Abandonados (Lost Revenue)
                </h3>
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
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted">Nenhum carrinho abandonado. A conversão está voando!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Produtos Mais Clicados vs Comprados */}
              <div className="rounded-2xl border border-border bg-surface-light p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <span>📦</span> Funil de Produtos
                </h3>
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

          {/* TAB: INTENT DATA B2B */}
          {activeTab === 'intent' && (
            <div className="animate-fade-in space-y-8">
              {/* Funnel */}
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

              {/* CRM / Live Intent Feed */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
                    🎯 Radar de Intenção (Top Leads)
                  </h2>
                  <span className="flex items-center gap-2 text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Live
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-bold uppercase tracking-wider">Visitante (Device & Local)</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Origem</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Estágio</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Interesse (Produtos)</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Potencial (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {intentData.topLeads.map((lead) => (
                        <tr key={lead.id} className="transition hover:bg-surface-light">
                          <td className="py-4 font-bold text-foreground">
                            {lead.deviceLocal}
                            <div className="text-xs font-normal text-muted mt-1">ID: <code className="bg-surface px-1 py-0.5 rounded">{lead.id.split('-')[0]}</code></div>
                          </td>
                          <td className="py-4 text-muted truncate max-w-[150px]" title={lead.source}>{lead.source}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold mb-1 ${
                              lead.stage === 'Decision' ? 'bg-rose-100 text-rose-700' :
                              lead.stage === 'Consideration' ? 'bg-amber-100 text-amber-700' :
                              'bg-cyan-100 text-cyan-700'
                            }`}>
                              {lead.stage}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-foreground text-xs">{lead.score}</span>
                              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-lighter">
                                <div 
                                  className={`h-full rounded-full ${lead.score > 50 ? 'bg-rose-500' : lead.score > 20 ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                                  style={{ width: `${Math.min(100, (lead.score / 100) * 100)}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1 max-w-[300px]">
                              {lead.carts.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-bold text-neon">🛒 Adicionou: </span>
                                  <span className="text-foreground truncate">{lead.carts.join(', ')}</span>
                                </div>
                              )}
                              {lead.views.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-bold text-muted">👀 Viu: </span>
                                  <span className="text-muted truncate">{lead.views.join(', ')}</span>
                                </div>
                              )}
                              {lead.carts.length === 0 && lead.views.length === 0 && (
                                <span className="text-xs text-muted">Apenas navegou (Nenhum produto)</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right font-black text-neon">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.fakeRev)}
                          </td>
                        </tr>
                      ))}
                      {intentData.topLeads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted">Nenhum lead com intenção detectado ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
