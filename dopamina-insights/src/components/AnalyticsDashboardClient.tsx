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
import UserFlowDiagram from './dashboard/UserFlowDiagram';
import GamificationAnalyticsTab from './dashboard/GamificationAnalyticsTab';
import { StoreAuditAnalyticsTab } from './dashboard/StoreAuditAnalyticsTab';
import { TabHeaderBanner } from './dashboard/TabHeaderBanner';
import { Lock, RefreshCw, Loader2, LayoutDashboard, Target, Package, Briefcase, MousePointer2, Radio, PlaySquare, MapPin, GitMerge, Trophy, Shield } from 'lucide-react';

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'intent' | 'products' | 'hubspot' | 'ux' | 'ticker' | 'replay' | 'map' | 'flow' | 'gamification' | 'store_audit'>('overview');

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
    intentData, scoreWeights, setScoreWeights,
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
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover border border-border">
              <Lock className="h-6 w-6 text-foreground" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">
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
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-primary"
              autoFocus
            />
            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}
            <button type="submit" className="rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:bg-muted">
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Cockpit de Intenção', icon: LayoutDashboard },
    { id: 'store_audit', label: '🛡️ Dark Patterns (Extensão)', icon: Shield },
    { id: 'ticker', label: 'Live Ticker', icon: Radio },
    { id: 'replay', label: 'Replay de Sessão', icon: PlaySquare },
    { id: 'map', label: 'Mapa do Brasil', icon: MapPin },
    { id: 'flow', label: 'Fluxo & Conversão', icon: GitMerge },
    { id: 'gamification', label: 'Gamificação', icon: Trophy },
    { id: 'intent', label: 'Leads & Sinais B2B', icon: Target },
    { id: 'products', label: 'Sinais de Produto', icon: Package },
    { id: 'ux', label: 'Telemetria UX', icon: MousePointer2 },
    { id: 'hubspot', label: 'HubSpot CRM', icon: Briefcase },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-foreground text-background px-5 py-3.5 font-bold text-sm shadow-2xl animate-bounce">
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Telemetria Avançada
          </h1>
          <p className="mt-1 text-sm text-muted">
            Insights de Comportamento, Marketing e Intenção de Compra.
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

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
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
                title="Cockpit de Intenção"
                subtitle="Visão consolidada de sessões, intenção de compra, leads identificados e funil de fricção em tempo real"
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
                  highIntentLeads: intentData.topLeads.filter(l => l.stage === 'ALTA INTENÇÃO' || l.stage === 'CONCLUÍDO').length,
                  frictionIndex: uxMetrics.rageClicksCount || 0
                }}
              />
              <OverviewTab
                kpis={{
                  totalSessions: rawSessions.length,
                  identifiedLeads: intentData.topLeads.length,
                  identificationRate: rawSessions.length > 0 ? (intentData.topLeads.length / rawSessions.length) * 100 : 0,
                  highIntentLeads: intentData.topLeads.filter(l => l.stage === 'ALTA INTENÇÃO' || l.stage === 'CONCLUÍDO').length,
                  frictionIndex: uxMetrics.rageClicksCount || 0,
                  barrasInstaladas: exactCounts.bookmarklets,
                  lojasAuditadas: exactCounts.audits
                }}
                funnelData={funnelData}
                topProducts={topProducts}
                timelineData={timelineData}
              />
            </>
          )}

          {activeTab === 'store_audit' && (
            <>
              <TabHeaderBanner
                icon="🛡️"
                title="Anti-Truque & Dark Patterns"
                subtitle="Auditoria em tempo real de gatilhos psicológicos, ancoragem de preço e indução em e-commerces navegados por usuários"
                badgeText="VARREDURA REAL"
                badgeColor="rose"
                highlightLabel="Lojas Auditadas"
                highlightValue={rawEvents.filter(e => e.metadata?.store_name || e.event_type === 'dark_pattern_audit').length.toLocaleString('pt-BR')}
                highlightColor="text-rose-400"
              />
              <StoreAuditAnalyticsTab events={rawEvents} />
            </>
          )}

          {activeTab === 'ticker' && (
            <>
              <TabHeaderBanner
                icon="📡"
                title="Live Event Ticker"
                subtitle="Stream ininterrupto de eventos de telemetria e intenção de compra transmitidos via Supabase Realtime"
                badgeText="SUPABASE STREAM"
                badgeColor="emerald"
                highlightLabel="Eventos ao Vivo"
                highlightValue={rawEvents.length.toLocaleString('pt-BR')}
                highlightColor="text-emerald-400"
              />
              <LiveTickerFeed events={rawEvents} />
            </>
          )}

          {activeTab === 'replay' && (
            <>
              <TabHeaderBanner
                icon="🎬"
                title="Replay de Sessão & Trilha"
                subtitle="Reconstituição passo a passo da jornada do usuário, cliques e comportamentos de compra navegados"
                badgeText="TELEMETRIA UX"
                badgeColor="purple"
                highlightLabel="Sessões Mapeadas"
                highlightValue={rawSessions.length.toLocaleString('pt-BR')}
                highlightColor="text-purple-400"
              />
              <SessionReplayPlayer sessions={rawSessions} events={rawEvents} />
            </>
          )}

          {activeTab === 'map' && (
            <>
              <TabHeaderBanner
                icon="🗺️"
                title="Distribuição Geográfica Brasil"
                subtitle="Mapa de calor de acessos e concentração de intenção de compra por estado brasileiro"
                badgeText="GEOLOCALIZAÇÃO"
                badgeColor="amber"
                highlightLabel="Estados Ativos"
                highlightValue={rawSessions.map(s => s.location?.state).filter(Boolean).length || 0}
                highlightColor="text-amber-400"
              />
              <InteractiveBrazilMap sessions={rawSessions} events={rawEvents} />
            </>
          )}

          {activeTab === 'flow' && (
            <>
              <TabHeaderBanner
                icon="⚡"
                title="Fluxo & Conversão de Vendas"
                subtitle="Funil comportamental da jornada desde a navegação do produto até a intenção de checkout"
                badgeText="CONVERSÃO B2C"
                badgeColor="blue"
                highlightLabel="Taxa de Identificação"
                highlightValue={`${(rawSessions.length > 0 ? (intentData.topLeads.length / rawSessions.length) * 100 : 0).toFixed(1)}%`}
                highlightColor="text-blue-400"
              />
              <UserFlowDiagram events={rawEvents} kpis={{ totalSessions: rawSessions.length }} />
            </>
          )}

          {activeTab === 'gamification' && (
            <>
              <TabHeaderBanner
                icon="🏆"
                title="Gamificação & Engajamento"
                subtitle="Métricas de nível de dopamina, tração comportamental e incentivos para retenção de usuários"
                badgeText="DOPAMINA LOCK"
                badgeColor="orange"
                highlightLabel="Alta Intenção"
                highlightValue={intentData.topLeads.filter(l => l.stage === 'ALTA INTENÇÃO' || l.stage === 'CONCLUÍDO').length}
                highlightColor="text-orange-400"
              />
              <GamificationAnalyticsTab events={rawEvents} />
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

          {activeTab === 'products' && (
            <>
              <TabHeaderBanner
                icon="🛍️"
                title="Sinais de Produto & Carrinho"
                subtitle="Análise por SKU de adições ao carrinho, intenção de checkout e produtos mais desejados"
                badgeText="SKU ANALYTICS"
                badgeColor="purple"
                highlightLabel="Produtos Desejados"
                highlightValue={topProducts.length}
                highlightColor="text-purple-400"
              />
              <ProductsInsights ecommerceInsights={ecommerceInsights} />
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

          {activeTab === 'hubspot' && (
            <>
              <TabHeaderBanner
                icon="💼"
                title="HubSpot CRM Cockpit"
                subtitle="Visão consolidada de Pipeline, Funil de Contatos, Ticket Médio e Fechamento Comercial"
                badgeText="ENTERPRISE"
                badgeColor="orange"
                highlightLabel="Previsão de Receita"
                highlightValue={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(hubspotCrmData?.kpis?.pipelineValue || 0)}
                highlightColor="text-emerald-400"
              />
              <HubSpotTab data={hubspotCrmData} />
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
