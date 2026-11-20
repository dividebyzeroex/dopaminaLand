'use client';

import { ExternalLink } from 'lucide-react';
import type { Report } from './data';
import { CoverageNote } from './OverviewTab';
import { BarList, Card, Delta, Empty, Stat, Table, Td, VERDICT_LABEL, VerdictPill, ago, brl, clock, dateTime, int, pct, shortId } from './ui';

const SITE = 'https://www.dopaminado.com.br';

export default function ProductsTab({ report, now, onVisitor }: { report: Report; now: number; onVisitor: (id: string) => void }) {
  const pr = report.products;
  const k = report.kpis;
  const p = report.prevKpis;
  return (
    <div className="space-y-4 animate-fade-in">
      <CoverageNote report={report} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Produtos vistos" value={int(k.productViews)} delta={<Delta now={k.productViews} prev={p.productViews} />} />
        <Stat label="Produtos diferentes" value={int(pr.top.length)} hint={pr.top.length >= 100 ? 'mostrando os 100 primeiros' : undefined} />
        <Stat label="Cliques em lojas" value={int(k.offerClicks)} delta={<Delta now={k.offerClicks} prev={p.offerClicks} />} />
        <Stat label="Visitas que foram à loja" value={pct(k.visitClickRate, 1)} delta={<Delta now={k.visitClickRate} prev={p.visitClickRate} asPoints />} />
        <Stat label="Alertas de preço criados" value={int(k.alertsCreated)} delta={<Delta now={k.alertsCreated} prev={p.alertsCreated} />} hint={`${int(k.installClicks)} toque(s) em instalar o app`} />
      </div>

      <Card title="Produtos mais vistos" subtitle="Páginas de produto abertas no período">
        {pr.top.length === 0 ? <Empty>Nenhum produto visto no período.</Empty> : (
          <Table head={['Produto', 'Vistas', 'Pessoas', 'Cliques na loja', 'Taxa', 'Último preço', 'Veredito', 'Última']} minWidth={860}>
            {pr.top.slice(0, 50).map(r => (
              <tr key={r.path || r.name}>
                <Td className="max-w-[300px]">
                  {r.path
                    ? <a href={`${SITE}/produto/${r.path}`} target="_blank" rel="noopener noreferrer" className="group inline-flex max-w-full items-center gap-1 text-foreground hover:text-primary"><span className="truncate">{r.name}</span><ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" aria-hidden="true" /></a>
                    : <span className="text-foreground">{r.name}</span>}
                </Td>
                <Td right><b className="font-semibold">{int(r.views)}</b></Td>
                <Td right>{int(r.visitors)}</Td>
                <Td right>{int(r.clicks)}</Td>
                <Td right>{r.views ? pct(r.ctr) : '—'}</Td>
                <Td right>{brl(r.lastPrice)}</Td>
                <Td right><VerdictPill kind={r.verdict} /></Td>
                <Td right className="text-xs text-muted">{ago(r.lastAt, now)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Lojas mais clicadas" subtitle="Cliques em “Ir à loja”"><BarList rows={pr.stores} empty="Nenhum clique em loja ainda." /></Card>
        <Card title="Veredito dos produtos vistos"><BarList rows={pr.verdicts.map(v => ({ name: VERDICT_LABEL[v.name]?.label ?? v.name, value: v.value }))} empty="Sem vereditos registrados." /></Card>
        <Card title="Cliques recentes em lojas">
          {pr.recentClicks.length === 0 ? <Empty>Nenhum clique em loja ainda.</Empty> : (
            <ul className="-mx-2 divide-y divide-border">
              {pr.recentClicks.slice(0, 12).map((c, i) => (
                <li key={`${c.ts}-${i}`} className="px-2 py-2">
                  <p className="truncate text-sm text-foreground">{c.store} · <span className="text-secondary">{c.product}</span></p>
                  <p className="text-xs text-muted tabular">{now - c.ts < 86_400_000 ? clock(c.ts) : dateTime(c.ts)} · {brl(c.price)} · <button type="button" className="text-primary hover:underline" onClick={() => onVisitor(c.visitorId)}>#{shortId(c.visitorId)}</button></p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
