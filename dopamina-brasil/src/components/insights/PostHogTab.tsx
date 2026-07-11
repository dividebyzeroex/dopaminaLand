'use client';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { PostHogData } from '@/hooks/useInsightsData';

const GRADIENT_COLORS = ['#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-xs font-bold text-muted">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-foreground">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}
        </p>
      ))}
    </div>
  );
};

export default function PostHogTab({ data }: { data: PostHogData | null; error?: string | null }) {
  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-3xl border border-border bg-white p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">🦔</div>
          <h3 className="text-xl font-bold text-foreground">PostHog não configurado</h3>
          <p className="mt-2 text-muted max-w-lg mx-auto text-sm">
            Para visualizar analytics reais do PostHog, adicione as seguintes variáveis de ambiente no <code className="rounded bg-surface px-1.5 py-0.5">.env.local</code>:
          </p>
          <div className="mt-4 rounded-xl bg-surface-light border border-border p-4 text-left max-w-md mx-auto">
            <code className="text-xs text-foreground block space-y-1">
              <span className="block">POSTHOG_PERSONAL_API_KEY=phx_xxx</span>
              <span className="block">POSTHOG_PROJECT_ID=12345</span>
              <span className="block">POSTHOG_HOST=https://us.i.posthog.com</span>
            </code>
          </div>
        </div>
      </div>
    );
  }

  const totalDevices = data.deviceTypes.reduce((sum, d) => sum + d.count, 0) || 1;
  const totalReferrers = data.topReferrers.reduce((sum, r) => sum + r.count, 0) || 1;

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-violet-500/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">PostHog Live</span>
          </div>
          <div className="text-4xl font-black text-foreground">{data.kpis.pageviews30d.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold text-muted">Pageviews (30d)</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">👥</div>
          <div className="mt-2 text-4xl font-black text-foreground">{data.kpis.sessions30d.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Sessões Únicas (30d)</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">📊</div>
          <div className="mt-2 text-4xl font-black text-indigo-500">{data.kpis.pageviews7d.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Pageviews (7d)</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🔁</div>
          <div className="mt-2 text-4xl font-black text-emerald-500">{data.kpis.sessions7d.toLocaleString('pt-BR')}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">Sessões (7d)</div>
        </div>
      </div>

      {/* Pageviews Area Chart + Device Donut */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
            📈 Pageviews por Dia
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pageviewsByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => { try { return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); } catch { return v; } }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="pageviews" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradPageviews)" animationDuration={800} animationEasing="ease-out" name="Pageviews" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-4 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
            📱 Dispositivos
          </h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.deviceTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3} animationDuration={800} animationEasing="ease-out">
                  {data.deviceTypes.map((_, index) => (
                    <Cell key={index} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.deviceTypes.map((d, i) => (
              <div key={d.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GRADIENT_COLORS[i % GRADIENT_COLORS.length] }} />
                  <span className="font-bold text-foreground capitalize">{d.type || 'Desconhecido'}</span>
                </div>
                <span className="font-bold text-muted">{((d.count / totalDevices) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages + Top Referrers */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
            🔥 Páginas Mais Visitadas
          </h2>
          <div className="space-y-3">
            {data.topPages.slice(0, 8).map((page, i) => {
              const maxViews = data.topPages[0]?.views || 1;
              const urlPart = (() => { try { return new URL(page.url).pathname; } catch { return page.url; } })();
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground truncate max-w-[250px]" title={page.url}>{urlPart || '/'}</span>
                    <span className="font-bold text-indigo-500 shrink-0">{page.views.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${(page.views / maxViews) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {data.topPages.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhum dado de páginas ainda.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
            🔗 Fontes de Tráfego (Referrers)
          </h2>
          <div className="space-y-3">
            {data.topReferrers.slice(0, 8).map((ref, i) => {
              const maxCount = data.topReferrers[0]?.count || 1;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{ref.domain}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-500">{ref.count.toLocaleString('pt-BR')}</span>
                      <span className="text-muted">({((ref.count / totalReferrers) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" style={{ width: `${(ref.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {data.topReferrers.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhum referrer detectado ainda.</p>}
          </div>
        </div>
      </div>

      {/* Top Events + Browsers + Cities */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Custom Events */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
            ⚡ Eventos Customizados
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topEvents} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradEvents" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 10, fontWeight: 700 }} width={120} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="count" fill="url(#gradEvents)" radius={[0, 8, 8, 0]} animationDuration={800} name="Disparos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browsers */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
            🌐 Navegadores
          </h2>
          <div className="space-y-4">
            {data.topBrowsers.map((b, i) => {
              const icons: Record<string, string> = { Chrome: '🟢', Safari: '🔵', Firefox: '🟠', Edge: '🟢', Opera: '🔴', Samsung: '🟣' };
              const icon = Object.entries(icons).find(([k]) => b.name?.includes(k))?.[1] || '🌐';
              const max = data.topBrowsers[0]?.count || 1;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">{icon} {b.name}</span>
                    <span className="font-bold text-muted">{b.count.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-light">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${(b.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {data.topBrowsers.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados de browsers.</p>}
          </div>
        </div>

        {/* Cities */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 font-[var(--font-display)] text-lg font-extrabold uppercase tracking-wide text-foreground">
            📍 Top Cidades
          </h2>
          <div className="space-y-3">
            {data.topCities.map((c, i) => {
              const max = data.topCities[0]?.count || 1;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      <span className="text-muted mr-1">{i + 1}.</span>
                      {c.city}
                      {c.country && <span className="text-muted ml-1">({c.country})</span>}
                    </span>
                    <span className="font-bold text-amber-500">{c.count.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {data.topCities.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados de localização.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
