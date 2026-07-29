'use client';

import { AuditInsights } from '@/hooks/useInsightsData';
import { Search, Link2, Type, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SearchAnalyticsTabProps {
  auditInsights: AuditInsights;
  rawEvents: any[];
}

export default function SearchAnalyticsTab({ auditInsights, rawEvents }: SearchAnalyticsTabProps) {
  // Extract search-specific metrics from raw events
  const searchEvents = rawEvents.filter(e => e.event_type === 'super_search');
  
  // Queries by frequency
  const queryMap: Record<string, number> = {};
  searchEvents.forEach(e => {
    const q = (e.metadata?.query || '').trim();
    if (q) queryMap[q] = (queryMap[q] || 0) + 1;
  });
  const topQueries = Object.entries(queryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Search by hour heatmap
  const hourMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = 0;
  searchEvents.forEach(e => {
    const hour = new Date(e.created_at).getHours();
    hourMap[hour]++;
  });
  const maxHourCount = Math.max(...Object.values(hourMap), 1);

  // URL vs Text breakdown
  const urlCount = auditInsights.searchTypeBreakdown.find(s => s.type === 'url')?.count || 0;
  const textCount = auditInsights.searchTypeBreakdown.find(s => s.type === 'text')?.count || 0;
  const total = urlCount + textCount || 1;

  // Success rate (has price > 0 means success)
  const successCount = searchEvents.filter(e => (e.price_displayed || e.metadata?.current_price) > 0).length;
  const failCount = searchEvents.length - successCount;
  const successRate = searchEvents.length > 0 ? Math.round((successCount / searchEvents.length) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* Search KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Total de Buscas</span>
          </div>
          <strong className="text-2xl font-bold text-foreground">{searchEvents.length}</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Queries Únicas</span>
          </div>
          <strong className="text-2xl font-bold text-purple-500">{topQueries.length}</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Taxa de Sucesso</span>
          </div>
          <strong className="text-2xl font-bold text-emerald-500">{successRate}%</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Buscas por URL</span>
          </div>
          <strong className="text-2xl font-bold text-cyan-500">{Math.round((urlCount / total) * 100)}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top Queries */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Top Queries do Motor H53
          </h3>
          {topQueries.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">Nenhuma busca registrada ainda.</p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {topQueries.map(([query, count], i) => {
                const maxCount = topQueries[0]?.[1] || 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={i} className="relative p-2.5 rounded-lg bg-background border border-border/50 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground truncate max-w-[70%]">{query}</span>
                      <span className="text-xs font-bold text-primary shrink-0 ml-2">{count}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Search by Hour Heatmap */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Buscas por Hora do Dia
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {Object.entries(hourMap).map(([hour, count]) => {
              const intensity = count / maxHourCount;
              const bg = intensity === 0
                ? 'bg-background'
                : intensity < 0.25
                  ? 'bg-primary/20'
                  : intensity < 0.5
                    ? 'bg-primary/40'
                    : intensity < 0.75
                      ? 'bg-primary/60'
                      : 'bg-primary/90';
              return (
                <div
                  key={hour}
                  className={`${bg} rounded-lg p-2 text-center border border-border/30 transition hover:scale-105`}
                  title={`${hour}:00 — ${count} buscas`}
                >
                  <span className="text-[9px] text-muted block">{String(hour).padStart(2, '0')}h</span>
                  <span className="text-xs font-bold text-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exact Search Log */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Buscas Exatas por Horário (Log de Eventos)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-lighter text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Data / Hora</th>
                <th className="px-4 py-3 font-semibold">Termo Buscado / URL</th>
                <th className="px-4 py-3 font-semibold">Preço Retornado</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Sucesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {searchEvents
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50)
                .map((e, i) => {
                const date = new Date(e.created_at);
                const query = e.metadata?.query || '-';
                const price = e.price_displayed || e.metadata?.current_price || 0;
                const isSuccess = price > 0;
                
                return (
                  <tr key={i} className="hover:bg-surface-hover transition">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                      {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate" title={query}>
                      {query}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {price > 0 ? `R$ ${price.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {isSuccess ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> Sim
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-500 text-xs font-bold">
                          <XCircle className="w-3 h-3" /> Não
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {searchEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">Nenhuma busca registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* URL vs Text + Success vs Fail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">🔗 URL vs Texto Livre</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted flex items-center gap-1"><Link2 className="w-3 h-3" /> URL Direto</span>
                <span className="font-bold text-foreground">{urlCount}</span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.round((urlCount / total) * 100)}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted flex items-center gap-1"><Type className="w-3 h-3" /> Texto Livre</span>
                <span className="font-bold text-foreground">{textCount}</span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.round((textCount / total) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">✅ Taxa de Sucesso das Buscas</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Preço Encontrado</span>
                <span className="font-bold text-emerald-500">{successCount}</span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${successRate}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-500" /> Falha na Busca</span>
                <span className="font-bold text-rose-500">{failCount}</span>
              </div>
              <div className="h-3 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${searchEvents.length > 0 ? Math.round((failCount / searchEvents.length) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
