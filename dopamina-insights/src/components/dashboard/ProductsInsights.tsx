'use client';

import { Search, ShieldAlert, AlertTriangle, Bug, TrendingDown, Store } from 'lucide-react';

interface ProductAuditSignalsProps {
  auditInsights: any;
  rawEvents: any[];
}

export default function ProductAuditSignals({ auditInsights, rawEvents }: ProductAuditSignalsProps) {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const topAudited = auditInsights?.topAuditedProducts || [];

  // Filter searches with overprice anomalies
  const anomalyAudits = rawEvents
    .filter(e => e.event_type === 'super_search' && (e.metadata?.overprice_percentage || 0) > 15)
    .slice(0, 15);

  return (
    <div className="animate-fade-in space-y-6">

      {/* Top Audited Items Table */}
      <div className="rounded-xl border border-border bg-surface-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Search className="h-4 w-4 text-cyan-400" /> Sinais de Auditoria de Produtos (Motor H53)
          </h3>
          <span className="text-xs font-mono text-muted">{topAudited.length} produtos mapeados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Produto / Query</th>
                <th className="py-3 px-6 font-medium text-center text-xs">Auditorias</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Preço Médio</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Sobrepreço Médio</th>
                <th className="py-3 px-6 font-medium text-center text-xs">Defeitos Mapeados</th>
                <th className="py-3 px-6 font-medium text-xs">Lojas Detectadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topAudited.map((p: any, i: number) => (
                <tr key={i} className="transition hover:bg-surface">
                  <td className="py-3 px-6 font-medium text-foreground max-w-[280px] truncate" title={p.query}>
                    {p.query}
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-cyan-400">{p.count}x</td>
                  <td className="py-3 px-6 text-right font-semibold text-foreground">{formatBRL(p.avgPrice)}</td>
                  <td className="py-3 px-6 text-right">
                    <span className={`font-bold ${p.avgOverprice > 30 ? 'text-rose-500' : p.avgOverprice > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      +{p.avgOverprice}%
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                      <Bug className="w-3 h-3" /> {p.totalFlaws}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-xs text-muted">
                    {p.stores.join(', ') || 'N/A'}
                  </td>
                </tr>
              ))}
              {topAudited.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">Nenhuma auditoria registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overprice Anomaly Stream */}
      <div className="rounded-xl border border-rose-500/20 bg-surface-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-rose-500/5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-400">
            <ShieldAlert className="h-4 w-4" /> Anomalias de Sobrepreço Detectadas pelo Oracle H53
          </h3>
          <span className="text-xs font-mono text-rose-400/80">&gt;15% sobrepreço</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Data / Hora</th>
                <th className="py-3 px-6 font-medium text-xs">Produto Auditado</th>
                <th className="py-3 px-6 font-medium text-xs">Loja</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Preço Praticado</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Sobrepreço %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {anomalyAudits.map((audit: any, i: number) => {
                const dateStr = new Date(audit.created_at).toLocaleString('pt-BR');
                const overprice = audit.metadata?.overprice_percentage || 0;
                return (
                  <tr key={i} className="transition hover:bg-surface">
                    <td className="py-3 px-6 text-xs text-muted font-mono">{dateStr}</td>
                    <td className="py-3 px-6 font-medium text-foreground">{audit.metadata?.query || 'Produto'}</td>
                    <td className="py-3 px-6 text-xs text-muted flex items-center gap-1">
                      <Store className="w-3 h-3 text-blue-400" /> {audit.metadata?.store_detected || 'Desconhecido'}
                    </td>
                    <td className="py-3 px-6 text-right font-semibold text-foreground">{formatBRL(audit.price_displayed || audit.metadata?.current_price || 0)}</td>
                    <td className="py-3 px-6 text-right font-bold text-rose-500">
                      +{overprice}%
                    </td>
                  </tr>
                );
              })}
              {anomalyAudits.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">Nenhuma anomalia grave detectada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
