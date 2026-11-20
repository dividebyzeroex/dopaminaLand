'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { BarsChart } from './charts';
import type { Report } from './data';
import { CoverageNote } from './OverviewTab';
import { BarList, Card, Delta, Empty, Pill, Stat, Table, Td, ago, clock, dateTime, int, pct, shortId } from './ui';

const SITE = 'https://www.dopaminado.com.br';

export default function SearchesTab({ report, now, onVisitor }: { report: Report; now: number; onVisitor: (id: string) => void }) {
  const [filter, setFilter] = useState('');
  const s = report.searches;
  const k = report.kpis;
  const p = report.prevKpis;
  const terms = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? s.terms.filter(t => t.term.toLowerCase().includes(f)) : s.terms;
  }, [filter, s.terms]);

  return (
    <div className="space-y-4 animate-fade-in">
      <CoverageNote report={report} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Buscas" value={int(k.searches)} delta={<Delta now={k.searches} prev={p.searches} />} hint={`${pct(k.visitSearchRate)} das visitas buscam`} />
        <Stat label="Termos diferentes" value={int(k.uniqueTerms)} delta={<Delta now={k.uniqueTerms} prev={p.uniqueTerms} />} />
        <Stat label="Sem resultado" value={pct(k.zeroResultRate)} delta={<Delta now={k.zeroResultRate} prev={p.zeroResultRate} invert asPoints />} hint="das buscas com resposta" />
        <Stat label="Busca → produto" value={pct(k.searchToProductRate)} delta={<Delta now={k.searchToProductRate} prev={p.searchToProductRate} asPoints />} hint="abriu produto em até 15 min" />
      </div>

      <Card
        title="Termos mais buscados"
        subtitle="Agrupados sem diferenciar maiúsculas e acentos"
        action={<input type="search" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar termo" aria-label="Filtrar termos"
          className="w-36 rounded-lg border border-border bg-surface-light px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary sm:w-48" />}
      >
        {terms.length === 0 ? <Empty>Nenhuma busca no período.</Empty> : (
          <Table head={['Termo', 'Buscas', 'Pessoas', 'Resultados (média)', 'Sem resultado', '→ Produto', 'Período anterior', 'Última']} minWidth={820}>
            {terms.slice(0, 50).map(t => (
              <tr key={t.key}>
                <Td className="max-w-[240px]">
                  <a href={`${SITE}/busca?q=${encodeURIComponent(t.term)}`} target="_blank" rel="noopener noreferrer" className="group inline-flex max-w-full items-center gap-1 text-foreground hover:text-primary">
                    <span className="truncate">{t.term}</span><ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" aria-hidden="true" />
                  </a>
                  {t.blocked > 0 && <span className="ml-1"><Pill tone="critical">bloqueado</Pill></span>}
                </Td>
                <Td right><b className="font-semibold">{int(t.count)}</b></Td>
                <Td right>{int(t.visitors)}</Td>
                <Td right>{t.avgResults ?? '—'}</Td>
                <Td right>{t.zeroResults ? <span className="text-critical">{int(t.zeroResults)}</span> : '—'}</Td>
                <Td right>{pct(t.productRate)}</Td>
                <Td right>{t.prev ? <span className="inline-flex items-center gap-1">{int(t.prev)} <Delta now={t.count} prev={t.prev} /></span> : <span className="text-xs text-muted">novo</span>}</Td>
                <Td right className="text-xs text-muted">{ago(t.lastAt, now)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Em alta" subtitle="Cresceram vs. período anterior">
          <BarList rows={s.rising.map(t => ({ name: t.term, value: t.count, note: t.prev ? `antes ${t.prev}` : 'novo' }))} empty="Nenhum termo em alta (mín. 2 buscas)." />
        </Card>
        <Card title="Sem resultado" subtitle="Oportunidades: o site não achou preço">
          <BarList rows={s.zero.map(t => ({ name: t.term, value: t.zeroResults }))} empty="Toda busca teve resultado." />
        </Card>
        <Card title="Bloqueadas" subtitle="Barradas pela política de busca">
          <BarList rows={s.blocked.map(t => ({ name: t.term, value: t.blocked }))} empty="Nenhuma busca bloqueada." />
        </Card>
      </div>

      <Card title="Buscas por hora do dia" subtitle="Horário de São Paulo">
        <BarsChart data={s.hours} dataKey="searches" label="buscas" tick={r => `${r.hour}h`} title={r => `${r.hour}h–${r.hour + 1}h`} height={170} />
      </Card>

      <Card title="Buscas recentes" subtitle="Cada linha é uma busca; toque no visitante para ver a jornada">
        {s.recent.length === 0 ? <Empty>Nenhuma busca no período.</Empty> : (
          <Table head={['Quando', 'Termo', 'Resultados', 'Abriu produto', 'Visitante']} minWidth={620} leftCols={2}>
            {s.recent.map((r, i) => (
              <tr key={`${r.ts}-${i}`}>
                <Td className="whitespace-nowrap text-xs text-muted tabular">{now - r.ts < 86_400_000 ? clock(r.ts) : dateTime(r.ts)}</Td>
                <Td>
                  <span className="text-foreground">{r.term}</span>
                  {r.top?.[0]?.name && <span className="block truncate text-xs text-muted">1º: {r.top[0].name}</span>}
                </Td>
                <Td right>{r.blocked ? <Pill tone="critical">bloqueada</Pill> : r.failed ? <Pill tone="warning">fonte fora</Pill> : r.results === null ? '—' : r.results === 0 ? <Pill tone="critical">0</Pill> : int(r.results)}{r.fake ? <span className="ml-1"><Pill tone="critical">{r.fake} maquiado</Pill></span> : null}</Td>
                <Td right>{r.ledToProduct ? <Pill tone="good">sim</Pill> : <span className="text-xs text-muted">não</span>}</Td>
                <Td right><button type="button" onClick={() => onVisitor(r.visitorId)} className="text-xs text-primary hover:underline">#{shortId(r.visitorId)}</button></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
