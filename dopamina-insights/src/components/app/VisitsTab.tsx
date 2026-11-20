'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Report } from './data';
import { CoverageNote } from './OverviewTab';
import { Card, Empty, Pill, Table, Td, dateTime, duration, int, shortId } from './ui';

export default function VisitsTab({ report, onVisitor }: { report: Report; onVisitor: (id: string) => void }) {
  const [source, setSource] = useState('');
  const [device, setDevice] = useState('');
  const [onlyEngaged, setOnlyEngaged] = useState(false);
  const [text, setText] = useState('');

  const sources = useMemo(() => [...new Set(report.visits.map(v => v.source))].sort(), [report.visits]);
  const devices = useMemo(() => [...new Set(report.visits.map(v => v.device))].sort(), [report.visits]);
  const rows = useMemo(() => {
    const q = text.trim().toLowerCase();
    return report.visits.filter(v =>
      (!source || v.source === source) &&
      (!device || v.device === device) &&
      (!onlyEngaged || v.searches.length > 0 || v.products.length > 0 || v.clicks > 0) &&
      (!q || v.searches.some(s => s.toLowerCase().includes(q)) || v.products.some(p => p.toLowerCase().includes(q)) || v.place.toLowerCase().includes(q) || v.visitorId.startsWith(q) || v.landing.includes(q)));
  }, [report.visits, source, device, onlyEngaged, text]);

  const select = 'rounded-lg border border-border bg-surface-light px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="space-y-4 animate-fade-in">
      <CoverageNote report={report} />
      <Card
        title="Visitas"
        subtitle={`${int(rows.length)} de ${int(report.visits.length)} visitas mais recentes · uma visita termina após 30 min sem atividade`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input type="search" value={text} onChange={e => setText(e.target.value)} placeholder="Termo, produto, cidade ou #id" aria-label="Filtrar visitas" className={`${select} min-w-0 flex-1 sm:max-w-xs`} />
          <select value={source} onChange={e => setSource(e.target.value)} className={select} aria-label="Origem"><option value="">Todas as origens</option>{sources.map(s => <option key={s}>{s}</option>)}</select>
          <select value={device} onChange={e => setDevice(e.target.value)} className={select} aria-label="Dispositivo"><option value="">Todos os dispositivos</option>{devices.map(s => <option key={s}>{s}</option>)}</select>
          <label className="inline-flex items-center gap-2 text-sm text-secondary"><input type="checkbox" checked={onlyEngaged} onChange={e => setOnlyEngaged(e.target.checked)} className="accent-[var(--primary)]" /> Só quem buscou, viu produto ou clicou</label>
        </div>
        {rows.length === 0 ? <Empty>Nenhuma visita com esses filtros.</Empty> : (
          <Table head={['Início', 'O que fez', 'Duração', 'Páginas', 'Origem', 'Dispositivo', 'Local']} minWidth={900} leftCols={2}>
            {rows.map(v => (
              <tr key={v.id} className="cursor-pointer hover:bg-surface-light" onClick={() => onVisitor(v.visitorId)}>
                <Td className="whitespace-nowrap">
                  <button type="button" className="text-left" onClick={e => { e.stopPropagation(); onVisitor(v.visitorId); }}>
                    <span className="block text-foreground tabular">{dateTime(v.start)}</span>
                    <span className="text-xs text-muted">#{shortId(v.visitorId)} {v.isNew ? '· novo' : '· recorrente'}</span>
                  </button>
                </Td>
                <Td className="max-w-[340px]">
                  <div className="flex flex-wrap gap-1">
                    {v.searches.slice(0, 3).map((s, i) => <Pill key={`s${i}`} tone="info"><Search className="h-3 w-3" aria-hidden="true" />{s}</Pill>)}
                    {v.products.slice(0, 2).map((p, i) => <Pill key={`p${i}`}>{p.length > 34 ? `${p.slice(0, 34)}…` : p}</Pill>)}
                    {v.clicks > 0 && <Pill tone="good">{v.clicks} clique(s) em loja</Pill>}
                    {v.shares > 0 && <Pill tone="good">compartilhou</Pill>}
                    {v.searches.length === 0 && v.products.length === 0 && v.clicks === 0 && <span className="text-xs text-muted">{v.bounced ? 'Saiu sem interagir' : `Navegou por ${v.landing}`}</span>}
                  </div>
                </Td>
                <Td right>{duration(v.durationSec)}</Td>
                <Td right>{int(v.pageviews)}</Td>
                <Td right>{v.source}</Td>
                <Td right>{v.device}</Td>
                <Td right className="max-w-[160px] truncate">{v.place}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
