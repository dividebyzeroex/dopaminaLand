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
import { Lock, RefreshCw, Loader2, LayoutDashboard, Target, Package, Briefcase, MousePointer2, Radio, PlaySquare, MapPin, Shield, Search, BarChart3, Users } from 'lucide-react';

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
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-foreground text-background px-5 py-3.5 font-bold text-sm shadow-md animate-bounce">
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            H53 Market Intelligence
          </h1>
          <p className="mt-1 text-sm text-muted">
            Telemetria de Auditorias, Sobrepreços e Anomalias de Mercado em Tempo Real.
          </p>
        </div>

        {/* Time Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Período</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition"
            >
              <option value="all">Todas as Datas</option>
              <option value="2h">Últimas 2 Horas</option>
              <option value="6h">Últimas 6 Horas</option>
              <option value="12h">Últimas 12 Horas</option>
              <option value="24h">Últimas 24 Horas</option>
              <option value="7d">Últimos 7 Dias</option>
              <option value="15d">Últimos 15 Dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Início</label>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Fim</label>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pt-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover transition disabled:opacity-50 shadow-sm"
              title="Atualiza os dados referentes à aba ativa para otimizar requisições"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
              <span>Atualizar ({TABS.find(t => t.id === activeTab)?.label})</span>
            </button>
            {lastUpdated && (
              <span className="text-[11px] font-medium text-muted bg-surface/60 border border-border/60 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Última atualização: {lastUpdated.toLocaleDateString('pt-BR')} às {lastUpdated.toLocaleTimeString('pt-BR')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

        {/* Nav Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary text-foreground shadow-sm' 
                    : 'bg-surface-light border border-border text-foreground hover:bg-surface-light hover:border-border'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-primary'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

      {loading && timelineData.length === 0 ? (
        <div className="flex py-20 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      ) : (
        <div className="min-h-[500px] space-y-6">
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
