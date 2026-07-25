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

    // 1. Friction & Rage Clicks Analysis
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
        title: 'Ponto de Estresse Identificado',
        description: `Detectados ${rageClicks.length} rage clicks. O principal elemento gerador de fricção é: "${topRage ? topRage[0] : 'botões de ação'}".`,
        metric: `${rageClicks.length} eventos`,
      });
    }

    // 2. High Intent vs Conversion Gap
    const checkouts = events.filter(e => e.event_type === 'fake_checkout' || e.event_type === 'checkout_basket');
    const cartAdds = events.filter(e => e.event_type === 'add_to_cart');
    
    if (cartAdds.length > 0) {
      const abandonRate = Math.round(((cartAdds.length - checkouts.length) / cartAdds.length) * 100);
      if (abandonRate > 40) {
        items.push({
          id: 'cart-abandon-insight',
          type: 'opportunity',
          icon: '🛒',
          title: 'Abandono de Carrinho Elevado',
          description: `${abandonRate}% das adições ao carrinho não prosseguiram para o checkout fictício. Gatilhos de urgência ou escassez podem aumentar a conversão.`,
          metric: `${abandonRate}% taxa de queda`,
        });
      }
    }

    // 3. Peak Shopping Time Analysis
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
        icon: '🌙',
        title: 'Horário de Maior Estimulação',
        description: `O pico de engajamento ocorre entre ${hourFormatted}. O cérebro dos usuários busca dopamina predominantemente neste horário.`,
        metric: `Pico às ${h}h`,
      });
    }

    // 4. Top Desired Product
    if (topProducts && topProducts.length > 0) {
      const top = topProducts[0];
      items.push({
        id: 'top-product-insight',
        type: 'success',
        icon: '🔥',
        title: 'Imã de Dopamina Principal',
        description: `O produto "${top.name || top.short_name || 'Produto Destaque'}" lidera em interesse, gerando maior retenção de atenção e intenção.`,
        metric: `${top.rev ? `R$ ${top.rev.toLocaleString('pt-BR')}` : 'Líder em desejos'}`,
      });
    }

    // 5. Digital DNA & Hardware Insight
    const dnaScans = events.filter(e => e.event_type === 'digital_dna_scan');
    if (dnaScans.length > 0) {
      items.push({
        id: 'dna-scan-insight',
        type: 'trend',
        icon: '🧬',
        title: 'Telemetria de Arquétipos Digitais',
        description: `${dnaScans.length} escaneamentos de DNA Digital realizados. Maioria dos setups revela usuários com múltiplos núcleos e preferências por Dark Mode.`,
        metric: `${dnaScans.length} exames`,
      });
    }

    return items;
  }, [events, sessions, topProducts, kpis]);

  if (generatedInsights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neon/20 bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="text-base font-black text-foreground">Diagnóstico de Telemetria Comportamental</h3>
        </div>
        <span className="text-xs font-bold text-neon bg-neon/10 border border-neon/20 rounded-full px-3 py-1">
          {generatedInsights.length} insights gerados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {generatedInsights.map((insight) => {
          const typeStyles = {
            alert: 'border-red-500/30 bg-red-500/5 text-red-400',
            opportunity: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
            trend: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
            success: 'border-neon/30 bg-neon/5 text-neon',
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
                  <span className="text-[10px] font-black uppercase tracking-wider rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                {insight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
