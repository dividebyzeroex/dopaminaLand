'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Kpis, RangeKey, audienceOf, coverageOf, funnelOf, liveOf, pagesOf, productsOf, qualityOf, resolveRange, searchesOf, seriesOf, visitRows,
} from '@/lib/analytics/core';

export type Report = {
  range: ReturnType<typeof resolveRange>;
  generatedAt: number;
  truncated: boolean;
  serviceRole: boolean;
  eventCount: number;
  kpis: Kpis;
  prevKpis: Kpis;
  series: ReturnType<typeof seriesOf>;
  funnel: ReturnType<typeof funnelOf>;
  searches: ReturnType<typeof searchesOf>;
  products: ReturnType<typeof productsOf>;
  audience: ReturnType<typeof audienceOf>;
  pages: ReturnType<typeof pagesOf>;
  quality: ReturnType<typeof qualityOf>;
  coverage: ReturnType<typeof coverageOf>;
  visits: ReturnType<typeof visitRows>;
};

export type Live = ReturnType<typeof liveOf> & {
  now: number;
  today: Kpis;
  todayTerms: { ts: number; term: string; results: number | null }[];
};

export type { RangeKey };

/** Busca JSON periodicamente; pausa com a aba oculta e atualiza ao voltar. */
export function usePolling<T>(url: string | null, intervalMs: number, onUnauthorized: () => void) {
  // Guarda a URL de origem: ao trocar de período, o dado antigo deixa de valer na hora.
  const [result, setResult] = useState<{ url: string; data: T } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const inFlight = useRef(false);
  const unauthorized = useRef(onUnauthorized);
  useEffect(() => { unauthorized.current = onUnauthorized; }, [onUnauthorized]);

  const load = useCallback(async () => {
    if (!url || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 401) { unauthorized.current(); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
      setResult({ url, data: json as T });
      setError(null);
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, intervalMs);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearTimeout(first); clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [url, intervalMs, load]);

  const data = result && result.url === url ? result.data : null;
  return { data, error, loading, updatedAt, reload: load };
}

/** Relógio que avança a cada segundo, para os "há X s". */
export function useNow(stepMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), stepMs); return () => clearInterval(t); }, [stepMs]);
  return now;
}
