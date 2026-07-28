'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PostHogData {
  kpis: any;
  pageviewsByDay: any[];
  deviceTypes: any[];
  topReferrers: any[];
  topPages: any[];
  topEvents: any[];
  topBrowsers: any[];
  topCities: any[];
  eventsOverview?: any[];
  dailyTrends?: any[];
  funnel?: any[];
  trends?: any[];
  retention?: any[];
}

export interface HubSpotCrmData {
  kpis: {
    totalContacts: number;
    totalDeals: number;
    pipelineValue: number;
    closedWonCount: number;
    closedWonValue: number;
    closedLostCount: number;
    winRate: number;
    avgDealSize: number;
    totalCompanies: number;
    totalTickets: number;
  };
  pipelineFunnel: Array<{ stageId: string; name: string; icon: string; count: number; amount: number }>;
  lifecycleStages: Array<{ stageKey: string; label: string; count: number }>;
  topDeals: Array<{ id: string; name: string; amount: number; stage: string; closeDate: string }>;
  recentContacts: Array<{ id: string; name: string; email: string; title: string; status: string; stage: string; createdDate: string }>;
  topCompanies?: Array<{ id: string; name: string; domain: string; industry: string; revenue: number }>;
}

export interface KPI {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

export interface FunnelStep {
  name: string;
  value: number;
  conversion: string;
}

export interface TopProduct {
  id: string;
  name: string;
  short_name?: string;
  image_url?: string;
  metrics: {
    views: number;
    carts: number;
    checkouts: number;
    rev: number;
  };
}

export interface AuditedProduct {
  query: string;
  count: number;
  avgPrice: number;
  avgOverprice: number;
  stores: string[];
  totalFlaws: number;
}

export interface AuditInsights {
  totalAudits: number;
  avgOverprice: number;
  overpriceDistribution: { range: string; count: number }[];
  topAuditedProducts: AuditedProduct[];
  storeBreakdown: { name: string; count: number }[];
  searchTypeBreakdown: { type: string; count: number }[];
  auditTimeline: { date: string; count: number }[];
  totalFlawsDetected: number;
  verdictBreakdown: { verdict: string; count: number }[];
}

export interface TimelineData {
  date: string;
  sessions: number;
  conversions: number;
}

export interface IntentLead {
  id: string;
  score: number;
  stage: 'AUDITOR POWER' | 'AUDITOR ATIVO' | 'EXPLORADOR' | 'VISITANTE';
  audits: any[];
  views: any[];
  carts: any[];
  checkouts: any[];
  events: any[];
  sessionsCount: number;
  lastActive: string;
  deviceLocal: string;
  gender: string;
  nickname?: string;
  email?: string;
  fakeRev: number;
  totalAudits: number;
  avgOverprice: number;
  triggersDetected?: number;
  darkPatterns?: string[];
}

export function useInsightsData() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  // Core Aggregations
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [demographics, setDemographics] = useState<{ gender: any[]; os: any[]; state: any[] }>({ gender: [], os: [], state: [] });
  const [marketing, setMarketing] = useState<{ utmSource: any[]; utmMedium: any[]; referrer: any[] }>({ utmSource: [], utmMedium: [], referrer: [] });
  const [hardware, setHardware] = useState<{ connection: any[]; ram: any[]; cores: any[]; theme: any[] }>({ connection: [], ram: [], cores: [], theme: [] });
  const [uxMetrics, setUxMetrics] = useState<any>({
    avgDwellTime: 0,
    rageClicksCount: 0,
    scrollDepthMap: [],
    deadClicksCount: 0,
    frustrationCount: 0,
    jsErrors: [],
    webVitals: { lcp: 0, cls: 0, fid: 0, inp: 0, ttfb: 0, fcp: 0 },
    heatmapData: [],
    visibilityImpressions: []
  });

  const [ecommerceInsights, setEcommerceInsights] = useState<any>({
    searchTerms: [],
    abandonedCarts: [],
    boughtTogether: [],
    topProducts: [],
  });

  // Audit Intelligence aggregations
  const [auditInsights, setAuditInsights] = useState<AuditInsights>({
    totalAudits: 0,
    avgOverprice: 0,
    overpriceDistribution: [],
    topAuditedProducts: [],
    storeBreakdown: [],
    searchTypeBreakdown: [],
    auditTimeline: [],
    totalFlawsDetected: 0,
    verdictBreakdown: [],
  });

  // Weights for intent score computation (audit-focused)
  const [scoreWeights, setScoreWeights] = useState({
    viewItem: 5,
    addToCart: 10,
    checkoutBasket: 15,
    superSearch: 40,  // Primary action now
    dwell60s: 10,
    rageClick: -10,
    triggersExposed: 15,
  });

  // Raw fetched arrays for real-time local re-calculations
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [exactCounts, setExactCounts] = useState({ bookmarklets: 0, audits: 0 });
  const [productDict, setProductDict] = useState<Record<string, any>>({});

  const [intentData, setIntentData] = useState<{
    avgScore: number;
    leadsByStage: { stage: string; count: number; percentage: number }[];
    topLeads: IntentLead[];
    scoreDistribution: { range: string; count: number }[];
    triggersExposedCount: number;
  }>({
    avgScore: 0,
    leadsByStage: [],
    topLeads: [],
    scoreDistribution: [],
    triggersExposedCount: 0
  });

  // External APIs
  const [ga4Data, setGa4Data] = useState<any>(null);
  const [posthogData, setPosthogData] = useState<any>(null);
  const [posthogError, setPosthogError] = useState<string | null>(null);
  const [hubspotCrmData, setHubspotCrmData] = useState<any>(null);
  const [hubspotError, setHubspotError] = useState<string | null>(null);

  // Pure mathematical score calculator
  const recomputeIntentMetrics = useCallback((sessions: any[], events: any[], pDict: Record<string, any>, weights: typeof scoreWeights) => {
    const sessionMap: Record<string, {
      id: string;
      events: any[];
      deviceLocal: string;
      gender: string;
      lastActive: string;
    }> = {};

    sessions.forEach(s => {
      const info = s.device_info || {};
      const city = info.city && info.city !== 'Desconhecido' ? info.city : '';
      const state = info.state && info.state !== 'Desconhecido' ? info.state : '';
      const os = info.os_name || '';
      const local = [city, state, os].filter(Boolean).join(', ') || 'Navegador Anônimo';

      sessionMap[s.session_id] = {
        id: s.session_id,
        events: [],
        deviceLocal: local,
        gender: info.mock_gender || 'Não Informado',
        lastActive: s.created_at
      };
    });

    events.forEach(e => {
      if (!sessionMap[e.session_id]) {
        sessionMap[e.session_id] = {
          id: e.session_id,
          events: [],
          deviceLocal: e.metadata?.store_name ? `Loja (${e.metadata.store_name})` : 'Visitante Externo',
          gender: 'Não Informado',
          lastActive: e.created_at
        };
      }
      sessionMap[e.session_id].events.push(e);
      if (new Date(e.created_at) > new Date(sessionMap[e.session_id].lastActive)) {
        sessionMap[e.session_id].lastActive = e.created_at;
      }
    });

    let totalScore = 0;
    let triggersCount = 0;
    const leads: IntentLead[] = [];

    Object.values(sessionMap).forEach(sess => {
      let score = 0;
      const audits: any[] = [];
      const views: any[] = [];
      const carts: any[] = [];
      const checkouts: any[] = [];
      let fakeRev = 0;
      let sessTriggers = 0;
      let sessOverpriceSum = 0;
      const darkPatternsSet = new Set<string>();

      sess.events.forEach(ev => {
        const type = ev.event_type;
        const pName = pDict[ev.product_id]?.name || ev.metadata?.store_name || ev.metadata?.query || `Item ${ev.product_id?.split('-')[0] || ''}`;

        if (type === 'super_search') {
          score += weights.superSearch;
          audits.push({
            name: ev.metadata?.query || pName,
            time: ev.created_at,
            price: ev.price_displayed || ev.metadata?.current_price || 0,
            overprice: ev.metadata?.overprice_percentage || 0,
            store: ev.metadata?.store_detected || 'unknown',
            flaws: ev.metadata?.flaws_count || 0,
          });
          sessOverpriceSum += ev.metadata?.overprice_percentage || 0;
          fakeRev += ev.price_displayed || 0;
        } else if (type === 'view_item') {
          score += weights.viewItem;
          views.push({ name: pName, time: ev.created_at });
        } else if (type === 'add_to_cart') {
          score += weights.addToCart;
          carts.push({ name: pName, time: ev.created_at });
        } else if (type === 'fake_checkout' || type === 'checkout_basket') {
          score += weights.checkoutBasket;
          checkouts.push({ name: pName, time: ev.created_at });
          fakeRev += ev.price_displayed || 0;
        } else if (type === 'page_leave' && ev.metadata?.dwell_time_seconds >= 60) {
          score += weights.dwell60s;
        } else if (type === 'rage_click') {
          score += weights.rageClick;
        } else if (type === 'dark_pattern_audit') {
          sessTriggers += ev.metadata?.triggers_count || 1;
          triggersCount += ev.metadata?.triggers_count || 1;
          score += (ev.metadata?.triggers_count || 1) * weights.triggersExposed;
          if (ev.metadata?.counts) {
            Object.keys(ev.metadata.counts).forEach(k => {
              if (ev.metadata.counts[k] > 0) darkPatternsSet.add(k);
            });
          }
        }
      });

      score = Math.max(0, Math.min(100, score));
      totalScore += score;

      // Audit-focused stages
      let stage: IntentLead['stage'] = 'VISITANTE';
      if (audits.length >= 5) stage = 'AUDITOR POWER';
      else if (audits.length >= 2) stage = 'AUDITOR ATIVO';
      else if (audits.length >= 1 || score >= 35) stage = 'EXPLORADOR';

      leads.push({
        id: sess.id,
        score,
        stage,
        audits,
        views,
        carts,
        checkouts,
        events: sess.events,
        sessionsCount: 1,
        lastActive: sess.lastActive,
        deviceLocal: sess.deviceLocal,
        gender: sess.gender,
        fakeRev,
        totalAudits: audits.length,
        avgOverprice: audits.length > 0 ? Math.round(sessOverpriceSum / audits.length) : 0,
        triggersDetected: sessTriggers,
        darkPatterns: Array.from(darkPatternsSet)
      });
    });

    leads.sort((a, b) => b.score - a.score);

    const totalLeads = leads.length || 1;
    const stageCounts: Record<string, number> = { 'AUDITOR POWER': 0, 'AUDITOR ATIVO': 0, 'EXPLORADOR': 0, 'VISITANTE': 0 };
    leads.forEach(l => stageCounts[l.stage]++);

    const leadsByStage = [
      { stage: 'AUDITOR POWER', count: stageCounts['AUDITOR POWER'], percentage: Math.round((stageCounts['AUDITOR POWER'] / totalLeads) * 100) },
      { stage: 'AUDITOR ATIVO', count: stageCounts['AUDITOR ATIVO'], percentage: Math.round((stageCounts['AUDITOR ATIVO'] / totalLeads) * 100) },
      { stage: 'EXPLORADOR', count: stageCounts['EXPLORADOR'], percentage: Math.round((stageCounts['EXPLORADOR'] / totalLeads) * 100) },
      { stage: 'VISITANTE', count: stageCounts['VISITANTE'], percentage: Math.round((stageCounts['VISITANTE'] / totalLeads) * 100) },
    ];

    const distMap: Record<string, number> = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    leads.forEach(l => {
      if (l.score <= 20) distMap['0-20']++;
      else if (l.score <= 40) distMap['21-40']++;
      else if (l.score <= 60) distMap['41-60']++;
      else if (l.score <= 80) distMap['61-80']++;
      else distMap['81-100']++;
    });

    const scoreDistribution = Object.keys(distMap).map(range => ({ range, count: distMap[range] }));

    return {
      avgScore: Math.round(totalScore / totalLeads),
      leadsByStage,
      topLeads: leads,
      scoreDistribution,
      triggersExposedCount: triggersCount
    };
  }, []);

  // Recompute intent metrics when weights change
  useEffect(() => {
    if (rawSessions.length > 0 || rawEvents.length > 0) {
      const computed = recomputeIntentMetrics(rawSessions, rawEvents, productDict, scoreWeights);
      setIntentData(computed);
    }
  }, [rawSessions, rawEvents, productDict, scoreWeights, recomputeIntentMetrics]);

  // ── Fetch Data ──
  const fetchDashboardData = useCallback(async (startDate?: string, endDate?: string, silent = false, targetTab?: string) => {
    if (!silent) setLoading(true);
    try {
      const formatMap = (map: Record<string, number>) =>
        Object.keys(map).map(name => ({ name, value: map[name] })).sort((a, b) => b.value - a.value);

      // 1. Fetch Sessions (sessions table has session_id, device_info)
      const sessionQuery = supabase.from('sessions').select('*', { count: 'exact' });
      const { data: sessionData, count: sessionCount, error: sessionError } = await sessionQuery;
      if (sessionError) console.warn('Sessions fetch warning:', sessionError.message);

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
          let ref = 'Direto';
          try { ref = info.referrer ? new URL(info.referrer).hostname : 'Direto'; } catch {}
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

      setDemographics({ gender: formatMap(genderMap), os: formatMap(osMap).slice(0, 5), state: formatMap(stateMap).slice(0, 7) });
      setMarketing({ utmSource: formatMap(sourceMap).slice(0, 5), utmMedium: formatMap(mediumMap).slice(0, 5), referrer: formatMap(referrerMap).slice(0, 5) });
      setHardware({ connection: formatMap(connMap).slice(0, 5), ram: formatMap(ramMap).slice(0, 5), cores: formatMap(coresMap).slice(0, 5), theme: formatMap(themeMap).slice(0, 3) });

      // 2. Fetch Events
      let eventQuery = supabase.from('intent_events').select('*').order('created_at', { ascending: false });
      if (startDate) eventQuery = eventQuery.gte('created_at', startDate);
      if (endDate) eventQuery = eventQuery.lte('created_at', endDate);
      const { data: events, error: eventsError } = await eventQuery;
      if (eventsError) throw eventsError;

      // 3. Fetch Exact Counts for Specific Events (ignoring 1000 row limit)
      let bookmarkletQuery = supabase.from('intent_events').select('id', { count: 'exact', head: true }).eq('event_type', 'bookmarklet_installed');
      if (startDate) bookmarkletQuery = bookmarkletQuery.gte('created_at', startDate);
      if (endDate) bookmarkletQuery = bookmarkletQuery.lte('created_at', endDate);
      const { count: bookmarkletInstallsCount } = await bookmarkletQuery;

      let auditQuery = supabase.from('intent_events').select('id', { count: 'exact', head: true }).eq('event_type', 'dark_pattern_audit');
      if (startDate) auditQuery = auditQuery.gte('created_at', startDate);
      if (endDate) auditQuery = auditQuery.lte('created_at', endDate);
      const { count: storeAuditsCount } = await auditQuery;

      // 4. Fetch Product Dictionary
      const { data: allProducts } = await supabase.from('products').select('id, name, short_name');
      const pDict = (allProducts || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});

      setExactCounts({ bookmarklets: bookmarkletInstallsCount || 0, audits: storeAuditsCount || 0 });

      let viewCount = 0, cartCount = 0, checkoutCount = 0, fakeRev = 0;
      let totalDwellTime = 0, dwellEvents = 0, rageClicks = 0;
      const scrollMap: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };
      const timelineMap: Record<string, number> = {};
      const productInteractions: Record<string, { views: number; carts: number; checkouts: number; rev: number }> = {};
      const searchMap: Record<string, number> = {};
      const abandonedList: any[] = [];
      const pairMap: Record<string, number> = {};

      let deadClicks = 0, frustrationCount = 0;
      const jsErrorsList: any[] = [];
      const vitalsMap: Record<string, { sum: number, count: number }> = {};
      const heatmapsList: any[] = [];
      const impressionsMap: Record<string, number> = {};

      // Audit Intelligence accumulators
      let auditCount = 0;
      let totalOverprice = 0;
      let totalFlawsDetected = 0;
      const auditQueryMap: Record<string, { count: number; priceSum: number; overpriceSum: number; stores: Set<string>; flawsSum: number }> = {};
      const auditStoreMap: Record<string, number> = {};
      const auditSearchTypeMap: Record<string, number> = {};
      const auditTimelineMap: Record<string, number> = {};
      const auditVerdictMap: Record<string, number> = {};

      events?.forEach((ev) => {
        const dateStr = new Date(ev.created_at).toLocaleDateString('pt-BR');
        timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;

        if (ev.event_type === 'view_item') viewCount++;
        if (ev.event_type === 'add_to_cart') cartCount++;
        if (ev.event_type === 'fake_checkout' || ev.event_type === 'checkout_basket') { checkoutCount++; fakeRev += ev.price_displayed || 0; }

        // Audit Intelligence: process super_search events
        if (ev.event_type === 'super_search') {
          auditCount++;
          const query = (ev.metadata?.query || '').toLowerCase().trim();
          const overprice = ev.metadata?.overprice_percentage || 0;
          const store = ev.metadata?.store_detected || ev.metadata?.store_name || 'unknown';
          const searchType = ev.metadata?.search_type || 'text';
          const flaws = ev.metadata?.flaws_count || 0;
          const verdict = ev.metadata?.price_verdict || 'unknown';
          const auditDate = new Date(ev.created_at).toLocaleDateString('pt-BR');

          totalOverprice += overprice;
          totalFlawsDetected += flaws;

          if (query) {
            if (!auditQueryMap[query]) auditQueryMap[query] = { count: 0, priceSum: 0, overpriceSum: 0, stores: new Set(), flawsSum: 0 };
            auditQueryMap[query].count++;
            auditQueryMap[query].priceSum += ev.price_displayed || ev.metadata?.current_price || 0;
            auditQueryMap[query].overpriceSum += overprice;
            auditQueryMap[query].stores.add(store);
            auditQueryMap[query].flawsSum += flaws;
          }

          auditStoreMap[store] = (auditStoreMap[store] || 0) + 1;
          auditSearchTypeMap[searchType] = (auditSearchTypeMap[searchType] || 0) + 1;
          auditTimelineMap[auditDate] = (auditTimelineMap[auditDate] || 0) + 1;
          auditVerdictMap[verdict] = (auditVerdictMap[verdict] || 0) + 1;
        }

        if (ev.event_type === 'page_leave' && ev.metadata?.dwell_time_seconds) { totalDwellTime += ev.metadata.dwell_time_seconds; dwellEvents++; }
        if (ev.event_type === 'rage_click') rageClicks++;
        if (ev.event_type === 'scroll_depth' && ev.metadata?.depth_percentage) {
          const depth = `${ev.metadata.depth_percentage}%`;
          if (scrollMap[depth] !== undefined) scrollMap[depth]++;
        }
        
        // UX Telemetry
        if (ev.event_type === 'dead_click') deadClicks++;
        if (ev.event_type === 'cursor_frustration') frustrationCount++;
        if (ev.event_type === 'js_error') {
          jsErrorsList.push({ ...ev.metadata, time: ev.created_at });
        }
        if (ev.event_type === 'web_vitals' && ev.metadata?.name && ev.metadata?.value) {
          const name = ev.metadata.name;
          if (!vitalsMap[name]) vitalsMap[name] = { sum: 0, count: 0 };
          vitalsMap[name].sum += ev.metadata.value;
          vitalsMap[name].count++;
        }
        if (ev.event_type === 'heatmap_click' || ev.event_type === 'heatmap_move') {
          if (ev.metadata?.x !== undefined && ev.metadata?.vw) {
            heatmapsList.push({
              type: ev.event_type,
              x: (ev.metadata.x / ev.metadata.vw) * 100,
              y: (ev.metadata.y / (ev.metadata.vh || 800)) * 100
            });
          }
        }
        if (ev.event_type === 'visibility_impression' && ev.metadata?.element_id) {
          const name = ev.metadata.element_id;
          impressionsMap[name] = (impressionsMap[name] || 0) + 1;
        }

        // Product level stats
        if (ev.product_id) {
          if (!productInteractions[ev.product_id]) {
            productInteractions[ev.product_id] = { views: 0, carts: 0, checkouts: 0, rev: 0 };
          }
          if (ev.event_type === 'view_item') productInteractions[ev.product_id].views++;
          if (ev.event_type === 'add_to_cart') productInteractions[ev.product_id].carts++;
          if (ev.event_type === 'fake_checkout' || ev.event_type === 'checkout_basket') {
            productInteractions[ev.product_id].checkouts++;
            productInteractions[ev.product_id].rev += ev.price_displayed || 0;
          }
        }

        // E-commerce Intelligence
        if (ev.event_type === 'search_query' && ev.metadata?.query) {
          const q = ev.metadata.query.toLowerCase().trim();
          searchMap[q] = (searchMap[q] || 0) + 1;
        }
        if (ev.event_type === 'cart_abandonment' && ev.metadata?.items) {
          abandonedList.push({
            session_id: ev.session_id,
            items: ev.metadata.items,
            value: ev.price_displayed || 0,
            time: ev.created_at
          });
        }
        if (ev.event_type === 'bought_together' && ev.metadata?.pair) {
          const pair = ev.metadata.pair;
          pairMap[pair] = (pairMap[pair] || 0) + 1;
        }
      });

      setRawSessions(safeSessionData);
      setRawEvents(events || []);
      setProductDict(pDict);

      // Compute intent leads
      const computedIntent = recomputeIntentMetrics(safeSessionData, events || [], pDict, scoreWeights);
      setIntentData(computedIntent);

      const totalSess = sessionCount || safeSessionData.length || 0;
      const totalEvs = events?.length || 0;
      const auditRate = totalSess > 0 ? ((auditCount / totalSess) * 100).toFixed(1) : '0';
      const avgOp = auditCount > 0 ? (totalOverprice / auditCount).toFixed(1) : '0';

      setKpis([
        { title: 'Sessões Únicas', value: totalSess.toLocaleString('pt-BR'), change: 'Tempo Real', isPositive: true },
        { title: 'Auditorias Realizadas', value: auditCount.toLocaleString('pt-BR'), change: 'Super Search', isPositive: auditCount > 0 },
        { title: 'Sobrepreço Médio', value: `${avgOp}%`, change: 'Detectado', isPositive: parseFloat(avgOp) > 0 },
        { title: 'Defeitos Encontrados', value: totalFlawsDetected.toLocaleString('pt-BR'), change: 'Reddit + IA', isPositive: totalFlawsDetected > 0 },
        { title: 'Taxa de Auditoria', value: `${auditRate}%`, change: 'Sessão→Busca', isPositive: parseFloat(auditRate) > 10 },
        { title: 'Eventos Capturados', value: totalEvs.toLocaleString('pt-BR'), change: 'Tempo Real', isPositive: true },
      ]);

      const searchInitiated = auditCount;
      const reSearch = events?.filter(e => e.event_type === 'super_search').length || 0;

      setFunnelData([
        { name: 'Sessões', value: totalSess, conversion: '100%' },
        { name: 'Busca Iniciada', value: searchInitiated, conversion: totalSess > 0 ? `${Math.round((searchInitiated/totalSess)*100)}%` : '0%' },
        { name: 'Auditoria Concluída', value: auditCount, conversion: searchInitiated > 0 ? `${Math.round((auditCount/searchInitiated)*100)}%` : '0%' },
        { name: 'Re-busca', value: Math.max(0, reSearch - new Set(events?.filter(e => e.event_type === 'super_search').map(e => e.session_id)).size), conversion: auditCount > 0 ? `${Math.round((Math.max(0, reSearch - new Set(events?.filter(e => e.event_type === 'super_search').map(e => e.session_id)).size)/auditCount)*100)}%` : '0%' },
      ]);

      // Compute Audit Insights
      const overpriceDistMap: Record<string, number> = { '0-10%': 0, '10-30%': 0, '30-50%': 0, '50%+': 0 };
      events?.filter(e => e.event_type === 'super_search').forEach(e => {
        const op = e.metadata?.overprice_percentage || 0;
        if (op <= 10) overpriceDistMap['0-10%']++;
        else if (op <= 30) overpriceDistMap['10-30%']++;
        else if (op <= 50) overpriceDistMap['30-50%']++;
        else overpriceDistMap['50%+']++;
      });

      const topAuditedProducts: AuditedProduct[] = Object.entries(auditQueryMap)
        .map(([query, data]) => ({
          query,
          count: data.count,
          avgPrice: data.count > 0 ? Math.round(data.priceSum / data.count) : 0,
          avgOverprice: data.count > 0 ? Math.round(data.overpriceSum / data.count) : 0,
          stores: Array.from(data.stores),
          totalFlaws: data.flawsSum,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      setAuditInsights({
        totalAudits: auditCount,
        avgOverprice: auditCount > 0 ? Math.round(totalOverprice / auditCount) : 0,
        overpriceDistribution: Object.entries(overpriceDistMap).map(([range, count]) => ({ range, count })),
        topAuditedProducts,
        storeBreakdown: Object.entries(auditStoreMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10),
        searchTypeBreakdown: Object.entries(auditSearchTypeMap).map(([type, count]) => ({ type, count })),
        auditTimeline: Object.entries(auditTimelineMap).map(([date, count]) => ({ date, count })),
        totalFlawsDetected,
        verdictBreakdown: Object.entries(auditVerdictMap).map(([verdict, count]) => ({ verdict, count })).sort((a, b) => b.count - a.count),
      });

      setTimelineData(Object.keys(timelineMap).map(date => ({ date, sessions: timelineMap[date], conversions: Math.floor(timelineMap[date] * 0.1) })));

      const calcVital = (name: string) => vitalsMap[name] ? Math.round(vitalsMap[name].sum / vitalsMap[name].count) : 0;

      setUxMetrics({ 
        avgDwellTime: dwellEvents > 0 ? Math.floor(totalDwellTime / dwellEvents) : 0, 
        rageClicksCount: rageClicks, 
        scrollDepthMap: Object.keys(scrollMap).map(k => ({ name: k, value: scrollMap[k] })),
        deadClicksCount: deadClicks,
        frustrationCount: frustrationCount,
        jsErrors: jsErrorsList.slice(-20),
        webVitals: {
          lcp: calcVital('LCP'),
          cls: vitalsMap['CLS'] ? (vitalsMap['CLS'].sum / vitalsMap['CLS'].count) : 0,
          fid: calcVital('FID'),
          inp: calcVital('INP'),
          ttfb: calcVital('TTFB'),
          fcp: calcVital('FCP')
        },
        heatmapData: heatmapsList,
        visibilityImpressions: Object.keys(impressionsMap).map(k => ({ name: k, count: impressionsMap[k] })).sort((a,b) => b.count - a.count)
      });

      setEcommerceInsights({
        searchTerms: formatMap(searchMap).slice(0, 10),
        abandonedCarts: abandonedList.sort((a, b) => b.value - a.value).slice(0, 10),
        boughtTogether: formatMap(pairMap).slice(0, 10),
        topProducts: Object.keys(productInteractions).map(id => {
          const product = pDict[id];
          return { id, name: product ? product.name : `Produto ${id.split('-')[0]}`, views: productInteractions[id].views, carts: productInteractions[id].carts, rev: productInteractions[id].rev };
        }).sort((a, b) => b.rev - a.rev).slice(0, 10),
      });

      // Top Products with images
      const topIds = Object.keys(productInteractions).sort((a, b) => productInteractions[b].carts - productInteractions[a].carts).slice(0, 5);
      if (topIds.length > 0) {
        const { data: productsData } = await supabase.from('products').select('id, name, short_name, image_url').in('id', topIds);
        const formattedTopProducts = productsData?.map(p => ({ ...p, metrics: productInteractions[p.id] })) || [];
        formattedTopProducts.sort((a, b) => b.metrics.carts - a.metrics.carts);
        setTopProducts(formattedTopProducts);
      }

      // External APIs (only fetched if targetTab is overview, hubspot, or initial load)
      let queryParams = '';
      if (startDate || endDate) {
        const p = new URLSearchParams();
        if (startDate) p.append('startDate', startDate);
        if (endDate) p.append('endDate', endDate);
        queryParams = `?${p.toString()}`;
      }

      if (!targetTab || targetTab === 'overview') {
        // GA4 Data
        try {
          const ga4Res = await fetch(`/api/analytics/ga4${queryParams}`);
          if (ga4Res.ok) {
            const ga4Json = await ga4Res.json();
            if (ga4Json.data) setGa4Data(ga4Json.data);
            else if (ga4Json.data === null) setGa4Data('empty');
          }
        } catch (err) { console.error('Failed to fetch GA4 data:', err); }

        // PostHog Data
        try {
          const phRes = await fetch(`/api/analytics/posthog${queryParams}`);
          if (phRes.ok) {
            const phJson = await phRes.json();
            if (phJson.data) { setPosthogData(phJson.data); setPosthogError(null); }
            else if (phJson.error) setPosthogError(phJson.error);
          }
        } catch (err) { console.error('Failed to fetch PostHog data:', err); }
      }

      if (!targetTab || targetTab === 'hubspot') {
        // HubSpot Data
        try {
          const hsRes = await fetch(`/api/analytics/hubspot${queryParams}`);
          if (hsRes.ok) {
            const hsJson = await hsRes.json();
            if (hsJson.data) { setHubspotCrmData(hsJson.data); setHubspotError(null); }
            else if (hsJson.error) setHubspotError(hsJson.error);
          }
        } catch (err) { console.error('Failed to fetch HubSpot CRM data:', err); }
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [recomputeIntentMetrics, scoreWeights]);

  // ── Supabase Realtime Subscription ──
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sessions' },
        () => {
          // Re-fetch silently via WebSocket when a new session arrives
          fetchDashboardData(undefined, undefined, true);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'intent_events' },
        () => {
          // Re-fetch silently via WebSocket when a new event arrives
          fetchDashboardData(undefined, undefined, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  return {
    loading,
    lastUpdated,
    scoreWeights, setScoreWeights,
    kpis, funnelData, topProducts, timelineData, demographics, hardware, marketing,
    uxMetrics, ecommerceInsights, intentData, auditInsights,
    ga4Data, posthogData, posthogError, hubspotCrmData, hubspotError,
    rawSessions, rawEvents,
    exactCounts,
    fetchDashboardData
  };
}
