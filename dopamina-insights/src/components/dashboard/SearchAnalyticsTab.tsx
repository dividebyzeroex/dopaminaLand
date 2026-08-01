'use client';

import { AuditInsights } from '@/hooks/useInsightsData';
import { Search, Link2, Type, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';

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
    <div className="space-y-4 font-sans animate-fade-in py-2">

      {/* Search KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Total Searches</span>
            <Search className="w-4 h-4 text-blue-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-white">{searchEvents.length}</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Unique Queries</span>
            <Type className="w-4 h-4 text-purple-400" />
          </div>
          <strong className="text-2xl font-mono font-bold text-purple-400">{topQueries.length}</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-emerald-400">{successRate}%</strong>
        </div>
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-wider">URL Based</span>
            <Link2 className="w-4 h-4 text-cyan-500" />
          </div>
          <strong className="text-2xl font-mono font-bold text-cyan-400">{Math.round((urlCount / total) * 100)}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top Queries */}
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-0 flex flex-col h-[400px]">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Top Engine Queries
            </h3>
          </div>
          {topQueries.length === 0 ? (
            <p className="font-mono text-[11px] text-[#52525b] py-8 text-center">No queries logged.</p>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {topQueries.map(([query, count], i) => {
                const maxCount = topQueries[0]?.[1] || 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={i} className="relative p-2 rounded-sm bg-[#111217] border border-[#2a2e37] overflow-hidden group hover:border-[#3f3f46]">
                    <div className="absolute inset-y-0 left-0 bg-blue-500/10 border-r border-blue-500/30" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between px-1">
                      <span className="font-mono text-[11px] font-bold text-[#e4e4e7] truncate max-w-[70%]">{query}</span>
                      <span className="font-mono text-[11px] font-bold text-blue-400 shrink-0 ml-2">{count}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Search by Hour Heatmap */}
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-0 flex flex-col h-[400px]">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Request Heatmap (24h)
            </h3>
          </div>
          <div className="p-4 grid grid-cols-6 gap-2">
            {Object.entries(hourMap).map(([hour, count]) => {
              const intensity = count / maxHourCount;
              const bg = intensity === 0
                ? 'bg-[#111217] border-[#2a2e37]'
                : intensity < 0.25
                  ? 'bg-blue-900/30 border-blue-900/50 text-blue-400'
                  : intensity < 0.5
                    ? 'bg-blue-800/40 border-blue-800/60 text-blue-300'
                    : intensity < 0.75
                      ? 'bg-blue-600/50 border-blue-600/70 text-blue-200'
                      : 'bg-blue-500/60 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]';
              
              return (
                <div
                  key={hour}
                  className={`${bg} rounded-sm p-2 text-center border transition-all cursor-crosshair`}
                  title={`${hour}:00 — ${count} requests`}
                >
                  <span className="font-mono text-[9px] block text-[#71717a] mb-0.5">{String(hour).padStart(2, '0')}h</span>
                  <span className="font-mono text-[11px] font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* URL vs Text + Success vs Fail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" /> Input Method
            </h3>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1.5">
                <span className="text-[#a1a1aa]">Direct URL</span>
                <span className="font-bold text-[#e4e4e7]">{urlCount}</span>
              </div>
              <div className="h-1.5 bg-[#111217] rounded-none overflow-hidden border border-[#2a2e37]">
                <div className="h-full bg-cyan-500" style={{ width: `${Math.round((urlCount / total) * 100)}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1.5">
                <span className="text-[#a1a1aa]">Free Text</span>
                <span className="font-bold text-[#e4e4e7]">{textCount}</span>
              </div>
              <div className="h-1.5 bg-[#111217] rounded-none overflow-hidden border border-[#2a2e37]">
                <div className="h-full bg-purple-500" style={{ width: `${Math.round((textCount / total) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] flex flex-col">
          <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#111217]">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> Resolution Rate
            </h3>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1.5">
                <span className="text-[#a1a1aa]">Resolved</span>
                <span className="font-bold text-emerald-400">{successCount}</span>
              </div>
              <div className="h-1.5 bg-[#111217] rounded-none overflow-hidden border border-[#2a2e37]">
                <div className="h-full bg-emerald-500" style={{ width: `${successRate}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] uppercase mb-1.5">
                <span className="text-[#a1a1aa]">Failed</span>
                <span className="font-bold text-rose-400">{failCount}</span>
              </div>
              <div className="h-1.5 bg-[#111217] rounded-none overflow-hidden border border-[#2a2e37]">
                <div className="h-full bg-rose-500" style={{ width: `${searchEvents.length > 0 ? Math.round((failCount / searchEvents.length) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exact Search Log */}
      <div className="rounded-sm border border-[#2a2e37] bg-[#111217] p-0 overflow-hidden flex flex-col">
        <div className="border-b border-[#2a2e37] px-4 py-3 bg-[#181b1f]">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Search Stream Log
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#181b1f] text-[#71717a] border-b border-[#2a2e37]">
              <tr>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Query / Target</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Response</th>
                <th className="px-4 py-2 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
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
                  <tr key={i} className="hover:bg-[#181b1f] transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-[#71717a]">
                      {date.toISOString().split('T')[1].substring(0, 12)}
                    </td>
                    <td className="px-4 py-2 text-[#e4e4e7] max-w-[200px] truncate" title={query}>
                      {query}
                    </td>
                    <td className="px-4 py-2">
                      {price > 0 ? `R$ ${price.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {isSuccess ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          [OK]
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          [FAIL]
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {searchEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#52525b]">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
