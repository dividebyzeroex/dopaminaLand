'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { clock, dayLabel, int } from './ui';

const axis = { stroke: 'var(--axis)', tick: { fill: 'var(--muted)', fontSize: 11 }, tickLine: false } as const;

function TipBox({ title, value, label }: { title: string; value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="text-muted">{title}</p>
      <p className="mt-0.5 font-semibold text-foreground tabular">{int(value)} <span className="font-normal text-secondary">{label}</span></p>
    </div>
  );
}

type TipProps = { active?: boolean; payload?: readonly { value?: unknown; payload?: unknown }[] };
function first<R>(p: TipProps) {
  const item = p.active ? p.payload?.[0] : undefined;
  return item ? { value: Number(item.value) || 0, row: item.payload as R } : null;
}

export function TrendChart({ data, dataKey, label, bucket, height = 240 }: {
  data: { ts: number; [k: string]: number | string }[];
  dataKey: string;
  label: string;
  bucket: 'hour' | 'day';
  height?: number;
}) {
  const fmt = (ts: number) => bucket === 'hour' ? clock(ts) : dayLabel(ts);
  return (
    <div style={{ height }} role="img" aria-label={`Gráfico de ${label} por ${bucket === 'hour' ? 'hora' : 'dia'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="ts" {...axis} tickFormatter={fmt} minTickGap={28} />
          <YAxis {...axis} axisLine={false} allowDecimals={false} width={44} />
          <Tooltip
            cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
            content={(props: TipProps) => {
              const hit = first<{ ts: number }>(props);
              return hit ? <TipBox title={bucket === 'hour' ? `${dayLabel(hit.row.ts)}, ${clock(hit.row.ts)}` : dayLabel(hit.row.ts)} value={hit.value} label={label} /> : null;
            }}
          />
          <Area type="linear" dataKey={dataKey} stroke="var(--series-1)" strokeWidth={2} fill="var(--series-1-soft)" activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({ data, dataKey, label, tick, title, height = 180 }: {
  data: { [k: string]: number }[];
  dataKey: string;
  label: string;
  tick: (row: { [k: string]: number }) => string;
  title: (row: { [k: string]: number }) => string;
  height?: number;
}) {
  const rows = data.map((d, i) => ({ ...d, _i: i }));
  return (
    <div style={{ height }} role="img" aria-label={`Gráfico de barras de ${label}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -22 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="_i" {...axis} tickFormatter={(i: number) => tick(rows[i])} minTickGap={16} />
          <YAxis {...axis} axisLine={false} allowDecimals={false} width={44} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            content={(props: TipProps) => {
              const hit = first<{ _i: number }>(props);
              return hit ? <TipBox title={title(rows[hit.row._i])} value={hit.value} label={label} /> : null;
            }}
          />
          <Bar dataKey={dataKey} fill="var(--series-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
