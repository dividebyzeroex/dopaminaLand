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
  const [leadStageFilter, setLeadStageFilter] = useState<'all' | 'Awareness' | 'Consideration' | 'Decision'>('all');
  const [leadSortBy, setLeadSortBy] = useState<'score' | 'events' | 'fakeRev'>('score');

  const filteredLeads = intentData.topLeads
    .filter((lead: any) => {
      const query = leadSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || lead.deviceLocal.toLowerCase().includes(query) || lead.source.toLowerCase().includes(query) || lead.id.toLowerCase().includes(query);
      const matchesStage = leadStageFilter === 'all' || lead.stage === leadStageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a: any, b: any) => {
      if (leadSortBy === 'score') return b.score - a.score;
      if (leadSortBy === 'events') return b.events - a.events;
      return b.fakeRev - a.fakeRev;
    });

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredLeads.map((l: any) => ({
      ID: l.id,
      Nickname: l.nickname || 'Anônimo',
      Email: l.email || '',
      Dispositivo: l.deviceLocal,
      Origem: l.source,
      Estagio: l.stage,
      Score: l.score,
      Eventos: l.events,
      Receita_Potencial: l.fakeRev,
      Ultima_Atividade: l.lastActive
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leads_intent.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Funnel Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Awareness (Frio)', value: intentData.funnelStages.awareness, color: 'text-blue-500', border: 'border-t-blue-500', desc: 'Score < 20' },
          { label: 'Consideration (Morno)', value: intentData.funnelStages.consideration, color: 'text-amber-500', border: 'border-t-amber-500', desc: 'Score 20-50' },
          { label: 'Decision (Quente)', value: intentData.funnelStages.decision, color: 'text-rose-500', border: 'border-t-rose-500', desc: 'Score > 50' }
        ].map((stage, idx) => (
          <div key={idx} className={`rounded-xl border border-border bg-surface-light p-6 shadow-sm border-t-2 ${stage.border}`}>
            <h3 className="text-xs font-semibold text-muted">{stage.label}</h3>
            <p className={`mt-2 text-3xl font-semibold tracking-tight ${stage.color}`}>{stage.value}</p>
            <p className="text-xs text-muted mt-1">{stage.desc}</p>
          </div>
        ))}
      </div>

      {/* Algorithm Settings */}
      <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Algoritmo de Intent Score</h2>
          </div>
          <button onClick={() => setShowWeightSettings(!showWeightSettings)} className="rounded-md bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-lighter transition">
            {showWeightSettings ? 'Recolher' : 'Ajustar Pesos'}
          </button>
        </div>
        
        {showWeightSettings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border animate-fade-in">
            {Object.entries(scoreWeights).map(([key, val]: any) => {
              const labels: Record<string, string> = { view_item: 'Visualização de Item', add_to_cart: 'Adição ao Carrinho', fake_checkout: 'Checkout (Simulado)', rage_click: 'Rage Clicks', share_product: 'Compartilhar', dwell_time_exceeded: 'Dwell Time', search: 'Busca Realizada', cart_abandoned: 'Carrinho Abandonado (Penalidade)' };
              const isNeg = key === 'cart_abandoned';
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted">{labels[key] || key}</span>
                    <span className={isNeg ? 'text-rose-500' : 'text-primary'}>{val} pts</span>
                  </div>
                  <input type="range" min={isNeg ? -30 : 0} max={isNeg ? 0 : key === 'fake_checkout' ? 100 : 50} step={1} value={val} onChange={(e) => setScoreWeights({ ...scoreWeights, [key]: parseInt(e.target.value) })} className={`w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer ${isNeg ? 'accent-rose-500' : 'accent-primary'}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted">Ajuste os pesos dos eventos para calibrar a qualificação dos leads no funil.</p>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-xl border border-border bg-surface-light p-4 shadow-sm">
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted" />
          <input type="text" placeholder="Buscar por sessão, origem..." value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full rounded-md border border-border bg-surface pl-9 pr-4 py-2 text-sm font-medium text-foreground outline-none focus:border-primary transition" />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-muted pointer-events-none" />
            <select value={leadStageFilter} onChange={(e: any) => setLeadStageFilter(e.target.value)} className="rounded-md border border-border bg-surface pl-9 pr-8 py-2 text-sm font-medium text-foreground outline-none focus:border-primary cursor-pointer appearance-none">
              <option value="all">Todos os Estágios</option>
              <option value="Decision">Decision (Quente)</option>
              <option value="Consideration">Consideration (Morno)</option>
              <option value="Awareness">Awareness (Frio)</option>
            </select>
          </div>
          <select value={leadSortBy} onChange={(e: any) => setLeadSortBy(e.target.value)} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground outline-none focus:border-primary cursor-pointer">
            <option value="score">Ordenar por Score</option>
            <option value="events">Ordenar por Ações</option>
            <option value="fakeRev">Ordenar por Receita</option>
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
            <Target className="h-5 w-5 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Radar de Intenção (Top Leads)</h2>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Sessão / Dispositivo</th>
                <th className="py-3 px-6 font-medium text-xs">Origem / Canal</th>
                <th className="py-3 px-6 font-medium text-xs">Estágio & Score</th>
                <th className="py-3 px-6 font-medium text-xs">Interesses</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Receita Potencial</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id} className="transition hover:bg-surface">
                  <td className="py-3 px-6 text-foreground">
                    {lead.nickname || lead.email ? (
                      <div>
                        <div className="text-sm font-medium text-primary">{lead.nickname || 'Anônimo'}</div>
                        {lead.email && <div className="text-xs text-muted">{lead.email}</div>}
                        <div className="text-xs text-muted mt-0.5">{lead.deviceLocal}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium">{lead.deviceLocal}</div>
                        <div className="text-[10px] text-muted font-mono">{lead.id.split('-')[0]}...</div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-6 text-muted max-w-[150px] truncate">
                    <span className="text-xs bg-surface px-2 py-1 rounded border border-border block w-max max-w-[140px] truncate">{lead.source}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold mb-2 ${lead.stage === 'Decision' ? 'bg-rose-500/10 text-rose-500' : lead.stage === 'Consideration' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>{lead.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-xs w-6">{lead.score}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface">
                        <div className={`h-full rounded-full ${lead.score > 50 ? 'bg-rose-500' : lead.score > 20 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (lead.score / 100) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {lead.carts.length > 0 && <div className="text-xs text-foreground truncate"><span className="text-muted mr-1">🛒</span> {lead.carts.join(', ')}</div>}
                      {lead.views.length > 0 && <div className="text-xs text-muted truncate"><span className="mr-1">👀</span> {lead.views.join(', ')}</div>}
                      {lead.carts.length === 0 && lead.views.length === 0 && <span className="text-xs text-muted">Apenas navegou</span>}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-primary text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.fakeRev)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button onClick={() => setSelectedLead(lead)} className="rounded text-muted hover:text-foreground text-sm font-medium transition hover:bg-surface px-2 py-1">Detalhes &rarr;</button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted">Nenhum lead encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
