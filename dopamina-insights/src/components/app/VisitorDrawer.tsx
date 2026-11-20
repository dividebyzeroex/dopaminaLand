'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FeedItem } from '@/lib/analytics/core';
import { Empty, Pill, clock, dateTime, duration, int, shortId } from './ui';

type VisitorData = {
  visitor: { id: string; place: string; device: string; os: string; browser: string; firstSeen: number | null; isBot: boolean };
  visits: { id: string; start: number; end: number; durationSec: number; source: string; landing: string; pageviews: number; searches: number; products: number; clicks: number; timeline: FeedItem[] }[];
};

export default function VisitorDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [state, setState] = useState<{ id: string; data: VisitorData | null; error: string | null }>({ id, data: null, error: null });

  useEffect(() => {
    let alive = true;
    fetch(`/api/insights/visitor/${id}`, { cache: 'no-store' })
      .then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Falha'); return j as VisitorData; })
      .then(d => { if (alive) setState({ id, data: d, error: null }); })
      .catch(e => { if (alive) setState({ id, data: null, error: e instanceof Error ? e.message : 'Falha' }); });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { alive = false; window.removeEventListener('keydown', onKey); };
  }, [id, onClose]);

  const data = state.id === id ? state.data : null;
  const error = state.id === id ? state.error : null;
  const visits = data ? [...data.visits].sort((a, b) => b.start - a.start) : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Visitante ${shortId(id)}`}>
      <button type="button" className="absolute inset-0 bg-black/30" aria-label="Fechar" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-border bg-surface shadow-2xl animate-slide-up">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs text-muted">Visitante</p>
            <h2 className="text-lg font-semibold text-foreground">#{shortId(id)}</h2>
            {data && <p className="mt-1 text-xs text-secondary">{data.visitor.place} · {data.visitor.device} · {data.visitor.os} · {data.visitor.browser}{data.visitor.firstSeen ? ` · desde ${dateTime(data.visitor.firstSeen)}` : ''}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-light hover:text-foreground" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && <Empty>{error}</Empty>}
          {!data && !error && <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-light" />)}</div>}
          {data && (
            <>
              <p className="mb-4 text-sm text-secondary">{int(visits.length)} visita(s) · {int(visits.reduce((n, v) => n + v.searches, 0))} busca(s) · {int(visits.reduce((n, v) => n + v.products, 0))} produto(s) · {int(visits.reduce((n, v) => n + v.clicks, 0))} clique(s) em loja</p>
              <ol className="space-y-5">
                {visits.map(v => (
                  <li key={v.id} className="rounded-xl border border-border">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-light px-3 py-2">
                      <span className="text-sm font-medium text-foreground tabular">{dateTime(v.start)}</span>
                      <span className="flex flex-wrap gap-1"><Pill>{duration(v.durationSec)}</Pill><Pill>{v.source}</Pill>{v.clicks > 0 && <Pill tone="good">foi à loja</Pill>}</span>
                    </div>
                    {v.timeline.length === 0 ? <p className="px-3 py-3 text-xs text-muted">Só eventos técnicos (desempenho, rolagem) nesta visita. Entrada em {v.landing}.</p> : (
                      <ol className="relative px-3 py-2">
                        {v.timeline.map((t, i) => (
                          <li key={i} className="flex gap-3 py-1.5">
                            <span className="w-11 shrink-0 pt-0.5 text-xs text-muted tabular">{clock(t.ts)}</span>
                            <div className="min-w-0">
                              <p className={`text-sm ${t.kind === 'search' || t.kind === 'click' ? 'font-medium text-foreground' : t.kind === 'legacy' ? 'text-muted' : 'text-foreground'}`}>{t.title}</p>
                              {t.detail && <p className="truncate text-xs text-muted">{t.detail}</p>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
