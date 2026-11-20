'use client';

import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import type { Report } from './data';
import { BarList, Card, Empty, Table, Td, ago, int, pct } from './ui';

// Limites oficiais do Core Web Vitals (bom / precisa melhorar), sobre o p75.
const LIMITS: Record<string, { good: number; poor: number; unit: 'ms' | ''; label: string }> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms', label: 'Maior conteúdo visível (LCP)' },
  INP: { good: 200, poor: 500, unit: 'ms', label: 'Resposta a toques (INP)' },
  CLS: { good: 0.1, poor: 0.25, unit: '', label: 'Estabilidade do layout (CLS)' },
  FCP: { good: 1800, poor: 3000, unit: 'ms', label: 'Primeiro conteúdo (FCP)' },
  TTFB: { good: 800, poor: 1800, unit: 'ms', label: 'Resposta do servidor (TTFB)' },
};

function status(name: string, v: number | null) {
  const l = LIMITS[name];
  if (v === null || !l) return null;
  return v <= l.good ? 'good' : v <= l.poor ? 'ni' : 'poor';
}

export default function QualityTab({ report, now }: { report: Report; now: number }) {
  const q = report.quality;
  return (
    <div className="space-y-4 animate-fade-in">
      <Card title="Desempenho real (Web Vitals)" subtitle="Medido nos aparelhos dos visitantes · p75 = 75% das visitas foram iguais ou melhores">
        {q.vitals.length === 0 ? <Empty>Sem medições no período.</Empty> : (
          <Table head={['Métrica', 'p75', 'Situação', 'Boas', 'Ruins', 'Medições']} minWidth={620}>
            {q.vitals.map(v => {
              const l = LIMITS[v.name];
              const st = status(v.name, v.p75);
              const value = v.p75 === null ? '—' : l.unit === 'ms' ? `${(v.p75 / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} s` : v.p75.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
              return (
                <tr key={v.name}>
                  <Td className="text-foreground">{l.label}</Td>
                  <Td right><b className="font-semibold">{value}</b></Td>
                  <Td right>
                    {st === 'good' && <span className="inline-flex items-center gap-1 text-good"><CircleCheck className="h-4 w-4" aria-hidden="true" />Bom</span>}
                    {st === 'ni' && <span className="inline-flex items-center gap-1 text-foreground"><TriangleAlert className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />Melhorar</span>}
                    {st === 'poor' && <span className="inline-flex items-center gap-1 text-critical"><CircleAlert className="h-4 w-4" aria-hidden="true" />Ruim</span>}
                  </Td>
                  <Td right>{pct(v.good)}</Td>
                  <Td right>{pct(v.poor)}</Td>
                  <Td right>{int(v.count)}</Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <Card title="Erros de JavaScript" subtitle="Agrupados pela mensagem">
        {q.errors.length === 0 ? <Empty>Nenhum erro registrado no período.</Empty> : (
          <Table head={['Mensagem', 'Ocorrências', 'Página', 'Último']} minWidth={620}>
            {q.errors.map(e => (
              <tr key={e.message}>
                <Td className="max-w-[420px] break-words font-mono text-xs text-foreground">{e.message}</Td>
                <Td right>{int(e.count)}</Td>
                <Td right className="text-xs">{e.path || '—'}</Td>
                <Td right className="text-xs text-muted">{ago(e.lastAt, now)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Cliques de frustração" subtitle="3+ cliques rápidos no mesmo ponto, por página"><BarList rows={q.rage} empty="Nenhum no período." /></Card>
        <Card title="Cliques sem efeito" subtitle="Toques em áreas não clicáveis, por página"><BarList rows={q.dead} empty="Nenhum no período." /></Card>
      </div>
    </div>
  );
}
