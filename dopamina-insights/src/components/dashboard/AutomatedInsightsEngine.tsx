'use client';

import React, { useMemo } from 'react';

interface AutomatedInsightsEngineProps {
  events: any[];
  sessions: any[];
  topProducts: any[];
  kpis: {
    totalSessions: number;
    identifiedLeads: number;
    identificationRate: number;
    highIntentLeads: number;
    frictionIndex: number;
  };
}

interface InsightItem {
  id: string;
  type: 'alert' | 'trend' | 'opportunity' | 'success';
  title: string;
  description: string;
  metric?: string;
  icon: string;
}

export default function AutomatedInsightsEngine({
  events,
  sessions,
  topProducts,
  kpis,
}: AutomatedInsightsEngineProps) {
  const generatedInsights = useMemo<InsightItem[]>(() => {
    const items: InsightItem[] = [];

    if (!events || events.length === 0) return items;

    // 1. Audit Overprice Alert
    const searches = events.filter(e => e.event_type === 'super_search');
    const overpricedSearches = searches.filter(e => (e.metadata?.overprice_percentage || 0) > 20);
    if (overpricedSearches.length > 0) {
      const avgOverprice = Math.round(
        overpricedSearches.reduce((acc, e) => acc + (e.metadata?.overprice_percentage || 0), 0) / overpricedSearches.length
      );
      items.push({
        id: 'overprice-alert',
        type: 'alert',
        icon: '⚠️',
        title: 'Anomalia de Sobrepreço no Mercado',
        description: `Detectadas ${overpricedSearches.length} auditorias com sobrepreço médio de ${avgOverprice}% acima do preço justo recomendado pela IA.`,
        metric: `${overpricedSearches.length} alertas`,
      });
    }

    // 2. Hidden Flaws Scan Insight
    const flawEvents = searches.filter(e => (e.metadata?.flaws_count || 0) > 0);
    if (flawEvents.length > 0) {
      const totalFlaws = flawEvents.reduce((acc, e) => acc + (e.metadata?.flaws_count || 0), 0);
      items.push({
        id: 'flaws-insight',
        type: 'opportunity',
        icon: '🛡️',
        title: 'Defeitos Ocultos Mapeados',
        description: `Varreduras no Reddit e redes identificaram ${totalFlaws} relatos de defeitos e insatisfação nos produtos auditados pelos usuários.`,
        metric: `${totalFlaws} defeitos`,
      });
    }

    // 3. Peak Audit Activity Time Analysis
    const hourCounts: Record<number, number> = {};
    events.forEach(e => {
      if (e.created_at) {
        const hour = new Date(e.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    if (peakHour) {
      const h = Number(peakHour[0]);
      const hourFormatted = `${h}h00 - ${h + 1}h00`;
      items.push({
        id: 'peak-hour-insight',
        type: 'trend',
        icon: '📊',
        title: 'Horário de Pico de Auditoria',
        description: `O maior volume de auditorias de produtos e preços ocorre entre ${hourFormatted}.`,
        metric: `Pico às ${h}h`,
      });
    }

    // 4. Most Audited Product Insight
    if (topProducts && topProducts.length > 0) {
      const top = topProducts[0];
      items.push({
        id: 'top-product-insight',
        type: 'success',
        icon: '🔥',
        title: 'Produto Mais Auditado Hoje',
        description: `O produto "${top.name || top.short_name || top.query || 'Produto Destaque'}" lidera em interesse de verificação de preço justo.`,
        metric: `Líder em Auditorias`,
      });
    }

    // 5. Friction & Rage Clicks Analysis
    const rageClicks = events.filter(e => e.event_type === 'rage_click');
    if (rageClicks.length > 0) {
      const rageByTag: Record<string, number> = {};
      rageClicks.forEach(e => {
        const tag = e.metadata?.tag || e.metadata?.className || 'Elemento desconhecido';
        rageByTag[tag] = (rageByTag[tag] || 0) + 1;
      });
      const topRage = Object.entries(rageByTag).sort((a, b) => b[1] - a[1])[0];
      items.push({
        id: 'rage-click-alert',
        type: 'alert',
        icon: '⚡',
        title: 'Ponto de Fricção na Busca',
        description: `Detectados ${rageClicks.length} rage clicks durante a auditoria. Elemento em foco: "${topRage ? topRage[0] : 'botões de ação'}".`,
        metric: `${rageClicks.length} eventos`,
      });
    }

    return items;
  }, [events, sessions, topProducts, kpis]);

  if (generatedInsights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="text-base font-black text-foreground">Diagnóstico de Inteligência de Mercado (H53)</h3>
        </div>
        <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
          {generatedInsights.length} insights de auditoria
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {generatedInsights.map((insight) => {
          const typeStyles = {
            alert: 'border-red-500/30 bg-red-500/5 text-red-400',
            opportunity: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
            trend: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
            success: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
          }[insight.type];

          return (
            <div
              key={insight.id}
              className={`rounded-xl border p-4 transition duration-300 hover:scale-[1.01] ${typeStyles}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{insight.icon}</span>
                  <h4 className="text-sm font-bold text-zinc-100">{insight.title}</h4>
                </div>
                {insight.metric && (
                  <span className="text-[10px] font-black uppercase tracking-wider rounded-md bg-surface-light px-2 py-1 border border-border">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {insight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
