'use client';

import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

/* ───────── formatadores ───────── */

export const int = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR');
export const pct = (n: number | null | undefined, digits = 0) => `${((n ?? 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;
export const brl = (n: number | null | undefined) => n == null ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function duration(sec: number | null | undefined) {
  const s = Math.max(0, Math.round(sec ?? 0));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60 ? `${s % 60} s` : ''}`.trim();
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short' });
export const clock = (ts: number) => timeFmt.format(ts);
export const dateTime = (ts: number) => dateTimeFmt.format(ts);
export const dayLabel = (ts: number) => dayFmt.format(ts).replace('.', '');

export function ago(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `há ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  return dateTime(ts);
}

export const shortId = (id: string) => id.slice(0, 8);

/* ───────── blocos ───────── */

export function Card({ title, subtitle, action, children, className = '', pad = true }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-border bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'p-4 sm:p-5' : ''}>{children}</div>
    </section>
  );
}

/** Variação contra o período anterior. `invert` quando subir é ruim (ex.: buscas sem resultado). */
export function Delta({ now, prev, invert = false, asPoints = false }: { now: number; prev: number; invert?: boolean; asPoints?: boolean }) {
  if (!prev && !now) return <span className="text-xs text-muted">sem dados antes</span>;
  if (!prev) return <span className="text-xs text-muted">novo no período</span>;
  const diff = asPoints ? (now - prev) * 100 : (now - prev) / prev;
  const flat = Math.abs(asPoints ? diff : diff * 100) < 0.5;
  const up = diff > 0;
  const good = flat ? null : invert ? !up : up;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const label = asPoints ? `${diff > 0 ? '+' : ''}${diff.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.` : `${up ? '+' : ''}${pct(diff)}`;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular ${good === null ? 'text-muted' : good ? 'text-good' : 'text-critical'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
      <span className="sr-only">{good === null ? 'estável' : good ? 'melhora' : 'piora'} vs. período anterior</span>
    </span>
  );
}

export function Stat({ label, value, hint, delta }: { label: string; value: ReactNode; hint?: ReactNode; delta?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">{delta}{hint && <span>{hint}</span>}</div>
    </div>
  );
}

/** Lista com barra proporcional — para rankings (origem, termos, lojas). */
export function BarList({ rows, format = int, empty = 'Sem dados no período.', onSelect }: { rows: { name: string; value: number; note?: ReactNode }[]; format?: (n: number) => string; empty?: string; onSelect?: (name: string) => void }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map(r => {
        const inner = (
          <>
            <span className="absolute inset-y-0 left-0 rounded-md bg-[var(--series-1-soft)]" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} aria-hidden="true" />
            <span className="relative min-w-0 flex-1 truncate text-foreground">{r.name}</span>
            {r.note && <span className="relative shrink-0 text-xs text-muted">{r.note}</span>}
            <span className="relative w-12 shrink-0 text-right font-medium text-foreground tabular">{format(r.value)}</span>
          </>
        );
        return (
          <li key={r.name}>
            {onSelect
              ? <button type="button" onClick={() => onSelect(r.name)} className="relative flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-light">{inner}</button>
              : <div className="relative flex items-center gap-3 rounded-md px-2 py-1.5 text-sm">{inner}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">{children}</p>;
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warning' | 'critical' | 'info' }) {
  const cls = {
    neutral: 'bg-surface-light text-secondary',
    good: 'bg-[color-mix(in_srgb,var(--good)_14%,transparent)] text-good',
    warning: 'bg-[color-mix(in_srgb,var(--warning)_22%,transparent)] text-foreground',
    critical: 'bg-[color-mix(in_srgb,var(--critical)_14%,transparent)] text-critical',
    info: 'bg-[var(--series-1-soft)] text-primary',
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>;
}

export const VERDICT_LABEL: Record<string, { label: string; tone: 'good' | 'warning' | 'critical' | 'neutral' }> = {
  menor: { label: 'Menor preço', tone: 'good' },
  abaixo: { label: 'Abaixo do normal', tone: 'good' },
  normal: { label: 'Preço normal', tone: 'neutral' },
  acima: { label: 'Acima do normal', tone: 'warning' },
  maquiado: { label: 'Desconto maquiado', tone: 'critical' },
  insuficiente: { label: 'Sem histórico', tone: 'neutral' },
};

export function VerdictPill({ kind }: { kind: string | null | undefined }) {
  if (!kind) return <span className="text-xs text-muted">—</span>;
  const v = VERDICT_LABEL[kind] ?? { label: kind, tone: 'neutral' as const };
  return <Pill tone={v.tone}>{v.label}</Pill>;
}

export function Table({ head, children, minWidth = 640, leftCols = 1 }: { head: ReactNode[]; children: ReactNode; minWidth?: number; leftCols?: number }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            {head.map((h, i) => <th key={i} scope="col" className={`whitespace-nowrap px-4 pb-2 font-medium sm:px-5 ${i >= leftCols ? 'text-right' : ''}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, right = false, className = '' }: { children: ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-4 py-2.5 sm:px-5 ${right ? 'text-right tabular' : ''} ${className}`}>{children}</td>;
}
