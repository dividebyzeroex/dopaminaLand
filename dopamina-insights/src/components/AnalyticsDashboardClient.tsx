'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInsightsData } from '@/hooks/useInsightsData';
import HubSpotTab from '@/components/insights/HubSpotTab';
import OverviewTab from './dashboard/OverviewTab';
import IntentRadar from './dashboard/IntentRadar';
import ProductsInsights from './dashboard/ProductsInsights';
import SessionDrawer from './dashboard/SessionDrawer';
import UxTelemetryTab from './dashboard/UxTelemetryTab';
import AutomatedInsightsEngine from './dashboard/AutomatedInsightsEngine';
import LiveTickerFeed from './dashboard/LiveTickerFeed';
import SessionReplayPlayer from './dashboard/SessionReplayPlayer';
import InteractiveBrazilMap from './dashboard/InteractiveBrazilMap';
import AuditIntelligenceTab from './dashboard/AuditIntelligenceTab';
import SearchAnalyticsTab from './dashboard/SearchAnalyticsTab';
import { VisitorExplorerTab } from './dashboard/VisitorExplorerTab';
import { StoreAuditAnalyticsTab } from './dashboard/StoreAuditAnalyticsTab';
import { TabHeaderBanner } from './dashboard/TabHeaderBanner';
import LeadsTab from './dashboard/LeadsTab';
import { Lock, RefreshCw, Loader2, LayoutDashboard, Target, Package, Briefcase, MousePointer2, Radio, PlaySquare, MapPin, Shield, Search, BarChart3, Users, Activity } from 'lucide-react';

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'audit_intelligence' | 'search_analytics' | 'leads' | 'intent' | 'ux' | 'visitors'>('overview');

  // Time selector state
  const [timeRange, setTimeRange] = useState<string>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Intent UI state
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [crmIntegrationStatus, setCrmIntegrationStatus] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});

  const getTimeFilterDates = useCallback((range: string, start?: string, end?: string) => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (range) {
      case '2h':
        startDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case '6h':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case '12h':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case '15d':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
        endDate = now.toISOString();
        break;
      case 'custom':
        if (start) startDate = new Date(start).toISOString();
        if (end) endDate = new Date(end).toISOString();
        break;
      default:
        break;
    }
    return { startDate, endDate };
  }, []);

  const {
    loading, lastUpdated, fetchDashboardData,
    kpis, funnelData, topProducts, timelineData, ecommerceInsights, uxMetrics,
    intentData, scoreWeights, setScoreWeights, auditInsights,
    hubspotCrmData, rawSessions, rawEvents, exactCounts,
  } = useInsightsData();

  const handleCrmSync = async (leadId: string, type: 'hubspot' | 'salesforce' | 'slack') => {
    const key = `${leadId}-${type}`;
    
    if (type !== 'hubspot') {
      setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'loading' }));
      setTimeout(() => {
        setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'success' }));
        setSuccessToast(`Lead sincronizado com o ${type.toUpperCase()}! 🚀`);
        setTimeout(() => setSuccessToast(null), 3000);
      }, 1200);
      return;
    }

    const lead = intentData.topLeads.find(l => l.id === leadId);
    if (!lead) return;

    setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'loading' }));

    try {
      const response = await fetch('/api/crm/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lead.email || `${lead.id}@anonymous.dopamina`,
          nickname: lead.nickname || lead.deviceLocal,
          score: lead.score,
          stage: lead.stage,
          fakeRev: lead.fakeRev,
          viewsCount: lead.views?.length || 0,
          cartsCount: lead.carts?.length || 0,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'success' }));
        setSuccessToast(`Lead ${lead.nickname || lead.id} enviado para o HubSpot CRM! 🎉`);
      } else {
        setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'idle' }));
        setSuccessToast(`Erro na integração com HubSpot: ${data.message || 'Verifique as credenciais.'}`);
      }
    } catch (err: any) {
      setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'idle' }));
      setSuccessToast(`Falha de conexão com a API de CRM.`);
    }

    setTimeout(() => setSuccessToast(null), 4000);
  };

  useEffect(() => {
    const auth = localStorage.getItem('insights_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dopamina2026' || password === 'admin' || password === 'dopamina') {
      setIsAuthenticated(true);
      localStorage.setItem('insights_auth', 'true');
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const handleRefresh = () => {
    const { startDate, endDate } = getTimeFilterDates(timeRange, customStart, customEnd);
    fetchDashboardData(startDate, endDate, false, activeTab);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const { startDate, endDate } = getTimeFilterDates(timeRange, customStart, customEnd);
      fetchDashboardData(startDate, endDate, false, activeTab);
    }
  }, [isAuthenticated, timeRange, customStart, customEnd, activeTab, fetchDashboardData, getTimeFilterDates]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-light p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-light border border-border">
              <Lock className="h-6 w-6 text-foreground" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Acesso Restrito
            </h1>
            <p className="text-sm text-muted mt-1">Dashboard de Insights Avançados v4</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-surface-light px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-surface-light"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-foreground transition hover:bg-primary-hover">
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: '🚀 Cockpit de Auditoria', icon: LayoutDashboard },
    { id: 'audit_intelligence', label: '📊 Audit Intelligence', icon: BarChart3 },
    { id: 'search_analytics', label: '🔍 Search Analytics', icon: Search },
    { id: 'leads', label: '📧 Base de Leads', icon: Users },
    { id: 'visitors', label: '🕵️‍♂️ Explorador de Visitantes', icon: Users },
    { id: 'intent', label: '🎯 Perfis de Auditor', icon: Target },
    { id: 'ux', label: '🧪 Telemetria UX', icon: MousePointer2 },
  ];

  return (
    <div className="bg-[#0b0f19] text-[#e4e4e7] min-h-screen font-sans">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-sm bg-emerald-500 text-white px-4 py-3 font-mono text-[11px] uppercase font-bold shadow-md animate-bounce border border-emerald-400">
          {successToast}
        </div>
      )}

      {/* APM Header (TopNav) */}
      <div className="bg-[#181b1f] border-b border-[#2a2e37] px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded border border-[#2a2e37] bg-[#111217] text-blue-500">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              H53 Market Intelligence
            </h1>
            <p className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest mt-0.5">
              TELEMETRIA • AUDITORIAS • MERCADO
            </p>
          </div>
        </div>

        {/* Time Selector */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-[#71717a] uppercase">Time</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-sm border border-[#2a2e37] bg-[#111217] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="all">ALL TIME</option>
              <option value="2h">LAST 2 HOURS</option>
              <option value="6h">LAST 6 HOURS</option>
              <option value="12h">LAST 12 HOURS</option>
              <option value="24h">LAST 24 HOURS</option>
              <option value="7d">LAST 7 DAYS</option>
              <option value="15d">LAST 15 DAYS</option>
              <option value="custom">CUSTOM</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-[#71717a] uppercase">From</label>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="rounded-sm border border-[#2a2e37] bg-[#111217] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-[#71717a] uppercase">To</label>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="rounded-sm border border-[#2a2e37] bg-[#111217] px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 border-l border-[#2a2e37] pl-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-sm border border-[#2a2e37] bg-[#181b1f] px-3 py-1 text-[11px] font-bold text-[#e4e4e7] hover:bg-[#2a2e37] hover:text-white transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>SYNC</span>
            </button>
            {lastUpdated && (
              <span className="text-[10px] text-[#71717a] flex items-center gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{lastUpdated.toLocaleTimeString('pt-BR')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 mt-6">
        {/* Nav Tabs - IDE Style */}
        <div className="flex flex-wrap gap-1 border-b border-[#2a2e37] overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-[11px] font-mono font-bold transition-colors border-b-2
                  ${isActive 
                    ? 'border-blue-500 text-white bg-[#181b1f]' 
                    : 'border-transparent text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#181b1f]'
                  }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-500' : 'text-[#71717a]'}`} />
                {tab.label.toUpperCase()}
              </button>
            );
          })}
        </div>

      {loading && timelineData.length === 0 ? (
        <div className="flex py-20 justify-center h-[500px] items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="min-h-[500px] py-6">
          {activeTab === 'overview' && (
            <>
              <TabHeaderBanner
                icon="🚀"
                title="Cockpit de Auditoria"
                subtitle="Visão consolidada de sessões, auditorias executadas, sobrepreço médio e comportamento de busca em tempo real"
                badgeText="REALTIME"
                badgeColor="cyan"
                highlightLabel="Sessões Gravadas"
                highlightValue={rawSessions.length.toLocaleString('pt-BR')}
                highlightColor="text-cyan-400"
              />
              <AutomatedInsightsEngine
                events={rawEvents}
                sessions={rawSessions}
                topProducts={topProducts}
                kpis={{
                  totalSessions: rawSessions.length,
                  identifiedLeads: intentData.topLeads.length,
                  identificationRate: rawSessions.length > 0 ? Math.round((intentData.topLeads.length / rawSessions.length) * 100) : 0,
                  highIntentLeads: intentData.topLeads.filter(l => l.stage === 'AUDITOR POWER' || l.stage === 'AUDITOR ATIVO').length,
                  frictionIndex: uxMetrics.rageClicksCount || 0
                }}
              />
              <OverviewTab
                kpis={{
                  totalSessions: rawSessions.length,
                  identifiedLeads: intentData.topLeads.length,
                  identificationRate: rawSessions.length > 0 ? (intentData.topLeads.length / rawSessions.length) * 100 : 0,
                  highIntentLeads: intentData.topLeads.filter(l => l.stage === 'AUDITOR POWER' || l.stage === 'AUDITOR ATIVO').length,
                  frictionIndex: uxMetrics.rageClicksCount || 0,
                  barrasInstaladas: exactCounts.bookmarklets,
                  lojasAuditadas: exactCounts.audits
                }}
                funnelData={funnelData}
                topProducts={topProducts}
                timelineData={timelineData}
                rawEvents={rawEvents}
                rawSessions={rawSessions}
              />
            </>
          )}

          {activeTab === 'audit_intelligence' && (
            <>
              <TabHeaderBanner
                icon="📊"
                title="Audit Intelligence"
                subtitle="Métricas de auditorias executadas, sobrepreço médio detectado, lojas auditadas e defeitos encontrados"
                badgeText="H53 AUDITOR"
                badgeColor="cyan"
                highlightLabel="Total Auditorias"
                highlightValue={auditInsights.totalAudits.toLocaleString('pt-BR')}
                highlightColor="text-cyan-400"
              />
              <AuditIntelligenceTab auditInsights={auditInsights} />
            </>
          )}

          {activeTab === 'search_analytics' && (
            <>
              <TabHeaderBanner
                icon="🔍"
                title="Search Analytics"
                subtitle="Análise das buscas realizadas no motor H53, termos em alta, buscas por hora e taxa de sucesso"
                badgeText="MOTOR H53"
                badgeColor="purple"
                highlightLabel="Queries Únicas"
                highlightValue={auditInsights.topAuditedProducts.length.toLocaleString('pt-BR')}
                highlightColor="text-purple-400"
              />
              <SearchAnalyticsTab auditInsights={auditInsights} rawEvents={rawEvents} />
            </>
          )}

          {activeTab === 'leads' && <LeadsTab />}

          {activeTab === 'visitors' && (
            <>
              <TabHeaderBanner
                icon="🕵️‍♂️"
                title="Explorador de Visitantes & Leads"
                subtitle="Mergulho profundo em sessões individuais cruzando Telemetria, HubSpot CRM e GA4"
                badgeText="REVOPS & PRODUCT"
                badgeColor="cyan"
                highlightLabel="Visitantes Únicos (Sessões)"
                highlightValue={rawSessions.length.toLocaleString('pt-BR')}
                highlightColor="text-cyan-400"
              />
              <VisitorExplorerTab sessions={rawSessions} events={rawEvents} />
            </>
          )}

          {activeTab === 'intent' && (
            <>
              <TabHeaderBanner
                icon="💼"
                title="Leads & Sinais de Compra B2B"
                subtitle="Identificação inteligente de visitantes com alta propensão de conversão comercial"
                badgeText="HIGH INTENT"
                badgeColor="emerald"
                highlightLabel="Leads Mapeados"
                highlightValue={intentData.topLeads.length}
                highlightColor="text-emerald-400"
              />
              <IntentRadar 
                intentData={intentData} 
                scoreWeights={scoreWeights} 
                setScoreWeights={setScoreWeights} 
                setSelectedLead={setSelectedLead} 
              />
            </>
          )}



          {activeTab === 'ux' && (
            <>
              <TabHeaderBanner
                icon="🧪"
                title="Telemetria UX & Fricção"
                subtitle="Mapeamento de Rage Clicks, cliques mortos, erros de JavaScript e Core Web Vitals"
                badgeText="FRICÇÃO CORE"
                badgeColor="rose"
                highlightLabel="Rage Clicks"
                highlightValue={uxMetrics.rageClicksCount || 0}
                highlightColor="text-rose-400"
              />
              <UxTelemetryTab uxMetrics={uxMetrics} />
            </>
          )}


        </div>
      )}

      </div>

      {/* Drawer */}
      {selectedLead && (
        <SessionDrawer 
          selectedLead={selectedLead} 
          setSelectedLead={setSelectedLead} 
          handleCrmSync={handleCrmSync} 
          crmIntegrationStatus={crmIntegrationStatus} 
        />
      )}
    </div>
  );
}
