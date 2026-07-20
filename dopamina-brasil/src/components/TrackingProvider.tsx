'use client';

import { Suspense, useEffect, useRef } from 'react';
import { initSession, trackEvent } from '@/lib/tracking';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
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

function TrackingLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Refs for tracking state
  const entryTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const clickHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const mouseMoveHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const lastHeatmapMoveRef = useRef<number>(0);
  
  const { items, totalFakePrice } = useCart();
  const cartRef = useRef({ items, totalFakePrice });
  useEffect(() => {
    cartRef.current = { items, totalFakePrice };
  }, [items, totalFakePrice]);

  useEffect(() => {
    // Disable tracking on admin routes
    if (pathname.includes('/admin')) return;

    // UTMs and Referrer tracking handled in initSession
    initSession();

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
      const click = { x: e.clientX, y: e.clientY, time: now };
      
      // 1. Heatmap Click
      trackEvent('heatmap_click', undefined, undefined, {
        x: e.clientX, y: e.clientY,
        vw: window.innerWidth, vh: window.innerHeight,
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
            x: e.clientX,
            y: e.clientY
          });
          // Reset after logging to prevent spam
          clickHistoryRef.current = [];
        }
      }
    };

    // Mouse Move Tracking (Frustration & Heatmap Move)
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // 1. Throttle Heatmap Move to once every 1.5 seconds
      if (now - lastHeatmapMoveRef.current > 1500) {
        trackEvent('heatmap_move', undefined, undefined, {
          x: e.clientX, y: e.clientY,
          vw: window.innerWidth, vh: window.innerHeight,
          path: pathname
        });
        lastHeatmapMoveRef.current = now;
      }

      // 2. Frustration (Jiggle) Detection
      const move = { x: e.clientX, y: e.clientY, time: now };
      mouseMoveHistoryRef.current.push(move);
      // Keep history for 1 second
      mouseMoveHistoryRef.current = mouseMoveHistoryRef.current.filter(m => now - m.time < 1000);

      // If moved a lot of times rapidly in different directions within 1 second
      if (mouseMoveHistoryRef.current.length > 20) {
        let directionChanges = 0;
        for (let i = 2; i < mouseMoveHistoryRef.current.length; i++) {
          const dx1 = mouseMoveHistoryRef.current[i-1].x - mouseMoveHistoryRef.current[i-2].x;
          const dx2 = mouseMoveHistoryRef.current[i].x - mouseMoveHistoryRef.current[i-1].x;
          if (dx1 * dx2 < 0) directionChanges++; // Changed horizontal direction
        }

        if (directionChanges > 5) {
          trackEvent('cursor_frustration', undefined, undefined, {
            path: pathname,
            x: e.clientX, y: e.clientY
          });
          mouseMoveHistoryRef.current = []; // Reset
        }
      }
    };

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
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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
    const handleAbandon = () => {
      const { items, totalFakePrice } = cartRef.current;
      if (items.length > 0 && !pathname.includes('sucesso') && !pathname.includes('checkout')) {
        trackEvent('cart_abandoned', undefined, totalFakePrice, {
          path: pathname,
          items: items.map(i => ({ id: i.id, name: i.shortName, qty: i.quantity, price: i.salePrice }))
        });
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    window.addEventListener('beforeunload', handleAbandon);

    return () => {
      handleLeave(); // Log when component unmounts (route change)
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
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
