'use client';

import { AuditInsights } from '@/hooks/useInsightsData';
import { Search, ShieldAlert, Store, AlertTriangle, Bug, BarChart3, Activity } from 'lucide-react';

interface AuditIntelligenceTabProps {
  auditInsights: AuditInsights;
}

export default function AuditIntelligenceTab({ auditInsights }: AuditIntelligenceTabProps) {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-4 font-sans animate-fade-in py-2">

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Total Audits</span>
            <Search className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-white">{auditInsights.totalAudits.toLocaleString('en-US')}</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Avg Overprice</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-amber-400">{auditInsights.avgOverprice}%</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Flaws Detected</span>
            <Bug className="w-4 h-4 text-rose-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-rose-400">{auditInsights.totalFlawsDetected.toLocaleString('en-US')}</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Stores Tracked</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-blue-400">{auditInsights.storeBreakdown.length}</strong>
        </div>
      </div>

      {/* Top Audited Products */}
      <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-0 overflow-hidden">
        <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Top Audited Entities
          </h3>
        </div>
        
        {auditInsights.topAuditedProducts.length === 0 ? (
          <p className="text-[11px] font-mono text-[#52525b] py-8 text-center">No audit data available in this time range.</p>
        ) : (
          <div className="divide-y divide-[#2a2e37]">
            {auditInsights.topAuditedProducts.map((product, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-3 hover:bg-[#2a2e37]/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 mb-2 md:mb-0">
                  <span className="font-mono text-[10px] text-[#52525b] w-4">{i + 1}.</span>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-[#e4e4e7] block truncate">{product.query}</span>
                    <span className="font-mono text-[10px] text-[#71717a] uppercase">
                      VOL: {product.count} | STORES: {product.stores.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 font-mono text-[11px] uppercase ml-7 md:ml-0">
                  <div className="text-right">
                    <span className="text-[#71717a] block mb-0.5">Avg Price</span>
                    <span className="font-bold text-[#e4e4e7]">{formatBRL(product.avgPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#71717a] block mb-0.5">Overprice</span>
                    <span className={`font-bold ${product.avgOverprice > 30 ? 'text-rose-400' : product.avgOverprice > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      +{product.avgOverprice}%
                    </span>
                  </div>
                  <div className="text-right w-16">
                    <span className="text-[#71717a] block mb-0.5">Flaws</span>
                    <span className="font-bold text-rose-400">{product.totalFlaws}</span>
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
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Overprice Dist
            </h3>
          </div>
          <div className="p-4 space-y-4 font-mono text-[11px]">
            {auditInsights.overpriceDistribution.map((item, i) => {
              const total = auditInsights.totalAudits || 1;
              const pct = Math.round((item.count / total) * 100);
              const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 uppercase">
                    <span className="text-[#a1a1aa]">{item.range}</span>
                    <span className="font-bold text-[#e4e4e7]">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-[#111217] rounded-none overflow-hidden border border-[#2a2e37]">
                    <div className={`h-full ${colors[i] || 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Breakdown */}
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Store className="w-3.5 h-3.5" /> Top Stores
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {auditInsights.storeBreakdown.length === 0 ? (
              <p className="font-mono text-[11px] text-[#52525b] text-center py-4">No data</p>
            ) : (
              auditInsights.storeBreakdown.map((store, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-sm bg-[#111217] border border-[#2a2e37]">
                  <span className="font-mono text-[11px] font-bold text-[#e4e4e7] truncate uppercase">{store.name}</span>
                  <span className="font-mono text-[11px] font-bold text-blue-400 shrink-0 ml-2">{store.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verdict Breakdown */}
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Price Verdicts
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {auditInsights.verdictBreakdown.length === 0 ? (
              <p className="font-mono text-[11px] text-[#52525b] text-center py-4">No data</p>
            ) : (
              auditInsights.verdictBreakdown.map((v, i) => {
                const emoji = v.verdict === 'fair' ? '✅' : v.verdict === 'overpriced' ? '🔴' : v.verdict === 'good_deal' ? '🟢' : '⚪';
                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-sm bg-[#111217] border border-[#2a2e37]">
                    <span className="font-mono text-[11px] font-bold text-[#e4e4e7] truncate uppercase">{emoji} {v.verdict}</span>
                    <span className="font-mono text-[11px] font-bold text-[#a1a1aa] shrink-0 ml-2">{v.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      {auditInsights.auditTimeline.length > 0 && (
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col mt-4">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Audit Volumetry
            </h3>
          </div>
          <div className="p-4 flex items-end gap-1 h-28">
            {auditInsights.auditTimeline.map((point, i) => {
              const max = Math.max(...auditInsights.auditTimeline.map(p => p.count), 1);
              const height = Math.round((point.count / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <span className="font-mono text-[9px] text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{point.count}</span>
                  <div
                    className="w-full bg-blue-500/80 rounded-t-sm transition-all hover:bg-blue-400 cursor-pointer"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${point.date}: ${point.count} audits`}
                  />
                  <span className="font-mono text-[8px] text-[#52525b] truncate w-full text-center mt-1 group-hover:text-[#a1a1aa] transition-colors">{point.date.split('/').slice(0, 2).join('/')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
