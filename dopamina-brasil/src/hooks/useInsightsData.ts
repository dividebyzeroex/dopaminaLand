'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ────── Types ──────
export interface KpiData {
  totalSessions: number;
  totalCheckouts: number;
  conversionRate: number;
  fakeRevenue: number;
  aov: number;
  cartAbandonment: number;
}

export interface IntentLead {
  id: string;
  deviceLocal: string;
  source: string;
  score: number;
  stage: string;
  events: number;
  fakeRev: number;
  lastActive: string;
  views: string[];
  carts: string[];
  timeline: any[];
  email?: string;
  nickname?: string;
}

export interface IntentData {
  funnelStages: { awareness: number; consideration: number; decision: number };
  topLeads: IntentLead[];
}

export interface ScoreWeights {
  fake_checkout: number;
  share_product: number;
  add_to_cart: number;
  dwell_time_exceeded: number;
  view_item: number;
  rage_click: number;
  search: number;
  cart_abandoned: number;
}

export interface PostHogData {
  kpis: { pageviews30d: number; sessions30d: number; pageviews7d: number; sessions7d: number };
  pageviewsByDay: { date: string; pageviews: number }[];
  topEvents: { name: string; count: number }[];
  topPages: { url: string; views: number }[];
  topCities: { city: string; country: string; count: number }[];
  topReferrers: { domain: string; count: number }[];
  topBrowsers: { name: string; count: number }[];
  deviceTypes: { type: string; count: number }[];
}

export interface HubSpotCrmData {
  kpis: { totalContacts: number; totalDeals: number; pipelineValue: number; closedWon: number };
  pipelineFunnel: { stageId: string; name: string; value: number }[];
  recentContacts: { id: string; name: string; email: string; status: string; createdDate: string }[];
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  fake_checkout: 50,
  share_product: 30,
  add_to_cart: 20,
  dwell_time_exceeded: 10,
  view_item: 5,
  rage_click: 15,
  search: 10,
  cart_abandoned: -5,
};

// ────── Hook ──────
export function useInsightsData() {
  const [loading, setLoading] = useState(false);
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);

  // Supabase raw data
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [productDict, setProductDict] = useState<Record<string, any>>({});

  // Computed data
  const [kpis, setKpis] = useState<KpiData>({ totalSessions: 0, totalCheckouts: 0, conversionRate: 0, fakeRevenue: 0, aov: 0, cartAbandonment: 0 });
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [demographics, setDemographics] = useState({ gender: [] as any[], os: [] as any[], state: [] as any[] });
  const [hardware, setHardware] = useState({ connection: [] as any[], ram: [] as any[], cores: [] as any[], theme: [] as any[] });
  const [marketing, setMarketing] = useState({ utmSource: [] as any[], utmMedium: [] as any[], referrer: [] as any[] });
  const [uxMetrics, setUxMetrics] = useState({ avgDwellTime: 0, rageClicksCount: 0, scrollDepthMap: [] as any[] });
  const [ecommerceInsights, setEcommerceInsights] = useState({ searchTerms: [] as any[], abandonedCarts: [] as any[], boughtTogether: [] as any[], topProducts: [] as any[] });
  const [intentData, setIntentData] = useState<IntentData>({ funnelStages: { awareness: 0, consideration: 0, decision: 0 }, topLeads: [] });

  // External APIs
  const [ga4Data, setGa4Data] = useState<any>(null);
  const [posthogData, setPosthogData] = useState<PostHogData | null>(null);
  const [posthogError, setPosthogError] = useState<string | null>(null);
  const [hubspotCrmData, setHubspotCrmData] = useState<HubSpotCrmData | null>(null);
  const [hubspotError, setHubspotError] = useState<string | null>(null);

  // ── Intent Metrics Computation ──
  const recomputeIntentMetrics = useCallback((
    sessionsList: any[],
    eventsList: any[],
    pDict: Record<string, any>,
    weights: ScoreWeights,
  ): IntentData => {
    let awareness = 0, consideration = 0, decision = 0;

    const sessionScores: Record<string, {
      score: number; events: number; fakeRev: number; lastActive: string;
      productsViewed: Set<string>; productsCarted: Set<string>; eventTimeline: any[];
    }> = {};

    eventsList.forEach((ev) => {
      const sid = ev.session_id;
      if (sid) {
        if (!sessionScores[sid]) {
          sessionScores[sid] = { score: 0, events: 0, fakeRev: 0, lastActive: ev.created_at, productsViewed: new Set(), productsCarted: new Set(), eventTimeline: [] };
        }
        const weight = weights[ev.event_type as keyof ScoreWeights] || 0;
        sessionScores[sid].score += weight;
        sessionScores[sid].events += 1;
        if (ev.created_at > sessionScores[sid].lastActive) sessionScores[sid].lastActive = ev.created_at;
        if (ev.event_type === 'fake_checkout') sessionScores[sid].fakeRev += ev.price_displayed || 0;

        const product = pDict[ev.product_id || ''];
        const pName = product ? product.short_name : ev.product_id;
        if (ev.product_id) {
          if (ev.event_type === 'view_item') sessionScores[sid].productsViewed.add(pName);
          if (ev.event_type === 'add_to_cart') sessionScores[sid].productsCarted.add(pName);
        }
        sessionScores[sid].eventTimeline.push({
          id: ev.id, event_type: ev.event_type, price_displayed: ev.price_displayed,
          created_at: ev.created_at, product_name: product ? product.name : ev.product_id, metadata: ev.metadata,
        });
      }
    });

    let finalSessionData = sessionsList || [];
    if (finalSessionData.length === 0 && eventsList.length > 0) {
      const uniqueSids = Array.from(new Set(eventsList.map(e => e.session_id).filter(Boolean)));
      finalSessionData = uniqueSids.map(sid => ({ session_id: sid, created_at: new Date().toISOString(), device_info: { city: 'Desconhecido', os_name: 'Desconhecido', browser_name: 'N/A' } }));
    }

    const leads = finalSessionData.map(sess => {
      const sid = sess.session_id;
      const stats = sessionScores[sid] || { score: 0, events: 0, fakeRev: 0, lastActive: sess.created_at, productsViewed: new Set(), productsCarted: new Set(), eventTimeline: [] };
      const score = stats.score;
      let stage = 'Awareness';
      if (score > 50) { stage = 'Decision'; decision++; }
      else if (score > 20) { stage = 'Consideration'; consideration++; }
      else { awareness++; }

      const city = sess.device_info?.city || 'Desconhecido';
      const os = sess.device_info?.os_name || 'Desconhecido';
      const source = sess.device_info?.utm_source || sess.device_info?.referrer || 'Tráfego Direto/Orgânico';
      const isMobile = sess.device_info?.is_mobile ? '📱' : '💻';
      const email = sess.device_info?.email || '';
      const nickname = sess.device_info?.nickname || '';
      const sortedTimeline = [...stats.eventTimeline].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return {
        id: sid, deviceLocal: `${isMobile} ${os} - ${city}`, source, score, stage,
        events: stats.events, fakeRev: stats.fakeRev,
        lastActive: new Date(stats.lastActive).toLocaleString('pt-BR'),
        views: Array.from(stats.productsViewed), carts: Array.from(stats.productsCarted),
        timeline: sortedTimeline,
        email,
        nickname,
      };
    }).filter(lead => lead.events > 0);

    return { funnelStages: { awareness, consideration, decision }, topLeads: leads };
  }, []);

  // Recompute intent metrics when weights change
  useEffect(() => {
    if (rawSessions.length > 0 || rawEvents.length > 0) {
      const computed = recomputeIntentMetrics(rawSessions, rawEvents, productDict, scoreWeights);
      setIntentData(computed);
    }
  }, [rawSessions, rawEvents, productDict, scoreWeights, recomputeIntentMetrics]);

  // ── Fetch All Data ──
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const formatMap = (map: Record<string, number>) =>
        Object.keys(map).map(name => ({ name, value: map[name] })).sort((a, b) => b.value - a.value);

      // 1. Fetch Sessions
      const { data: sessionData, count: sessionCount } = await supabase
        .from('sessions').select('*', { count: 'exact' });

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
      const { data: events, error: eventsError } = await supabase
        .from('intent_events')
        .select('id, session_id, event_type, price_displayed, created_at, product_id, metadata');
      if (eventsError) throw eventsError;

      // 3. Fetch Product Dictionary
      const { data: allProducts } = await supabase.from('products').select('id, name, short_name');
      const pDict = (allProducts || []).reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});

      let viewCount = 0, cartCount = 0, checkoutCount = 0, fakeRev = 0;
      let totalDwellTime = 0, dwellEvents = 0, rageClicks = 0;
      const scrollMap: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };
      const timelineMap: Record<string, number> = {};
      const productInteractions: Record<string, { views: number; carts: number; rev: number }> = {};
      const searchMap: Record<string, number> = {};
      const abandonedList: any[] = [];
      const pairMap: Record<string, number> = {};

      events?.forEach((ev) => {
        const dateStr = new Date(ev.created_at).toLocaleDateString('pt-BR');
        timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;

        if (ev.event_type === 'view_item') viewCount++;
        if (ev.event_type === 'add_to_cart') cartCount++;
        if (ev.event_type === 'fake_checkout') { checkoutCount++; fakeRev += ev.price_displayed || 0; }

        if (ev.event_type === 'page_leave' && ev.metadata?.dwell_time_seconds) { totalDwellTime += ev.metadata.dwell_time_seconds; dwellEvents++; }
        if (ev.event_type === 'rage_click') rageClicks++;
        if (ev.event_type === 'scroll_depth' && ev.metadata?.depth_percentage) {
          const depth = `${ev.metadata.depth_percentage}%`;
          if (scrollMap[depth] !== undefined) scrollMap[depth]++;
        }

        if (ev.product_id && ['view_item', 'add_to_cart', 'fake_checkout'].includes(ev.event_type)) {
          if (!productInteractions[ev.product_id]) productInteractions[ev.product_id] = { views: 0, carts: 0, rev: 0 };
          if (ev.event_type === 'view_item') productInteractions[ev.product_id].views++;
          if (ev.event_type === 'add_to_cart') productInteractions[ev.product_id].carts++;
          if (ev.event_type === 'fake_checkout') productInteractions[ev.product_id].rev += ev.price_displayed || 0;
        }

        if (ev.event_type === 'search' && ev.metadata?.query) {
          const q = ev.metadata.query.toLowerCase().trim();
          if (q.length > 2) searchMap[q] = (searchMap[q] || 0) + 1;
        }

        if (ev.event_type === 'cart_abandoned' && ev.metadata?.items) {
          const sid = ev.session_id;
          const existingIdx = abandonedList.findIndex(a => a.sid === sid);
          const val = ev.price_displayed || 0;
          const cartItem = { id: ev.id, sid, date: new Date(ev.created_at).toLocaleString('pt-BR'), value: val, items: ev.metadata.items };
          if (existingIdx >= 0) abandonedList[existingIdx] = cartItem;
          else abandonedList.push(cartItem);
        }

        if (ev.event_type === 'checkout_basket' && ev.metadata?.items) {
          const items = ev.metadata.items as any[];
          if (items.length > 1) {
            for (let i = 0; i < items.length; i++) {
              for (let j = i + 1; j < items.length; j++) {
                const pair = [items[i].name || items[i].id, items[j].name || items[j].id].sort().join(' + ');
                pairMap[pair] = (pairMap[pair] || 0) + 1;
              }
            }
          }
        }
      });

      // Store raw data for intent recomputation
      let finalSessionData = safeSessionData;
      if (finalSessionData.length === 0 && events && events.length > 0) {
        const uniqueSids = Array.from(new Set(events.map(e => e.session_id).filter(Boolean)));
        finalSessionData = uniqueSids.map(sid => ({ session_id: sid, created_at: new Date().toISOString(), device_info: { city: 'Fantasma', os_name: 'Desconhecido', browser_name: 'N/A' } }));
      }
      setRawSessions(finalSessionData);
      setRawEvents(events || []);
      setProductDict(pDict);

      // KPIs
      const totalSess = finalSessionData.length > 0 ? finalSessionData.length : 1;
      const safeCartCount = cartCount || 1;
      setKpis({
        totalSessions: sessionCount || 0, totalCheckouts: checkoutCount,
        conversionRate: ((checkoutCount / totalSess) * 100) || 0,
        fakeRevenue: fakeRev, aov: checkoutCount > 0 ? fakeRev / checkoutCount : 0,
        cartAbandonment: ((cartCount - checkoutCount) / safeCartCount) * 100,
      });

      setFunnelData([
        { name: 'Sessões Iniciais', value: sessionCount || 0 },
        { name: 'Visualizações', value: viewCount },
        { name: 'Adições ao Carrinho', value: cartCount },
        { name: 'Checkouts Falsos', value: checkoutCount },
      ]);

      setTimelineData(Object.keys(timelineMap).map(date => ({ date, interacoes: timelineMap[date] })));
      setUxMetrics({ avgDwellTime: dwellEvents > 0 ? Math.floor(totalDwellTime / dwellEvents) : 0, rageClicksCount: rageClicks, scrollDepthMap: Object.keys(scrollMap).map(k => ({ name: k, value: scrollMap[k] })) });
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

      // GA4 Data
      try {
        const ga4Res = await fetch('/api/analytics/ga4');
        if (ga4Res.ok) {
          const ga4Json = await ga4Res.json();
          if (ga4Json.data) setGa4Data(ga4Json.data);
          else if (ga4Json.data === null) setGa4Data('empty');
        }
      } catch (err) { console.error('Failed to fetch GA4 data:', err); }

      // PostHog Data
      try {
        const phRes = await fetch('/api/analytics/posthog');
        if (phRes.ok) {
          const phJson = await phRes.json();
          if (phJson.data) { setPosthogData(phJson.data); setPosthogError(null); }
          else if (phJson.error) setPosthogError(phJson.error);
        }
      } catch (err) { console.error('Failed to fetch PostHog data:', err); }

      // HubSpot Data
      try {
        const hsRes = await fetch('/api/analytics/hubspot');
        if (hsRes.ok) {
          const hsJson = await hsRes.json();
          if (hsJson.data) { setHubspotCrmData(hsJson.data); setHubspotError(null); }
          else if (hsJson.error) setHubspotError(hsJson.error);
        }
      } catch (err) { console.error('Failed to fetch HubSpot CRM data:', err); }

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading, fetchDashboardData,
    // Supabase data
    kpis, funnelData, topProducts, timelineData, demographics, hardware, marketing, uxMetrics, ecommerceInsights,
    // Intent data
    intentData, scoreWeights, setScoreWeights,
    // External
    ga4Data, posthogData, posthogError, hubspotCrmData, hubspotError,
  };
}
