'use client';

import { useState } from 'react';
import { TrendChart } from './charts';
import type { Report } from './data';
import { BarList, Card, Delta, Stat, Table, Td, duration, int, pct } from './ui';

const METRICS = [
  { key: 'visits', label: 'Visitas' },
  { key: 'visitors', label: 'Visitantes' },
  { key: 'pageviews', label: 'Páginas vistas' },
  { key: 'searches', label: 'Buscas' },
  { key: 'productViews', label: 'Produtos vistos' },
  { key: 'offerClicks', label: 'Cliques em lojas' },
] as const;

export function CoverageNote({ report }: { report: Report }) {
  const c = report.coverage;
  if (c.pageViews && c.searchResults && c.productViews) return null;
  return (
    <p className="rounded-xl border border-border bg-surface-light px-4 py-3 text-xs leading-relaxed text-secondary">
      <b className="text-foreground">Rastreamento novo em implantação.</b> Os eventos de página vista, resultado de busca, produto visto e clique em loja
      passam a chegar quando a nova versão do site for publicada. Até lá, páginas e produtos deste período são estimados a partir de saídas de página e URLs.
    </p>
  );
}

export default function OverviewTab({ report }: { report: Report }) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]['key']>('visits');
  const k = report.kpis;
  const p = report.prevKpis;
  const label = METRICS.find(m => m.key === metric)!.label;

  return (
    <div className="space-y-4 animate-fade-in">
      <CoverageNote report={report} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Visitantes" value={int(k.visitors)} delta={<Delta now={k.visitors} prev={p.visitors} />} hint={`${int(k.newVisitors)} novos`} />
        <Stat label="Visitas" value={int(k.visits)} delta={<Delta now={k.visits} prev={p.visits} />} />
        <Stat label="Páginas vistas" value={int(k.pageviews)} delta={<Delta now={k.pageviews} prev={p.pageviews} />} hint={k.visits ? `${(k.pageviews / k.visits).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} por visita` : undefined} />
        <Stat label="Buscas" value={int(k.searches)} delta={<Delta now={k.searches} prev={p.searches} />} hint={`${pct(k.visitSearchRate)} das visitas`} />
        <Stat label="Produtos vistos" value={int(k.productViews)} delta={<Delta now={k.productViews} prev={p.productViews} />} />
        <Stat label="Cliques em lojas" value={int(k.offerClicks)} delta={<Delta now={k.offerClicks} prev={p.offerClicks} />} hint={k.productViews ? `${pct(k.offerClicks / k.productViews, 1)} dos produtos vistos` : undefined} />
        <Stat label="Tempo por visita" value={duration(k.medianVisitSec)} hint={`mediana · média ${duration(k.avgVisitSec)}`} delta={<Delta now={k.medianVisitSec} prev={p.medianVisitSec} />} />
        <Stat label="Rejeição" value={pct(k.bounceRate)} delta={<Delta now={k.bounceRate} prev={p.bounceRate} invert asPoints />} hint="saiu sem interagir" />
      </div>

      <Card
        title={`${label} por ${report.range.bucket === 'hour' ? 'hora' : 'dia'}`}
        action={
          <div className="no-scrollbar -mr-1 flex max-w-[60vw] gap-1 overflow-x-auto" role="tablist" aria-label="Métrica do gráfico">
            {METRICS.map(m => (
              <button key={m.key} type="button" role="tab" aria-selected={metric === m.key} onClick={() => setMetric(m.key)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition ${metric === m.key ? 'bg-foreground text-background' : 'text-secondary hover:bg-surface-light'}`}>
                {m.label}
              </button>
            ))}
          </div>
        }
      >
        <TrendChart data={report.series} dataKey={metric} label={label.toLowerCase()} bucket={report.range.bucket} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Funil da visita" subtitle="Quantas visitas chegaram a cada etapa">
          <ol className="space-y-3">
            {report.funnel.map((s, i) => (
              <li key={s.step}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-foreground">{s.step}</span>
                  <span className="tabular"><b className="font-semibold text-foreground">{int(s.value)}</b> <span className="text-xs text-muted">{pct(s.ofTotal)}{i > 0 ? ` · ${pct(s.ofPrevious)} da etapa anterior` : ''}</span></span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-light"><div className="h-full rounded-full bg-[var(--series-1)]" style={{ width: `${s.value ? Math.max(1, s.ofTotal * 100) : 0}%` }} /></div>
              </li>
            ))}
          </ol>
        </Card>
        <Card title="De onde vêm as visitas" subtitle="Origem da primeira página · % que buscou">
          <BarList rows={report.audience.sources.map(s => ({ name: s.name, value: s.value, note: `${pct(s.searchRate)} buscou` }))} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Dispositivo"><BarList rows={report.audience.devices} /></Card>
        <Card title="Região"><BarList rows={report.audience.regions.slice(0, 8)} /></Card>
        <Card title="Navegador"><BarList rows={report.audience.browsers.slice(0, 8)} /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Páginas mais vistas" className="lg:col-span-3">
          <Table head={['Página', 'Vistas', 'Pessoas', 'Tempo (mediana)']} minWidth={420}>
            {report.pages.map(pg => (
              <tr key={pg.path}>
                <Td className="max-w-[260px] truncate text-foreground">{pg.path}</Td>
                <Td right>{int(pg.views)}</Td>
                <Td right>{int(pg.visitors)}</Td>
                <Td right>{pg.medianDwellSec === null ? '—' : duration(pg.medianDwellSec)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Páginas de entrada" className="lg:col-span-2"><BarList rows={report.audience.landings} /></Card>
      </div>
    </div>
  );
}
