'use client';

import { AuditInsights } from '@/hooks/useInsightsData';
import { Search, ShieldAlert, Store, AlertTriangle, Bug, BarChart3 } from 'lucide-react';

interface AuditIntelligenceTabProps {
  auditInsights: AuditInsights;
}

export default function AuditIntelligenceTab({ auditInsights }: AuditIntelligenceTabProps) {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Total de Auditorias</span>
          </div>
          <strong className="text-2xl font-bold text-foreground">{auditInsights.totalAudits.toLocaleString('pt-BR')}</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Sobrepreço Médio</span>
          </div>
          <strong className="text-2xl font-bold text-amber-500">{auditInsights.avgOverprice}%</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Defeitos Detectados</span>
          </div>
          <strong className="text-2xl font-bold text-rose-500">{auditInsights.totalFlawsDetected.toLocaleString('pt-BR')}</strong>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Lojas Rastreadas</span>
          </div>
          <strong className="text-2xl font-bold text-blue-500">{auditInsights.storeBreakdown.length}</strong>
        </div>
      </div>

      {/* Top Audited Products */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Produtos Mais Auditados
        </h3>
        {auditInsights.topAuditedProducts.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">Nenhuma auditoria registrada ainda. Realize buscas no Dopamina Brasil para gerar dados.</p>
        ) : (
          <div className="space-y-2">
            {auditInsights.topAuditedProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-muted w-6 text-right shrink-0">{i + 1}.</span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground block truncate">{product.query}</span>
                    <span className="text-[10px] text-muted">
                      {product.count}x auditado · {product.stores.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-muted block">Preço Médio</span>
                    <span className="text-sm font-semibold text-foreground">{formatBRL(product.avgPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted block">Sobrepreço</span>
                    <span className={`text-sm font-bold ${product.avgOverprice > 30 ? 'text-rose-500' : product.avgOverprice > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {product.avgOverprice}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted block">Defeitos</span>
                    <span className="text-sm font-semibold text-rose-400">{product.totalFlaws}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Row: Overprice Distribution + Store Breakdown + Verdicts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Overprice Distribution */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Distribuição de Sobrepreço
          </h3>
          <div className="space-y-3">
            {auditInsights.overpriceDistribution.map((item, i) => {
              const total = auditInsights.totalAudits || 1;
              const pct = Math.round((item.count / total) * 100);
              const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{item.range}</span>
                    <span className="font-semibold text-foreground">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i] || 'bg-primary'} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Breakdown */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-500" />
            Auditorias por Loja
          </h3>
          <div className="space-y-2">
            {auditInsights.storeBreakdown.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Sem dados</p>
            ) : (
              auditInsights.storeBreakdown.map((store, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50">
                  <span className="text-xs font-medium text-foreground truncate">{store.name}</span>
                  <span className="text-xs font-bold text-primary shrink-0 ml-2">{store.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verdict Breakdown */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            Veredictos de Preço
          </h3>
          <div className="space-y-2">
            {auditInsights.verdictBreakdown.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Sem dados</p>
            ) : (
              auditInsights.verdictBreakdown.map((v, i) => {
                const emoji = v.verdict === 'fair' ? '✅' : v.verdict === 'overpriced' ? '🔴' : v.verdict === 'good_deal' ? '🟢' : '⚪';
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50">
                    <span className="text-xs font-medium text-foreground">{emoji} {v.verdict}</span>
                    <span className="text-xs font-bold text-muted">{v.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      {auditInsights.auditTimeline.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">📈 Timeline de Auditorias</h3>
          <div className="flex items-end gap-1 h-24">
            {auditInsights.auditTimeline.map((point, i) => {
              const max = Math.max(...auditInsights.auditTimeline.map(p => p.count), 1);
              const height = Math.round((point.count / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted">{point.count}</span>
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${point.date}: ${point.count} auditorias`}
                  />
                  <span className="text-[8px] text-muted truncate w-full text-center">{point.date.split('/').slice(0, 2).join('/')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
