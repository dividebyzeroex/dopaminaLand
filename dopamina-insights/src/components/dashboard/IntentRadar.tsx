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
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Funnel Stages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Auditor Power', stageKey: 'AUDITOR POWER', color: 'text-emerald-400', border: 'border-t-emerald-500', desc: '5+ auditorias' },
          { label: 'Auditor Ativo', stageKey: 'AUDITOR ATIVO', color: 'text-cyan-400', border: 'border-t-cyan-500', desc: '2-4 auditorias' },
          { label: 'Explorador', stageKey: 'EXPLORADOR', color: 'text-amber-400', border: 'border-t-amber-500', desc: '1 auditoria / Score > 35' },
          { label: 'Visitante', stageKey: 'VISITANTE', color: 'text-muted', border: 'border-t-zinc-600', desc: 'Apenas navegou' }
        ].map((item, idx) => {
          const stageObj = stageCounts.find((s: any) => s.stage === item.stageKey);
          const val = stageObj ? stageObj.count : 0;
          return (
            <div key={idx} className={`rounded-xl border border-border bg-surface-light p-5 shadow-sm border-t-2 ${item.border}`}>
              <h3 className="text-xs font-semibold text-muted">{item.label}</h3>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${item.color}`}>{val}</p>
              <p className="text-[10px] text-muted mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Algorithm Settings */}
      <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Algoritmo de Score de Auditoria</h2>
          </div>
          <button onClick={() => setShowWeightSettings(!showWeightSettings)} className="rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-lighter transition">
            {showWeightSettings ? 'Recolher' : 'Ajustar Pesos'}
          </button>
        </div>
        
        {showWeightSettings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border animate-fade-in">
            {Object.entries(scoreWeights || {}).map(([key, val]: any) => {
              const labels: Record<string, string> = { superSearch: 'Busca / Auditoria Realizada', viewItem: 'Visualização de Item', addToCart: 'Adição ao Carrinho', checkoutBasket: 'Checkout (Simulado)', rageClick: 'Rage Clicks (Penalidade)', dwell60s: 'Permanência > 60s', triggersExposed: 'Dark Pattern Encontrado' };
              const isNeg = key === 'rageClick';
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted">{labels[key] || key}</span>
                    <span className={isNeg ? 'text-rose-500' : 'text-cyan-400'}>{val} pts</span>
                  </div>
                  <input type="range" min={isNeg ? -30 : 0} max={key === 'superSearch' ? 100 : 50} step={1} value={val} onChange={(e) => setScoreWeights({ ...scoreWeights, [key]: parseInt(e.target.value) })} className={`w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer ${isNeg ? 'accent-rose-500' : 'accent-cyan-400'}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">Ajuste os pesos das ações para calibrar a pontuação de engajamento dos auditores.</p>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-xl border border-border bg-surface-light p-4 shadow-sm">
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted" />
          <input type="text" placeholder="Buscar por sessão, local..." value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full rounded-md border border-border bg-surface pl-9 pr-4 py-2 text-sm font-medium text-foreground outline-none focus:border-cyan-500 transition" />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
            <select value={leadStageFilter} onChange={(e: any) => setLeadStageFilter(e.target.value)} className="rounded-md border border-border bg-surface pl-9 pr-8 py-2 text-sm font-medium text-foreground outline-none focus:border-cyan-500 cursor-pointer appearance-none">
              <option value="all">Todos os Perfis</option>
              <option value="AUDITOR POWER">Auditor Power</option>
              <option value="AUDITOR ATIVO">Auditor Ativo</option>
              <option value="EXPLORADOR">Explorador</option>
              <option value="VISITANTE">Visitante</option>
            </select>
          </div>
          <select value={leadSortBy} onChange={(e: any) => setLeadSortBy(e.target.value)} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground outline-none focus:border-cyan-500 cursor-pointer">
            <option value="score">Ordenar por Score</option>
            <option value="events">Ordenar por Auditorias</option>
          </select>
          <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-md bg-surface px-4 py-2 text-sm font-medium text-foreground border border-border hover:bg-surface-lighter transition">
            <FileDown className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-border bg-surface-light shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-foreground">Radar de Perfis de Auditor</h2>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ao Vivo
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Sessão / Dispositivo</th>
                <th className="py-3 px-6 font-medium text-xs">Perfil</th>
                <th className="py-3 px-6 font-medium text-xs">Score</th>
                <th className="py-3 px-6 font-medium text-xs">Auditorias</th>
                <th className="py-3 px-6 font-medium text-xs">Sobrepreço Médio</th>
                <th className="py-3 px-6 font-medium text-xs">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-surface transition cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{lead.nickname || lead.deviceLocal}</div>
                    <div className="text-[10px] font-mono text-muted">{lead.id.slice(0, 18)}...</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      lead.stage === 'AUDITOR POWER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      lead.stage === 'AUDITOR ATIVO' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                      lead.stage === 'EXPLORADOR' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-cyan-400">{lead.score} pts</td>
                  <td className="py-4 px-6 font-medium text-foreground">{lead.totalAudits || lead.audits?.length || 0}x</td>
                  <td className="py-4 px-6 font-bold text-amber-500">{lead.avgOverprice || 0}%</td>
                  <td className="py-4 px-6">
                    <button className="text-xs font-semibold text-cyan-400 hover:underline">
                      Ver Trilha
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted text-sm">Nenhum auditor encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
