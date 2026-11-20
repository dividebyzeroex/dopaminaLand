'use client';

import { ArrowUpRight, Eye, FileText, Search, Share2, ShieldAlert, ShoppingBag, TriangleAlert, MousePointerClick, History } from 'lucide-react';
import type { FeedItem } from '@/lib/analytics/core';
import { BarsChart } from './charts';
import type { Live } from './data';
import { Card, Empty, Stat, ago, clock, int, shortId } from './ui';

const KIND_ICON: Record<FeedItem['kind'], typeof Eye> = {
  page: FileText, search: Search, product: Eye, click: ShoppingBag, share: Share2, blocked: ShieldAlert,
  error: TriangleAlert, exit: ArrowUpRight, frustration: MousePointerClick, legacy: History,
};

export default function LiveTab({ live, now, onVisitor }: { live: Live | null; now: number; onVisitor: (id: string) => void }) {
  if (!live) return <Skeleton />;
  const t = live.today;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <div className="col-span-2 rounded-2xl border border-border bg-surface px-4 py-3.5">
          <p className="flex items-center gap-2 text-xs font-medium text-muted">
            <span className="live-dot h-2 w-2 rounded-full bg-[var(--good)]" aria-hidden="true" /> Pessoas no site agora
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground tabular">{int(live.active5)}</p>
          <p className="mt-1 text-xs text-muted">ativas nos últimos 5 min · {int(live.active30)} nos últimos 30 min</p>
        </div>
        <Stat label="Visitantes hoje" value={int(t.visitors)} hint={`${int(t.visits)} visitas`} />
        <Stat label="Buscas hoje" value={int(t.searches)} hint={`${int(t.uniqueTerms)} termos`} />
        <Stat label="Produtos vistos hoje" value={int(t.productViews)} />
        <Stat label="Cliques em lojas hoje" value={int(t.offerClicks)} />
      </div>

      <Card title="Pessoas ativas por minuto" subtitle="Últimos 30 minutos · inclui quem só está rolando a página">
        <BarsChart data={live.perMinute} dataKey="visitors" label="pessoas" tick={r => clock(r.ts)} title={r => `${clock(r.ts)}–${clock(r.ts + 60_000)}`} height={150} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Quem está no site" subtitle="Toque para ver o histórico do visitante" className="lg:col-span-2">
          {live.activeNow.length === 0 ? <Empty>Ninguém ativo nos últimos 5 minutos.</Empty> : (
            <ul className="-mx-2 divide-y divide-border">
              {live.activeNow.map(a => (
                <li key={a.visitorId}>
                  <button type="button" onClick={() => onVisitor(a.visitorId)} className="w-full rounded-lg px-2 py-2.5 text-left hover:bg-surface-light">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{a.path || '—'}</span>
                      <span className="shrink-0 text-xs text-muted tabular">{ago(a.lastAt, now)}</span>
                    </div>
                    {a.lastAction && <p className="mt-0.5 truncate text-xs text-secondary">{a.lastAction}</p>}
                    <p className="mt-0.5 truncate text-xs text-muted">{a.place} · {a.device} · {a.source} · #{shortId(a.visitorId)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {live.activePages.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium text-muted">Páginas abertas agora</p>
              <div className="flex flex-wrap gap-1.5">
                {live.activePages.map(p => <span key={p.name} className="rounded-full bg-surface-light px-2.5 py-1 text-xs text-secondary">{p.name} <b className="text-foreground tabular">{p.value}</b></span>)}
              </div>
            </div>
          )}
        </Card>

        <Card title="Atividade em tempo real" subtitle="Acessos, buscas, produtos e cliques dos últimos 30 min" className="lg:col-span-3">
          {live.feed.length === 0 ? <Empty>Sem atividade nos últimos 30 minutos.</Empty> : (
            <ol className="-mx-2 max-h-[560px] overflow-y-auto">
              {live.feed.map((f, i) => {
                const Icon = KIND_ICON[f.kind];
                return (
                  <li key={`${f.ts}-${i}`} className="flex gap-3 rounded-lg px-2 py-2 hover:bg-surface-light">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${f.kind === 'search' || f.kind === 'click' ? 'bg-[var(--series-1-soft)] text-primary' : f.kind === 'error' || f.kind === 'blocked' ? 'bg-[color-mix(in_srgb,var(--critical)_14%,transparent)] text-critical' : 'bg-surface-light text-secondary'}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{f.title}</p>
                      <p className="truncate text-xs text-muted">
                        {f.detail && <>{f.detail} · </>}
                        <button type="button" className="underline-offset-2 hover:underline" onClick={() => onVisitor(f.visitorId)}>#{shortId(f.visitorId)}</button>
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted tabular">{clock(f.ts)}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>

      <Card title="Buscas de hoje" subtitle="Mais recentes primeiro">
        {live.todayTerms.length === 0 ? <Empty>Nenhuma busca hoje ainda.</Empty> : (
          <div className="flex flex-wrap gap-2">
            {live.todayTerms.map((s, i) => (
              <span key={`${s.ts}-${i}`} className="rounded-full border border-border px-3 py-1 text-sm text-foreground">
                {s.term} <span className="text-xs text-muted tabular">{clock(s.ts)}{s.results !== null ? ` · ${s.results} res.` : ''}</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-light" />)}</div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface-light" />
    </div>
  );
}
