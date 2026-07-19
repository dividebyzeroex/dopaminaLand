'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInsightsData } from '@/hooks/useInsightsData';
import HubSpotTab from '@/components/insights/HubSpotTab';
import OverviewTab from './dashboard/OverviewTab';
import IntentRadar from './dashboard/IntentRadar';
import ProductsInsights from './dashboard/ProductsInsights';
import SessionDrawer from './dashboard/SessionDrawer';
import { Lock, RefreshCw, Loader2, LayoutDashboard, Target, Package, Briefcase, MousePointer2 } from 'lucide-react';

export default function AnalyticsDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'intent' | 'products' | 'hubspot' | 'ux'>('overview');

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
    loading, fetchDashboardData,
    kpis, funnelData, topProducts, timelineData, ecommerceInsights,
    intentData, scoreWeights, setScoreWeights,
    hubspotCrmData,
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
        body: JSON.stringify({ lead }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'success' }));
        setSuccessToast("Sincronizado com o HubSpot com sucesso! 🚀");
      } else {
        setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'idle' }));
        alert(`Falha ao sincronizar com HubSpot: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      setCrmIntegrationStatus(prev => ({ ...prev, [key]: 'idle' }));
      alert("Erro de rede ao conectar com o serviço do HubSpot.");
    }

    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dopamina') {
      setIsAuthenticated(true);
      const { startDate, endDate } = getTimeFilterDates(timeRange, customStart, customEnd);
      fetchDashboardData(startDate, endDate);
    } else {
      setError('Senha incorreta. Dica: dopamina');
    }
  };

  useEffect(() => {
    if (isAuthenticated && timeRange !== 'custom') {
      const { startDate, endDate } = getTimeFilterDates(timeRange);
      fetchDashboardData(startDate, endDate);
    }
  }, [timeRange, isAuthenticated, fetchDashboardData, getTimeFilterDates]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-lighter">
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
    { id: 'intent', label: 'Leads & Sinais B2B', icon: Target },
    { id: 'products', label: 'Sinais de Produto', icon: Package },
    { id: 'hubspot', label: 'HubSpot CRM', icon: Briefcase },
    { id: 'ux', label: 'Telemetria UX', icon: MousePointer2 },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      {successToast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg animate-slide-up">
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
              <div className="flex flex-col justify-end pt-5">
                <button
                  onClick={() => {
                    const { startDate, endDate } = getTimeFilterDates('custom', customStart, customEnd);
                    fetchDashboardData(startDate, endDate);
                  }}
                  disabled={!customStart || !customEnd}
                  className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition hover:bg-muted disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>
            </>
          )}

          <div className="flex flex-col justify-end pt-5">
            <button
              onClick={() => {
                const { startDate, endDate } = getTimeFilterDates(timeRange, customStart, customEnd);
                fetchDashboardData(startDate, endDate);
              }}
              className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-sm font-medium text-foreground border border-border transition hover:bg-surface-lighter"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
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
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <OverviewTab kpis={kpis} funnelData={funnelData} topProducts={topProducts} timelineData={timelineData} />
          )}

          {activeTab === 'intent' && (
            <IntentRadar 
              intentData={intentData} 
              scoreWeights={scoreWeights} 
              setScoreWeights={setScoreWeights} 
              setSelectedLead={setSelectedLead} 
            />
          )}

          {activeTab === 'products' && (
            <ProductsInsights ecommerceInsights={ecommerceInsights} />
          )}

          {activeTab === 'hubspot' && (
            <HubSpotTab data={hubspotCrmData} />
          )}

          {activeTab === 'ux' && (
            <div className="p-12 text-center text-muted">
              Módulo de Telemetria UX em desenvolvimento.
            </div>
          )}
        </div>
      )}

      <SessionDrawer 
        selectedLead={selectedLead} 
        setSelectedLead={setSelectedLead} 
        handleCrmSync={handleCrmSync}
        crmIntegrationStatus={crmIntegrationStatus}
      />
    </div>
  );
}
