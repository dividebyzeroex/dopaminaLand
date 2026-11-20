'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Gauge, LayoutDashboard, Loader2, Lock, LogOut, Package, Plug, RefreshCw, Search, Users } from 'lucide-react';
import { RANGE_KEYS } from '@/lib/analytics/core';
import { usePolling, useNow, type Live, type RangeKey, type Report } from './data';
import LiveTab, { Skeleton } from './LiveTab';
import OverviewTab from './OverviewTab';
import SearchesTab from './SearchesTab';
import ProductsTab from './ProductsTab';
import VisitsTab from './VisitsTab';
import QualityTab from './QualityTab';
import IntegrationsTab from './IntegrationsTab';
import VisitorDrawer from './VisitorDrawer';
import { ago } from './ui';

const TABS = [
  { id: 'live', label: 'Ao vivo', icon: Activity },
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'searches', label: 'Buscas', icon: Search },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'visits', label: 'Visitas', icon: Users },
  { id: 'quality', label: 'Qualidade', icon: Gauge },
  { id: 'integrations', label: 'Integrações', icon: Plug },
] as const;
type TabId = (typeof TABS)[number]['id'];

const RANGE_LABEL: Record<RangeKey, string> = { today: 'Hoje', '24h': '24 h', '7d': '7 dias', '30d': '30 dias', '90d': '90 dias' };
const LIVE_MS = 10_000;
const REPORT_MS = 60_000;

function readPrefs(): { tab: TabId; range: RangeKey } {
  try {
    const saved = JSON.parse(localStorage.getItem('insights_prefs') || '{}');
    return {
      tab: TABS.some(t => t.id === saved.tab) ? saved.tab : 'live',
      range: RANGE_KEYS.includes(saved.range) ? saved.range : '7d',
    };
  } catch { return { tab: 'live', range: '7d' }; }
}

export default function InsightsApp() {
  const [auth, setAuth] = useState<{ checked: boolean; ok: boolean; passwordConfigured: boolean }>({ checked: false, ok: false, passwordConfigured: true });

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' }).then(r => r.json())
      .then(j => setAuth({ checked: true, ok: Boolean(j.authenticated), passwordConfigured: Boolean(j.passwordConfigured) }))
      .catch(() => setAuth({ checked: true, ok: false, passwordConfigured: true }));
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    setAuth(a => ({ ...a, ok: false }));
  }, []);

  if (!auth.checked) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted" aria-label="Carregando" /></div>;
  if (!auth.ok) return <Login onDone={passwordConfigured => setAuth({ checked: true, ok: true, passwordConfigured })} />;
  return <Dashboard passwordConfigured={auth.passwordConfigured} onLogout={logout} onExpired={() => setAuth(a => ({ ...a, ok: false }))} />;
}

function Login({ onDone }: { onDone: (passwordConfigured: boolean) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Falha no login');
      onDone(Boolean(j.passwordConfigured));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally { setBusy(false); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-light"><Lock className="h-5 w-5 text-foreground" aria-hidden="true" /></div>
        <h1 className="text-lg font-semibold text-foreground">Dopamina Insights</h1>
        <p className="mt-1 text-sm text-muted">Acessos, buscas e produtos do dopaminado.com.br.</p>
        <label htmlFor="pw" className="mt-5 block text-xs font-medium text-secondary">Senha</label>
        <input id="pw" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} autoFocus
          className="mt-1 w-full rounded-xl border border-border bg-surface-light px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
        {error && <p role="alert" className="mt-2 text-sm text-critical">{error}</p>}
        <button type="submit" disabled={busy || !password} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Entrar
        </button>
      </form>
    </main>
  );
}

function Dashboard({ passwordConfigured, onLogout, onExpired }: { passwordConfigured: boolean; onLogout: () => void; onExpired: () => void }) {
  // O painel só monta depois da checagem de login (no navegador), então ler o localStorage aqui é seguro.
  const [tab, setTab] = useState<TabId>(() => readPrefs().tab);
  const [range, setRange] = useState<RangeKey>(() => readPrefs().range);
  const [visitor, setVisitor] = useState<string | null>(null);
  const now = useNow();

  useEffect(() => { try { localStorage.setItem('insights_prefs', JSON.stringify({ tab, range })); } catch {} }, [tab, range]);

  const isLive = tab === 'live';
  const needsReport = !isLive && tab !== 'integrations';
  const live = usePolling<Live>(isLive ? '/api/insights/live' : null, LIVE_MS, onExpired);
  const report = usePolling<Report>(needsReport ? `/api/insights/report?range=${range}` : null, REPORT_MS, onExpired);
  const active = isLive ? live : report;
  const closeVisitor = useCallback(() => setVisitor(null), []);

  return (
    <div className="min-h-screen w-full min-w-0">
      <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-foreground">Dopamina Insights</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              {isLive && <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--good)]" aria-hidden="true" />}
              {active.updatedAt ? `Atualizado ${ago(active.updatedAt, now)} · ${isLive ? 'a cada 10 s' : 'a cada 1 min'}` : 'Carregando…'}
            </p>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            {needsReport && (
              <div className="flex rounded-full border border-border bg-surface p-0.5" role="radiogroup" aria-label="Período">
                {RANGE_KEYS.map(k => (
                  <button key={k} type="button" role="radio" aria-checked={range === k} onClick={() => setRange(k)}
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium transition sm:px-3 ${range === k ? 'bg-foreground text-background' : 'text-secondary hover:text-foreground'}`}>
                    {RANGE_LABEL[k]}
                  </button>
                ))}
              </div>
            )}
            <div className="ml-auto flex gap-2 sm:ml-0">
            {tab !== 'integrations' && (
              <button type="button" onClick={() => void active.reload()} className="rounded-full border border-border bg-surface p-2 text-secondary hover:text-foreground" aria-label="Atualizar agora">
                <RefreshCw className={`h-4 w-4 ${active.loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={onLogout} className="rounded-full border border-border bg-surface p-2 text-secondary hover:text-foreground" aria-label="Sair"><LogOut className="h-4 w-4" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
        <nav className="no-scrollbar mx-auto mt-2 flex max-w-7xl gap-1 overflow-x-auto px-3 sm:px-5" aria-label="Seções">
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 pb-2.5 pt-1 text-sm font-medium transition ${tab === t.id ? 'border-[var(--primary)] text-foreground' : 'border-transparent text-muted hover:text-foreground'}`}>
              <t.icon className="h-4 w-4" aria-hidden="true" />{t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6">
        {!passwordConfigured && (
          <p className="rounded-xl border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] px-4 py-2.5 text-xs text-foreground">
            O painel está usando a senha padrão. Defina <code className="font-mono">INSIGHTS_PASSWORD</code> no projeto da Vercel para trocá-la.
          </p>
        )}
        {report.data && !report.data.serviceRole && needsReport && (
          <p className="rounded-xl border border-border bg-surface-light px-4 py-2.5 text-xs text-secondary">
            Lendo dados com a chave pública do Supabase. Configure <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> neste projeto antes de fechar a leitura pública das tabelas (migration 003).
          </p>
        )}
        {report.data?.truncated && needsReport && <p className="rounded-xl border border-border bg-surface-light px-4 py-2.5 text-xs text-secondary">Período com eventos demais: o relatório usa os primeiros 60 mil. Escolha um período menor para números completos.</p>}
        {active.error && <p role="alert" className="rounded-xl border border-[var(--critical)] px-4 py-2.5 text-sm text-critical">Não foi possível atualizar: {active.error}</p>}

        {tab === 'live' && <LiveTab live={live.data} now={now} onVisitor={setVisitor} />}
        {needsReport && !report.data && <Skeleton />}
        {needsReport && report.data && (
          <>
            {tab === 'overview' && <OverviewTab report={report.data} />}
            {tab === 'searches' && <SearchesTab report={report.data} now={now} onVisitor={setVisitor} />}
            {tab === 'products' && <ProductsTab report={report.data} now={now} onVisitor={setVisitor} />}
            {tab === 'visits' && <VisitsTab report={report.data} onVisitor={setVisitor} />}
            {tab === 'quality' && <QualityTab report={report.data} now={now} />}
          </>
        )}
        {tab === 'integrations' && <IntegrationsTab />}
      </main>
      {visitor && <VisitorDrawer id={visitor} onClose={closeVisitor} />}
    </div>
  );
}
