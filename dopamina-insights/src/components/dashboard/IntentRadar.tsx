import { useState } from 'react';
import { Target, Search, Filter, Settings, FileDown } from 'lucide-react';
import Papa from 'papaparse';

export default function IntentRadar({
  intentData,
  scoreWeights,
  setScoreWeights,
  setSelectedLead
}: {
  intentData: any;
  scoreWeights: any;
  setScoreWeights: any;
  setSelectedLead: (lead: any) => void;
}) {
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState<string>('all');
  const [leadSortBy, setLeadSortBy] = useState<'score' | 'events' | 'fakeRev'>('score');

  const topLeads = intentData?.topLeads || [];

  const filteredLeads = topLeads
    .filter((lead: any) => {
      const query = leadSearchQuery.toLowerCase().trim();
      const local = lead.deviceLocal || '';
      const id = lead.id || '';
      const matchesSearch = !query || local.toLowerCase().includes(query) || id.toLowerCase().includes(query);
      const matchesStage = leadStageFilter === 'all' || lead.stage === leadStageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a: any, b: any) => {
      if (leadSortBy === 'score') return b.score - a.score;
      if (leadSortBy === 'events') return (b.events?.length || 0) - (a.events?.length || 0);
      return b.fakeRev - a.fakeRev;
    });

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredLeads.map((l: any) => ({
      ID: l.id,
      Nickname: l.nickname || 'Anônimo',
      Email: l.email || '',
      Dispositivo: l.deviceLocal,
      Estagio: l.stage,
      Score: l.score,
      TotalAuditorias: l.totalAudits || 0,
      SobreprecoMedio: l.avgOverprice || 0,
      Ultima_Atividade: l.lastActive
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'auditores_intent.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stageCounts = intentData?.leadsByStage || [];

  return (
    <div className="animate-fade-in space-y-4 pb-12 font-sans py-2">
      {/* Funnel Stages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Auditor Power', stageKey: 'AUDITOR POWER', color: 'text-emerald-400', border: 'border-t-emerald-500', desc: '5+ auditorias' },
          { label: 'Auditor Ativo', stageKey: 'AUDITOR ATIVO', color: 'text-blue-400', border: 'border-t-blue-500', desc: '2-4 auditorias' },
          { label: 'Explorador', stageKey: 'EXPLORADOR', color: 'text-amber-400', border: 'border-t-amber-500', desc: '1 auditoria / Score > 35' },
          { label: 'Visitante', stageKey: 'VISITANTE', color: 'text-[#71717a]', border: 'border-t-[#2a2e37]', desc: 'Apenas navegou' }
        ].map((item, idx) => {
          const stageObj = stageCounts.find((s: any) => s.stage === item.stageKey);
          const val = stageObj ? stageObj.count : 0;
          return (
            <div key={idx} className={`rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none border-t-[3px] ${item.border}`}>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa]">{item.label}</h3>
              <p className={`mt-2 text-2xl font-mono font-bold tracking-tight ${item.color}`}>{val}</p>
              <p className="font-mono text-[9px] text-[#52525b] uppercase mt-1 tracking-wider">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Algorithm Settings */}
      <div className="rounded-sm border border-[#2a2e37] bg-[#181b1f] p-4 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-[#71717a]" />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#e4e4e7]">Audit Score Algorithm</h2>
          </div>
          <button onClick={() => setShowWeightSettings(!showWeightSettings)} className="rounded-sm bg-[#111217] border border-[#2a2e37] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#e4e4e7] hover:bg-[#2a2e37] hover:text-white transition-colors">
            {showWeightSettings ? 'Collapse' : 'Tune Weights'}
          </button>
        </div>
        
        {showWeightSettings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#2a2e37] animate-fade-in">
            {Object.entries(scoreWeights || {}).map(([key, val]: any) => {
              const labels: Record<string, string> = { superSearch: 'Search Executed', viewItem: 'Item Viewed', addToCart: 'Added to Cart', checkoutBasket: 'Checkout Simulated', rageClick: 'Rage Clicks (Penalty)', dwell60s: 'Dwell Time > 60s', triggersExposed: 'Dark Pattern Found' };
              const isNeg = key === 'rageClick';
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-[#a1a1aa]">{labels[key] || key}</span>
                    <span className={isNeg ? 'text-rose-400' : 'text-blue-400'}>{val} pts</span>
                  </div>
                  <input type="range" min={isNeg ? -30 : 0} max={key === 'superSearch' ? 100 : 50} step={1} value={val} onChange={(e) => setScoreWeights({ ...scoreWeights, [key]: parseInt(e.target.value) })} className={`w-full h-1 bg-[#111217] rounded-lg appearance-none cursor-pointer ${isNeg ? 'accent-rose-500' : 'accent-blue-500'}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-[10px] text-[#52525b] uppercase tracking-wider">Adjust event weights to calibrate the engagement scoring.</p>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-sm border border-[#2a2e37] bg-[#181b1f] p-3 shadow-none">
        <div className="relative w-full md:w-80 flex items-center group">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[#71717a] group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Search trace, device..." value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full rounded-sm border border-[#2a2e37] bg-[#111217] pl-9 pr-4 py-1.5 font-mono text-[11px] text-[#e4e4e7] placeholder:text-[#52525b] outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-3.5 w-3.5 text-[#71717a] pointer-events-none" />
            <select value={leadStageFilter} onChange={(e: any) => setLeadStageFilter(e.target.value)} className="rounded-sm border border-[#2a2e37] bg-[#111217] pl-9 pr-8 py-1.5 font-mono text-[11px] font-bold text-[#e4e4e7] uppercase tracking-wider outline-none focus:border-blue-500 cursor-pointer appearance-none hover:bg-[#2a2e37] transition-colors">
              <option value="all">All Stages</option>
              <option value="AUDITOR POWER">Auditor Power</option>
              <option value="AUDITOR ATIVO">Auditor Ativo</option>
              <option value="EXPLORADOR">Explorador</option>
              <option value="VISITANTE">Visitante</option>
            </select>
          </div>
          <select value={leadSortBy} onChange={(e: any) => setLeadSortBy(e.target.value)} className="rounded-sm border border-[#2a2e37] bg-[#111217] px-4 py-1.5 font-mono text-[11px] font-bold text-[#e4e4e7] uppercase tracking-wider outline-none focus:border-blue-500 cursor-pointer hover:bg-[#2a2e37] transition-colors">
            <option value="score">Sort by Score</option>
            <option value="events">Sort by Audits</option>
          </select>
          <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-sm bg-[#111217] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#e4e4e7] border border-[#2a2e37] hover:bg-[#2a2e37] hover:text-white transition-colors">
            <FileDown className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-sm border border-[#2a2e37] bg-[#111217] shadow-none overflow-hidden min-h-[400px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e37] bg-[#181b1f]">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa]">Audit Profiles Radar</h2>
          </div>
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/20 border border-emerald-900/50 px-2 py-0.5 rounded-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#181b1f] text-[#71717a]">
              <tr className="border-b border-[#2a2e37]">
                <th className="py-2 px-4 font-bold uppercase tracking-wider">Session / Device</th>
                <th className="py-2 px-4 font-bold uppercase tracking-wider">Profile Stage</th>
                <th className="py-2 px-4 font-bold uppercase tracking-wider">Score</th>
                <th className="py-2 px-4 font-bold uppercase tracking-wider">Audits</th>
                <th className="py-2 px-4 font-bold uppercase tracking-wider">Avg Overprice</th>
                <th className="py-2 px-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-[#181b1f] transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#e4e4e7]">{lead.nickname || lead.deviceLocal}</div>
                    <div className="text-[9px] text-[#52525b] uppercase mt-0.5">{lead.id.slice(0, 18)}...</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${
                      lead.stage === 'AUDITOR POWER' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' :
                      lead.stage === 'AUDITOR ATIVO' ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' :
                      lead.stage === 'EXPLORADOR' ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' :
                      'bg-[#111217] text-[#71717a] border-[#2a2e37]'
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-400">{lead.score} pts</td>
                  <td className="py-3 px-4 font-bold text-[#e4e4e7]">{lead.totalAudits || lead.audits?.length || 0}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{lead.avgOverprice || 0}%</td>
                  <td className="py-3 px-4 text-right">
                    <button className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-white transition-colors">
                      View Trace
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#52525b] uppercase tracking-wider text-[11px]">No profiles found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
