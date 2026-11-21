'use client';

import { Suspense, useEffect, useRef } from 'react';
import { initSession, isStandalone, trackEvent } from '@/lib/tracking';
import { usePathname, useSearchParams } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';

function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    trackEvent('web_vitals', undefined, undefined, {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id
    });
  });
  return null;
}

// Primeiro page_view desta aba carrega referrer/UTM (a origem da visita).
let pageViewSentInTab = false;

function TrackingLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Refs for tracking state
  const entryTimeRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const clickHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  

  useEffect(() => {
    // Disable tracking on admin routes
    if (pathname.includes('/admin')) return;

    // UTMs and Referrer tracking handled in initSession
    initSession();

    // Page view: base de acessos, páginas e origem de cada visita no painel de insights.
    const firstInTab = !pageViewSentInTab;
    pageViewSentInTab = true;
    const q = searchParams.get('q');
    trackEvent('page_view', undefined, undefined, {
      path: pathname,
      // Aberto pelo app instalado: base da penetração do app no painel.
      app: isStandalone(),
      ...(q ? { q: q.slice(0, 200) } : {}),
      ...(firstInTab ? {
        landing: true,
        referrer: document.referrer || '',
        utm_source: searchParams.get('utm_source') || '',
        utm_medium: searchParams.get('utm_medium') || '',
        utm_campaign: searchParams.get('utm_campaign') || '',
      } : {}),
    });

    // Reset tracking state on path change
    entryTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    
    // Setup Scroll Tracking
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentage = (scrollY / height) * 100;
      
      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (percentage >= m && maxScrollRef.current < m) {
          maxScrollRef.current = m;
          trackEvent('scroll_depth', undefined, undefined, { depth_percentage: m, path: pathname });
        }
      }
    };

    // Setup Click Tracking (Rage, Dead, Heatmap)
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const click = { x: e.pageX, y: e.pageY, time: now };

      // 0. Cliques que saem do site (ofertas das lojas e outros links externos)
      const link = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (link) {
        let url: URL | null = null;
        try { url = new URL(link.href, window.location.href); } catch {}
        if (link.dataset.track === 'offer') {
          trackEvent('offer_click', link.dataset.product || undefined, Number(link.dataset.price) || undefined, {
            store: link.dataset.store || '',
            product_path: link.dataset.productPath || '',
            position: Number(link.dataset.position) || null,
            placement: link.dataset.placement || 'lista',
            host: url?.hostname || '',
          });
        } else if (url && url.hostname !== window.location.hostname && /^https?:$/.test(url.protocol)) {
          trackEvent('outbound_click', undefined, undefined, { host: url.hostname, url: url.href.slice(0, 300), label: (link.textContent || '').trim().slice(0, 80) });
        }
      }
      
      // 1. Heatmap Click
      trackEvent('heatmap_click', undefined, undefined, {
        x: e.pageX, y: e.pageY,
        vw: window.innerWidth, vh: document.documentElement.scrollHeight,
        path: pathname
      });

      // 2. Dead Click Detection
      const target = e.target as HTMLElement;
      // Consider clickable if it's an interactive tag or explicitly has pointer cursor
      const isClickable = target.closest('a, button, input, select, textarea') || window.getComputedStyle(target).cursor === 'pointer';
      
      if (!isClickable) {
        trackEvent('dead_click', undefined, undefined, {
          path: pathname,
          tag: target.tagName,
          className: target.className
        });
      }
      
      // 3. Rage Clicks
      // Keep only clicks from the last 1 second
      clickHistoryRef.current = clickHistoryRef.current.filter(c => now - c.time < 1000);
      clickHistoryRef.current.push(click);
      
      if (clickHistoryRef.current.length >= 3) {
        // Check if clicks are close to each other (within 50px radius)
        const first = clickHistoryRef.current[0];
        const isRage = clickHistoryRef.current.every(c => 
          Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50
        );
        
        if (isRage) {
          trackEvent('rage_click', undefined, undefined, {
            path: pathname,
            tag: target.tagName,
            id: target.id,
            className: target.className,
            x: e.pageX,
            y: e.pageY
          });
          // Reset after logging to prevent spam
          clickHistoryRef.current = [];
        }
      }
    };

    // Movimento do mouse não é mais rastreado: gerava uma requisição a cada 1,5 s sem uso real.

    // Error Tracking
    const handleError = (e: ErrorEvent) => {
      trackEvent('js_error', undefined, undefined, {
        path: pathname,
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
      });
    };
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      trackEvent('js_error', undefined, undefined, {
        path: pathname,
        message: e.reason ? e.reason.toString() : 'Unhandled Rejection'
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Visibility Observer for CTA buttons or important sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackEvent('element_visible', undefined, undefined, {
            path: pathname,
            tag: entry.target.tagName,
            id: entry.target.id,
            className: entry.target.className
          });
          observer.unobserve(entry.target); // Track once per page load
        }
      });
    }, { threshold: 0.5 });
    
    // Give DOM time to render before observing
    const timeoutId = setTimeout(() => {
      document.querySelectorAll('[data-track-visibility="true"]').forEach(el => observer.observe(el));
    }, 1500);

    // Setup Page Leave / Dwell Time
    const handleLeave = () => {
      const dwellTimeSeconds = Math.floor((Date.now() - entryTimeRef.current) / 1000);
      if (dwellTimeSeconds > 0) {
        trackEvent('page_leave', undefined, undefined, {
          path: pathname,
          dwell_time_seconds: dwellTimeSeconds
        });
      }
    };
    
    // beforeunload catches closing tabs or navigating away externally
    const handleAbandon = () => {};

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('beforeunload', handleAbandon);

    return () => {
      handleLeave(); // Log when component unmounts (route change)
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('beforeunload', handleLeave);
      window.removeEventListener('beforeunload', handleAbandon);
      observer.disconnect();
    };
  }, [pathname, searchParams]);

  return null;
}

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TrackingLogic />
        <WebVitalsTracker />
      </Suspense>
      {children}
    </>
  );
}
