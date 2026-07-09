'use client';

import { Suspense, useEffect, useRef } from 'react';
import { initSession, trackEvent } from '@/lib/tracking';
import { usePathname, useSearchParams } from 'next/navigation';

function TrackingLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Refs for tracking state
  const entryTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const clickHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
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

    // Setup Rage Clicks
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const click = { x: e.clientX, y: e.clientY, time: now };
      
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
          const target = e.target as HTMLElement;
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);

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
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      handleLeave(); // Log when component unmounts (route change)
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [pathname, searchParams]);

  return null;
}

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TrackingLogic />
      </Suspense>
      {children}
    </>
  );
}
