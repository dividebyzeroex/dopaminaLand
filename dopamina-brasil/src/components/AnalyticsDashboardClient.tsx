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

const MOCK_COMPANIES = [
  { name: 'Google Brasil', domain: 'google.com.br', sector: 'Tecnologia', size: '10.000+ emp', revenue: 'R$ 5B+', tech: 'Next.js, Go, Spanner', logo: '🌐', color: 'bg-blue-500', city: 'São Paulo' },
  { name: 'Nubank', domain: 'nubank.com.br', sector: 'Fintech', size: '5.000-10.000 emp', revenue: 'R$ 2B+', tech: 'React Native, Clojure, Datomic', logo: '💜', color: 'bg-purple-600', city: 'São Paulo' },
  { name: 'Vercel Inc.', domain: 'vercel.com', sector: 'DevTools', size: '500-1.000 emp', revenue: 'R$ 500M+', tech: 'Next.js, Tailwind, Turbopack', logo: '▲', color: 'bg-black', city: 'San Francisco' },
  { name: 'Ambev Tech', domain: 'ambevtech.com.br', sector: 'Alimentos e Bebidas', size: '2.000-5.000 emp', revenue: 'R$ 1.5B+', tech: 'React, Node.js, Postgres', logo: '🍺', color: 'bg-yellow-500', city: 'Blumenau' },
  { name: 'Stone Co.', domain: 'stone.com.br', sector: 'Meios de Pagamento', size: '5.000-10.000 emp', revenue: 'R$ 3B+', tech: 'React, C#, SQL Server', logo: '💚', color: 'bg-emerald-600', city: 'Rio de Janeiro' },
  { name: 'Mercado Livre', domain: 'mercadolivre.com.br', sector: 'E-commerce', size: '10.000+ emp', revenue: 'R$ 8B+', tech: 'Java, React, MySQL', logo: '🤝', color: 'bg-yellow-400', city: 'Osasco' },
  { name: 'Magazine Luiza', domain: 'magalu.com.br', sector: 'Varejo', size: '10.000+ emp', revenue: 'R$ 4B+', tech: 'Python, Django, Postgres', logo: '💙', color: 'bg-blue-600', city: 'Franca' },
  { name: 'Hotmart', domain: 'hotmart.com', sector: 'Creator Economy', size: '1.000-2.000 emp', revenue: 'R$ 800M+', tech: 'React, Java, BigQuery', logo: '🔥', color: 'bg-orange-500', city: 'Belo Horizonte' },
  { name: 'XP Inc.', domain: 'xpi.com.br', sector: 'Serviços Financeiros', size: '2.000-5.000 emp', revenue: 'R$ 2.5B+', tech: 'Angular, Node.js, Oracle', logo: '📊', color: 'bg-yellow-600', city: 'São Paulo' },
  { name: 'Dopamina Corp', domain: 'dopaminacorp.co', sector: 'Saúde & Wellness', size: '10-50 emp', revenue: 'R$ 12M+', tech: 'Next.js, Fastify, Supabase', logo: '⚡', color: 'bg-purple-500', city: 'Florianópolis' },
  { name: 'iFood', domain: 'ifood.com.br', sector: 'Delivery', size: '5.000+ emp', revenue: 'R$ 1.8B+', tech: 'React, Kotlin, DynamoDB', logo: '🍎', color: 'bg-red-600', city: 'Campinas' },
  { name: 'Lojas Renner', domain: 'renner.com.br', sector: 'Moda & Varejo', size: '10.000+ emp', revenue: 'R$ 6B+', tech: 'React, Java, SQL Server', logo: '👗', color: 'bg-red-500', city: 'Porto Alegre' },
  { name: 'Gympass / Wellhub', domain: 'wellhub.com', sector: 'Corporate Wellness', size: '1.000-2.000 emp', revenue: 'R$ 700M+', tech: 'React, Ruby on Rails', logo: '🤸', color: 'bg-rose-500', city: 'São Paulo' },
  { name: 'Locaweb', domain: 'locaweb.com.br', sector: 'Hospedagem & SaaS', size: '1.000-2.000 emp', revenue: 'R$ 400M+', tech: 'PHP, Ruby, MySQL', logo: '🕸️', color: 'bg-blue-700', city: 'São Paulo' }
];

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ux' | 'ecommerce' | 'intent' | 'ga4' | 'marketing'>('overview');

  // Intent Data State
  const [intentData, setIntentData] = useState({
    funnelStages: { awareness: 0, consideration: 0, decision: 0 },
    topLeads: [] as any[],
  });

  // Raw DB States
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [productDict, setProductDict] = useState<Record<string, any>>({});

  // Dynamic Weights State
  const [scoreWeights, setScoreWeights] = useState({
    fake_checkout: 50,
    share_product: 30,
    add_to_cart: 20,
    dwell_time_exceeded: 10,
    view_item: 5,
    rage_click: 15,
    search: 10,
    cart_abandoned: -5,
  });

  // UI state for weights panel, lead drawer, and integrations toast
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Intent filter states
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState<'all' | 'Awareness' | 'Consideration' | 'Decision'>('all');
  const [leadSortBy, setLeadSortBy] = useState<'score' | 'events' | 'fakeRev'>('score');

  // CRM integrations loading state per lead
  const [crmIntegrationStatus, setCrmIntegrationStatus] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});


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

  const getDeterministicCompany = (sid: string) => {
    if (!sid) return MOCK_COMPANIES[0];
    let sum = 0;
    for (let i = 0; i < sid.length; i++) {
      sum += sid.charCodeAt(i);
    }
    return MOCK_COMPANIES[sum % MOCK_COMPANIES.length];
  };

  const recomputeIntentMetrics = (
    sessionsList: any[],
    eventsList: any[],
    pDict: Record<string, any>,
    weights: typeof scoreWeights
  ) => {
    let awareness = 0;
    let consideration = 0;
    let decision = 0;

    const sessionScores: Record<string, { 
      score: number; 
      events: number; 
      fakeRev: number; 
      lastActive: string;
      productsViewed: Set<string>;
      productsCarted: Set<string>;
      eventTimeline: any[];
    }> = {};

    eventsList.forEach((ev) => {
      const sid = ev.session_id;
      if (sid) {
        if (!sessionScores[sid]) {
          sessionScores[sid] = { 
            score: 0, 
            events: 0, 
            fakeRev: 0, 
            lastActive: ev.created_at,
            productsViewed: new Set(),
            productsCarted: new Set(),
            eventTimeline: []
          };
        }
        
        const weight = weights[ev.event_type as keyof typeof weights] || 0;
        sessionScores[sid].score += weight;
        sessionScores[sid].events += 1;
        
        if (ev.created_at > sessionScores[sid].lastActive) {
          sessionScores[sid].lastActive = ev.created_at;
        }
        if (ev.event_type === 'fake_checkout') {
          sessionScores[sid].fakeRev += ev.price_displayed || 0;
        }

        const product = pDict[ev.product_id || ''];
        const pName = product ? product.short_name : ev.product_id;
        
        if (ev.product_id) {
          if (ev.event_type === 'view_item') sessionScores[sid].productsViewed.add(pName);
          if (ev.event_type === 'add_to_cart') sessionScores[sid].productsCarted.add(pName);
        }

        sessionScores[sid].eventTimeline.push({
          id: ev.id,
          event_type: ev.event_type,
          price_displayed: ev.price_displayed,
          created_at: ev.created_at,
          product_name: product ? product.name : ev.product_id,
          metadata: ev.metadata
        });
      }
    });

    let finalSessionData = sessionsList || [];
    if (finalSessionData.length === 0 && eventsList && eventsList.length > 0) {
      const uniqueSids = Array.from(new Set(eventsList.map(e => e.session_id).filter(Boolean)));
      finalSessionData = uniqueSids.map(sid => ({
         session_id: sid,
         created_at: new Date().toISOString(),
         device_info: { city: 'Fantasma', os_name: 'Desconhecido', browser_name: 'N/A' }
      }));
    }

    const leads = finalSessionData.map(sess => {
      const sid = sess.session_id;
      const stats = sessionScores[sid] || { 
        score: 0, 
        events: 0, 
        fakeRev: 0, 
        lastActive: sess.created_at, 
        productsViewed: new Set(), 
        productsCarted: new Set(),
        eventTimeline: []
      };
      
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
      
      const company = getDeterministicCompany(sid);
      const sortedTimeline = [...stats.eventTimeline].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
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
         carts: Array.from(stats.productsCarted),
         company: company,
         timeline: sortedTimeline
      };
    }).filter(lead => lead.events > 0);

    return {
      funnelStages: { awareness, consideration, decision },
      topLeads: leads
    };
  };

  useEffect(() => {
    if (rawSessions.length > 0 || rawEvents.length > 0) {
      const computed = recomputeIntentMetrics(rawSessions, rawEvents, productDict, scoreWeights);
      setIntentData(computed);
      
      if (selectedLead) {
        const freshLead = computed.topLeads.find(l => l.id === selectedLead.id);
        if (freshLead) {
          setSelectedLead(freshLead);
        }
      }
    }
  }, [rawSessions, rawEvents, productDict, scoreWeights]);

  const handleCrmSync = (leadId: string, type: 'hubspot' | 'salesforce' | 'slack') => {
    const key = `${leadId}-${type}`;
    setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'loading' }));
    
    setTimeout(() => {
      setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'success' }));
      setSuccessToast(`Lead sincronizado com o ${type.toUpperCase()}! 🚀`);
      
      setTimeout(() => {
        setSuccessToast(null);
      }, 3000);
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

      // 3. Fetch Product Dictionary (to map UUIDs to Names)
      const { data: allProducts } = await supabase.from('products').select('id, name, short_name');
      const productDict = (allProducts || []).reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      }, {});

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
            const product = productDict[ev.product_id];
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

      setRawSessions(finalSessionData);
      setRawEvents(events || []);
      setProductDict(productDict);


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
          const product = productDict[id];
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
    { id: 'marketing', label: 'Campanhas & Social Media 📣', icon: '📣' },
  ];

  const renderTabs = () => (
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
            <div className="animate-fade-in space-y-8 pb-12">
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

              {/* Surge Topics & Algorithm Customizer Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sliders Algoritmo */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
                        ⚙️ Configurações do Algoritmo de Intent Score
                      </h2>
                      <button 
                        onClick={() => setShowWeightSettings(!showWeightSettings)}
                        className="rounded-xl bg-surface px-4 py-2 text-xs font-bold text-muted transition hover:bg-border"
                      >
                        {showWeightSettings ? 'Recolher 🔼' : 'Ajustar Pesos ⚙️'}
                      </button>
                    </div>
                    <p className="text-xs text-muted mb-4">
                      Personalize a pontuação atribuída a cada evento para calibrar os estágios do funil B2B. As atualizações nos pesos recalcularão os scores dos leads instantaneamente.
                    </p>

                    {showWeightSettings ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border animate-fade-in">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Visualização de Item</span>
                            <span className="text-neon">{scoreWeights.view_item} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="20" step="1" 
                            value={scoreWeights.view_item}
                            onChange={(e) => setScoreWeights({...scoreWeights, view_item: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Adição ao Carrinho</span>
                            <span className="text-neon">{scoreWeights.add_to_cart} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="50" step="1" 
                            value={scoreWeights.add_to_cart}
                            onChange={(e) => setScoreWeights({...scoreWeights, add_to_cart: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Checkout (Simulado)</span>
                            <span className="text-neon">{scoreWeights.fake_checkout} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="1" 
                            value={scoreWeights.fake_checkout}
                            onChange={(e) => setScoreWeights({...scoreWeights, fake_checkout: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Rage Clicks Detectados</span>
                            <span className="text-neon">{scoreWeights.rage_click} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="50" step="1" 
                            value={scoreWeights.rage_click}
                            onChange={(e) => setScoreWeights({...scoreWeights, rage_click: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Compartilhar Produto</span>
                            <span className="text-neon">{scoreWeights.share_product} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="50" step="1" 
                            value={scoreWeights.share_product}
                            onChange={(e) => setScoreWeights({...scoreWeights, share_product: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Dwell Time Excedido</span>
                            <span className="text-neon">{scoreWeights.dwell_time_exceeded} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="30" step="1" 
                            value={scoreWeights.dwell_time_exceeded}
                            onChange={(e) => setScoreWeights({...scoreWeights, dwell_time_exceeded: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Busca Realizada</span>
                            <span className="text-neon">{scoreWeights.search} pts</span>
                          </div>
                          <input 
                            type="range" min="0" max="30" step="1" 
                            value={scoreWeights.search}
                            onChange={(e) => setScoreWeights({...scoreWeights, search: parseInt(e.target.value)})}
                            className="w-full accent-neon"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted">Carrinho Abandonado (Penalidade)</span>
                            <span className="text-rose-500">{scoreWeights.cart_abandoned} pts</span>
                          </div>
                          <input 
                            type="range" min="-30" max="0" step="1" 
                            value={scoreWeights.cart_abandoned}
                            onChange={(e) => setScoreWeights({...scoreWeights, cart_abandoned: parseInt(e.target.value)})}
                            className="w-full accent-rose-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-surface-light px-4 py-3 flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Status do Algoritmo: Padrão Calibrado 🚀</span>
                        <button 
                          onClick={() => setShowWeightSettings(true)}
                          className="font-bold text-neon hover:underline"
                        >
                          Visualizar Variáveis
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Surge Topics Radar */}
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-4 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
                    📈 Tópicos de Pesquisa em Alta
                  </h2>
                  <p className="text-xs text-muted mb-4">Palavras-chave e interesses corporativos em pico de engajamento semanal.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-foreground">Suplementação de Foco (Dopamina Real)</span>
                        <span className="text-rose-500">+180% 🔥</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-lighter overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-foreground">Mascotes & Brindes (Cleiton Mascote)</span>
                        <span className="text-amber-500">+94% ⚡</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-lighter overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-foreground">Dispositivos de Foco (AirPods Max)</span>
                        <span className="text-emerald-500">+45% 📈</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-lighter overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-foreground">Produtividade Home-Office (Caneca Térmica)</span>
                        <span className="text-slate-400">+12%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-lighter overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros e Busca de Leads */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="relative w-full md:w-80">
                  <input 
                    type="text" 
                    placeholder="Buscar por Empresa, UF, Tecs..." 
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon transition"
                  />
                </div>
                
                <div className="flex w-full md:w-auto gap-4">
                  <select 
                    value={leadStageFilter} 
                    onChange={(e: any) => setLeadStageFilter(e.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon cursor-pointer"
                  >
                    <option value="all">Todos os Estágios</option>
                    <option value="Decision">Decision (Quente)</option>
                    <option value="Consideration">Consideration (Morno)</option>
                    <option value="Awareness">Awareness (Frio)</option>
                  </select>
                  
                  <select 
                    value={leadSortBy} 
                    onChange={(e: any) => setLeadSortBy(e.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-neon cursor-pointer"
                  >
                    <option value="score">Ordenar por Intent Score</option>
                    <option value="events">Ordenar por Ações</option>
                    <option value="fakeRev">Ordenar por Receita Potencial</option>
                  </select>
                </div>
              </div>

              {/* CRM / Live Intent Feed */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
                    🎯 Radar de Intenção (Top Leads)
                  </h2>
                  <span className="flex items-center gap-2 text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Live Resolution
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Empresa (Identificação IP)</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Origem / Canal</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Estágio & Engajamento</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-xs">Interesses Ativos</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right text-xs">Faturamento Potencial</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right text-xs">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {intentData.topLeads
                        .filter(lead => {
                          const query = leadSearchQuery.toLowerCase().trim();
                          const matchesSearch = !query || 
                            lead.company.name.toLowerCase().includes(query) ||
                            lead.company.domain.toLowerCase().includes(query) ||
                            lead.company.sector.toLowerCase().includes(query) ||
                            lead.company.tech.toLowerCase().includes(query) ||
                            lead.deviceLocal.toLowerCase().includes(query);
                          
                          const matchesStage = leadStageFilter === 'all' || lead.stage === leadStageFilter;
                          return matchesSearch && matchesStage;
                        })
                        .sort((a, b) => {
                          if (leadSortBy === 'score') return b.score - a.score;
                          if (leadSortBy === 'events') return b.events - a.events;
                          if (leadSortBy === 'fakeRev') return b.fakeRev - a.fakeRev;
                          return b.score - a.score;
                        })
                        .map((lead) => (
                          <tr key={lead.id} className="transition hover:bg-surface-light border-b border-border last:border-0">
                            <td className="py-4 font-bold text-foreground">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold text-white ${lead.company.color}`}>
                                  {lead.company.logo}
                                </div>
                                <div>
                                  <div className="text-sm font-black text-foreground">{lead.company.name}</div>
                                  <div className="text-xs font-semibold text-muted">{lead.company.domain} • {lead.company.sector}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-muted max-w-[150px] truncate" title={lead.source}>
                              <span className="text-xs font-semibold bg-surface px-2 py-1 rounded-lg border border-border block w-max max-w-[140px] truncate">
                                {lead.source}
                              </span>
                              <span className="text-[10px] text-muted block mt-1">{lead.deviceLocal.split('-')[0]}</span>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold mb-1.5 ${
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
                              <div className="flex flex-col gap-1 max-w-[220px]">
                                {lead.carts.length > 0 && (
                                  <div className="text-xs">
                                    <span className="font-bold text-purple-600">🛒 Adicionou: </span>
                                    <span className="text-foreground font-semibold truncate">{lead.carts.join(', ')}</span>
                                  </div>
                                )}
                                {lead.views.length > 0 && (
                                  <div className="text-xs">
                                    <span className="font-bold text-muted">👀 Viu: </span>
                                    <span className="text-muted truncate">{lead.views.join(', ')}</span>
                                  </div>
                                )}
                                {lead.carts.length === 0 && lead.views.length === 0 && (
                                  <span className="text-xs text-muted">Apenas navegou</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-right font-black text-neon text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.fakeRev)}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => setSelectedLead(lead)}
                                className="rounded-lg bg-surface hover:bg-border px-3 py-1.5 text-xs font-bold text-foreground transition"
                              >
                                Ver Detalhes ➔
                              </button>
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

              {/* DADOS DETALHADOS EM SLIDE-OUT DRAWER */}
              {selectedLead && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedLead(null)}
                  />
                  <div className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] border-l border-border bg-white shadow-2xl transition-transform duration-300 transform translate-x-0">
                    <div className="flex h-full flex-col overflow-y-auto">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border p-6 bg-surface-light">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white ${selectedLead.company.color}`}>
                            {selectedLead.company.logo}
                          </div>
                          <div>
                            <h2 className="text-md font-black text-foreground">{selectedLead.company.name}</h2>
                            <a href={`https://${selectedLead.company.domain}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline">
                              {selectedLead.company.domain} ↗
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedLead(null)}
                          className="rounded-lg p-2 text-muted hover:bg-border hover:text-foreground text-sm font-bold"
                        >
                          ✕ Fechar
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex-1 p-6 space-y-8">
                        {/* IA Analytics Card */}
                        <div className="rounded-2xl border border-border bg-surface-light p-5 space-y-4 shadow-inner">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Inteligência de Compra (IA)</h3>
                            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Análise Ativa
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Intent Score</div>
                              <div className="text-3xl font-black text-foreground mt-0.5">{selectedLead.score}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-muted">Temperatura</div>
                              <div className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                  selectedLead.stage === 'Decision' ? 'bg-rose-100 text-rose-700' :
                                  selectedLead.stage === 'Consideration' ? 'bg-amber-100 text-amber-700' :
                                  'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {selectedLead.stage === 'Decision' ? '🔥 Quente (Decision)' :
                                   selectedLead.stage === 'Consideration' ? '⚡ Morno (Consider)' :
                                   '❄️ Frio (Awareness)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-muted">Probabilidade de Compra</span>
                              <span className="text-foreground">{Math.min(99, Math.max(5, selectedLead.score * 1.3)).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  selectedLead.score > 50 ? 'bg-rose-500' : selectedLead.score > 20 ? 'bg-amber-500' : 'bg-cyan-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, selectedLead.score * 1.3))}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Firmographics Table */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Ficha da Empresa (Firmografia)</h3>
                          <div className="rounded-2xl border border-border divide-y divide-border text-xs bg-white">
                            <div className="flex justify-between p-3.5">
                              <span className="text-muted font-medium">Setor de Atuação</span>
                              <span className="font-bold text-foreground">{selectedLead.company.sector}</span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-muted font-medium">Tamanho da Empresa</span>
                              <span className="font-bold text-foreground">{selectedLead.company.size}</span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-muted font-medium">Faturamento Estimado</span>
                              <span className="font-bold text-foreground">{selectedLead.company.revenue}</span>
                            </div>
                            <div className="flex justify-between p-3.5">
                              <span className="text-muted font-medium">Sede</span>
                              <span className="font-bold text-foreground">{selectedLead.company.city}</span>
                            </div>
                            <div className="flex justify-between p-3.5 flex-col gap-1.5">
                              <span className="text-muted font-medium">Tecnologias Identificadas</span>
                              <span className="font-mono text-[10px] text-foreground bg-surface-light px-2.5 py-1.5 rounded-lg select-all border border-border">
                                {selectedLead.company.tech}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Journeys */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Jornada de Ações (Event Logs)</h3>
                          <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
                            {selectedLead.timeline && selectedLead.timeline.map((item: any, idx: number) => {
                              let icon = '👀';
                              let color = 'bg-slate-400';
                              let text = `Viu o produto: ${item.product_name || 'Produto'}`;

                              if (item.event_type === 'add_to_cart') {
                                icon = '🛒';
                                color = 'bg-purple-600 text-white';
                                text = `Adicionou ao carrinho: ${item.product_name || 'Produto'}`;
                              } else if (item.event_type === 'fake_checkout') {
                                icon = '⚡';
                                color = 'bg-rose-500 text-white';
                                text = `Fez Checkout Falso de R$ ${item.price_displayed?.toFixed(2)}`;
                              } else if (item.event_type === 'rage_click') {
                                icon = '💢';
                                color = 'bg-red-500 text-white animate-pulse';
                                text = 'Rage Click detectado na interface!';
                              } else if (item.event_type === 'search') {
                                icon = '🔍';
                                color = 'bg-cyan-500 text-white';
                                text = `Buscou no site por: "${item.metadata?.query || ''}"`;
                              } else if (item.event_type === 'share_product') {
                                icon = '🔗';
                                color = 'bg-indigo-500 text-white';
                                text = `Compartilhou produto: ${item.product_name}`;
                              } else if (item.event_type === 'dwell_time_exceeded') {
                                icon = '⏱️';
                                color = 'bg-amber-500 text-white';
                                text = 'Passou bastante tempo lendo especificações';
                              } else if (item.event_type === 'cart_abandoned') {
                                icon = '🏃';
                                color = 'bg-orange-500 text-white';
                                text = `Abandonou o carrinho de R$ ${item.price_displayed?.toFixed(2)}`;
                              }

                              return (
                                <div key={item.id || idx} className="relative text-xs">
                                  <span className={`absolute -left-[37px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-white ${color}`}>
                                    {icon}
                                  </span>
                                  <div>
                                    <div className="font-bold text-foreground">{text}</div>
                                    <div className="text-[10px] text-muted mt-0.5">
                                      {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Integration controls */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Sincronizar CRM e Notificar Vendas</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {/* HubSpot */}
                            <button 
                              onClick={() => handleCrmSync(selectedLead.id, 'hubspot')}
                              disabled={crmIntegrationStatus[`${selectedLead.id}-hubspot`] === 'loading'}
                              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold text-foreground transition hover:bg-surface-light disabled:opacity-70"
                            >
                              <div className="flex items-center gap-2">
                                <span>🟠</span>
                                <span>Enviar para HubSpot</span>
                              </div>
                              {crmIntegrationStatus[`${selectedLead.id}-hubspot`] === 'loading' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                              ) : crmIntegrationStatus[`${selectedLead.id}-hubspot`] === 'success' ? (
                                <span className="text-emerald-500 font-bold">✓ Enviado</span>
                              ) : (
                                <span className="text-xs text-muted">Sincronizar</span>
                              )}
                            </button>

                            {/* Salesforce */}
                            <button 
                              onClick={() => handleCrmSync(selectedLead.id, 'salesforce')}
                              disabled={crmIntegrationStatus[`${selectedLead.id}-salesforce`] === 'loading'}
                              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold text-foreground transition hover:bg-surface-light disabled:opacity-70"
                            >
                              <div className="flex items-center gap-2">
                                <span>🔵</span>
                                <span>Exportar para Salesforce</span>
                              </div>
                              {crmIntegrationStatus[`${selectedLead.id}-salesforce`] === 'loading' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                              ) : crmIntegrationStatus[`${selectedLead.id}-salesforce`] === 'success' ? (
                                <span className="text-emerald-500 font-bold">✓ Exportado</span>
                              ) : (
                                <span className="text-xs text-muted">Sincronizar</span>
                              )}
                            </button>

                            {/* Slack Alert */}
                            <button 
                              onClick={() => handleCrmSync(selectedLead.id, 'slack')}
                              disabled={crmIntegrationStatus[`${selectedLead.id}-slack`] === 'loading'}
                              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold text-foreground transition hover:bg-surface-light disabled:opacity-70"
                            >
                              <div className="flex items-center gap-2">
                                <span>💬</span>
                                <span>Disparar Alerta no Slack</span>
                              </div>
                              {crmIntegrationStatus[`${selectedLead.id}-slack`] === 'loading' ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                              ) : crmIntegrationStatus[`${selectedLead.id}-slack`] === 'success' ? (
                                <span className="text-emerald-500 font-bold">✓ Canal Notificado</span>
                              ) : (
                                <span className="text-xs text-muted">Enviar</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* SUCCESS TOAST FLOATER */}
              {successToast && (
                <div className="fixed bottom-6 left-6 z-[100] rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg animate-bounce flex items-center gap-2 text-sm border-2 border-white">
                  <span>✨</span>
                  <span>{successToast}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB: MARKETING & SOCIAL MEDIA */}
          {activeTab === 'marketing' && (
            <div className="animate-fade-in space-y-8 pb-12">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-[var(--font-display)] text-2xl font-black text-foreground">
                      📣 Central de Conteúdo e Campanhas
                    </h2>
                    <p className="text-sm text-muted mt-1">
                      Idéias de posts de alta conversão recomendadas para redes sociais baseadas na análise de consumismo simulado.
                    </p>
                  </div>
                  <span className="text-3xl shrink-0">💡</span>
                </div>
              </div>

              {/* Grid de Ideias de Post */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* POST 1 */}
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-pink-100 text-pink-700 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        🎬 Reels (Vídeo Curto)
                      </span>
                      <span className="text-xs text-muted font-bold">Objetivo: Atração</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground">Cleiton contra o Tempo</h3>
                    <p className="text-xs text-muted">
                      Roteiro focado em demonstrar a velocidade de entrega do motoboy "Cleiton" simulando a ansiedade de compras por impulso sem gastar nada.
                    </p>
                    <div className="rounded-xl bg-surface-light p-3.5 space-y-1.5 border border-border text-xs">
                      <div className="font-bold text-foreground">Descrição do Vídeo:</div>
                      <p className="text-muted leading-relaxed italic">
                        "Visual: Alguém rolando o celular triste. Fatura: R$ 0,15. Abertura do Dopaminado e compra grátis. Transição rápida para a moto do Cleiton cortando giro com música eletrônica rápida."
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Roteiro Reels: Cleiton contra o Tempo - Alguém rolando o celular triste. Fatura R$ 0,15. Abertura do Dopaminado e compra grátis. Moto do Cleiton cortando giro.");
                        setSuccessToast("Roteiro copiado! 📋");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="flex-1 rounded-xl bg-surface hover:bg-border py-2.5 text-xs font-bold text-foreground transition text-center"
                    >
                      Copiar Roteiro
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("3D render, deliveries courier character wearing a green cybernetic helmet, riding an electric neon scooter, fast motion blur, cyberpunk background");
                        setSuccessToast("Prompt Canva copiado! 🎨");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="rounded-xl border border-border hover:bg-surface-light px-4 py-2.5 text-xs font-bold text-foreground transition"
                      title="Copiar prompt para Canva Magic Media"
                    >
                      Prompt Canva 🎨
                    </button>
                  </div>
                </div>

                {/* POST 2 */}
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        🎠 Carrossel (Infográfico)
                      </span>
                      <span className="text-xs text-muted font-bold">Objetivo: Engajamento</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground">O Ciclo da Compra por Impulso</h3>
                    <p className="text-xs text-muted">
                      Infográfico cômico explicando a psicologia por trás da dopamina imediata na hora de comprar online.
                    </p>
                    <div className="rounded-xl bg-surface-light p-3.5 space-y-1.5 border border-border text-xs">
                      <div className="font-bold text-foreground">Roteiro dos Slides:</div>
                      <p className="text-muted leading-relaxed italic">
                        "Slide 1: O Ciclo do Consumidor Moderno. Slide 2: Tédio e busca por prazer. Slide 3: O clique no carrinho. Slide 4: A ressaca moral da fatura. Slide 5: Como quebrar o ciclo no Dopaminado (Total R$ 0,00)."
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Estrutura Carrossel: Slide 1: Título Ciclo Impulso. Slide 2: Tédio. Slide 3: O clique de compra. Slide 4: A ressaca da fatura. Slide 5: Solução Dopaminado.");
                        setSuccessToast("Estrutura copiada! 📋");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="flex-1 rounded-xl bg-surface hover:bg-border py-2.5 text-xs font-bold text-foreground transition text-center"
                    >
                      Copiar Estrutura
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Instagram post, dark mode cyberpunk, neon purple and lime green accents, minimalist tech interface design, clean typography sans-serif");
                        setSuccessToast("Prompt Canva copiado! 🎨");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="rounded-xl border border-border hover:bg-surface-light px-4 py-2.5 text-xs font-bold text-foreground transition"
                      title="Copiar prompt de design para Canva"
                    >
                      Prompt Canva 🎨
                    </button>
                  </div>
                </div>

                {/* POST 3 */}
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        🖼️ Meme / Imagem Estática
                      </span>
                      <span className="text-xs text-muted font-bold">Objetivo: Viralidade</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground">A Fatura Invisível</h3>
                    <p className="text-xs text-muted">
                      Meme focado em contrastar um valor de carrinho alto com um custo real de zero reais.
                    </p>
                    <div className="rounded-xl bg-surface-light p-3.5 space-y-1.5 border border-border text-xs">
                      <div className="font-bold text-foreground">Sugestão de Legenda:</div>
                      <p className="text-muted leading-relaxed italic">
                        "Sem faturas. Sem ligações de cobrança. Apenas a boa e velha dopamina direto no seu celular. Compre tudo o que não precisa hoje e sinta a adrenalina do botão de finalizar!"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Legenda: Sem faturas. Sem ligações de cobrança. Apenas a boa e velha dopamina direto no seu celular. Compre tudo o que não precisa hoje e sinta a adrenalina do botão de finalizar!");
                        setSuccessToast("Legenda copiada! 📋");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="flex-1 rounded-xl bg-surface hover:bg-border py-2.5 text-xs font-bold text-foreground transition text-center"
                    >
                      Copiar Legenda
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("3D render, cyberpunk aesthetic, a smartphone floating on a clean deep dark background, displaying a neon interface. Vibrant electric violet (#7c3aed) and glowing neon lime-green (#ccff00)");
                        setSuccessToast("Prompt Canva copiado! 🎨");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="rounded-xl border border-border hover:bg-surface-light px-4 py-2.5 text-xs font-bold text-foreground transition"
                      title="Copiar prompt de imagem para Canva"
                    >
                      Prompt Canva 🎨
                    </button>
                  </div>
                </div>

                {/* POST 4 */}
                <div className="rounded-3xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                        📱 Stories Interativos
                      </span>
                      <span className="text-xs text-muted font-bold">Objetivo: Conversão</span>
                    </div>
                    <h3 className="text-lg font-black text-foreground">Termômetro de Dopamina Diária</h3>
                    <p className="text-xs text-muted">
                      Estratégia de enquetes interativas para medir a vontade de consumo impulsivo dos seguidores.
                    </p>
                    <div className="rounded-xl bg-surface-light p-3.5 space-y-1.5 border border-border text-xs">
                      <div className="font-bold text-foreground">Ideia de Ação:</div>
                      <p className="text-muted leading-relaxed italic">
                        "Fazer enquete: 'Onde você está buscando dopamina hoje?' com opções como 'comprando blusas', 'comendo doces' ou 'no Dopaminado de graça'. Link do app no final."
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Ação Stories: Enquete 'Onde você está buscando dopamina hoje?' com opções divertidas e link do app no final.");
                        setSuccessToast("Ideia copiada! 📋");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="flex-1 rounded-xl bg-surface hover:bg-border py-2.5 text-xs font-bold text-foreground transition text-center"
                    >
                      Copiar Roteiro Stories
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Escreva 5 frases curtas e impactantes para posts de Instagram sobre o aplicativo 'Dopaminado'. O tom deve ser humorístico, sarcástico.");
                        setSuccessToast("Prompt Canva copiado! 🎨");
                        setTimeout(() => setSuccessToast(null), 2000);
                      }}
                      className="rounded-xl border border-border hover:bg-surface-light px-4 py-2.5 text-xs font-bold text-foreground transition"
                      title="Copiar prompt de texto Canva"
                    >
                      Prompt Magic Write 🎨
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUCCESS TOAST FLOATER */}
          {successToast && (
            <div className="fixed bottom-6 left-6 z-[100] rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg animate-bounce flex items-center gap-2 text-sm border-2 border-white">
              <span>✨</span>
              <span>{successToast}</span>
            </div>
          )}

        </>
      )}
    </div>
  );
}
