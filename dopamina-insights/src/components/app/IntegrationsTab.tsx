'use client';

import { useEffect, useState } from 'react';
import PostHogTab from '@/components/insights/PostHogTab';
import HubSpotTab from '@/components/insights/HubSpotTab';
import type { HubSpotCrmData, PostHogData } from '@/components/insights/types';

type State<T> = { data: T | null; error: string | null; loading: boolean };

function useIntegration<T>(url: string) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(j => { if (alive) setState({ data: j.data ?? null, error: j.error ?? null, loading: false }); })
      .catch(e => { if (alive) setState({ data: null, error: e instanceof Error ? e.message : 'Falha', loading: false }); });
    return () => { alive = false; };
  }, [url]);
  return state;
}

/** Fontes externas (PostHog e HubSpot), mantidas da versão anterior do painel. */
export default function IntegrationsTab() {
  const [which, setWhich] = useState<'posthog' | 'hubspot'>('posthog');
  const posthog = useIntegration<PostHogData>('/api/analytics/posthog');
  const hubspot = useIntegration<HubSpotCrmData>('/api/analytics/hubspot');
  const current = which === 'posthog' ? posthog : hubspot;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-1" role="tablist" aria-label="Integração">
        {(['posthog', 'hubspot'] as const).map(k => (
          <button key={k} type="button" role="tab" aria-selected={which === k} onClick={() => setWhich(k)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${which === k ? 'bg-foreground text-background' : 'text-secondary hover:bg-surface-light'}`}>
            {k === 'posthog' ? 'PostHog' : 'HubSpot'}
          </button>
        ))}
      </div>
      {current.loading ? <div className="h-64 animate-pulse rounded-2xl bg-surface-light" /> : which === 'posthog'
        ? <PostHogTab data={posthog.data} error={posthog.error} />
        : <HubSpotTab data={hubspot.data} error={hubspot.error} />}
    </div>
  );
}
