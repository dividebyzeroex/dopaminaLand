'use client';

import { useEffect, useRef } from 'react';

// Generates a simple pseudo-UUID for anonymous tracking
function generateAnonymousSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('dopamina_session_id');
  if (!sessionId) {
    sessionId = generateAnonymousSessionId();
    localStorage.setItem('dopamina_session_id', sessionId);
  }
  return sessionId;
}

export type IntentEventType = 'view_item' | 'add_to_cart' | 'fake_checkout' | 'dwell_time_exceeded';

interface TrackPayload {
  eventType: IntentEventType;
  productId?: number;
  priceDisplayed?: number;
  metadata?: Record<string, any>;
}

export function trackIntent(payload: TrackPayload) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  // Use sendBeacon for non-blocking analytics if available
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const data = new Blob([JSON.stringify({ ...payload, sessionId })], { type: 'application/json' });
    navigator.sendBeacon('/api/track', data);
  } else {
    // Fallback to fetch
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }
}

export function useIntentTracker(productId?: number, priceDisplayed?: number) {
  const dwellTimerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!productId) return;

    // Track view immediately
    trackIntent({ eventType: 'view_item', productId, priceDisplayed });

    // Track dwell time (e.g., > 10 seconds means high interest)
    dwellTimerRef.current = setTimeout(() => {
      trackIntent({ eventType: 'dwell_time_exceeded', productId, priceDisplayed });
    }, 10000);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [productId, priceDisplayed]);

  const trackAddToCart = () => trackIntent({ eventType: 'add_to_cart', productId, priceDisplayed });
  const trackCheckout = (totalValue: number) => trackIntent({ eventType: 'fake_checkout', metadata: { totalValue } });

  return { trackAddToCart, trackCheckout };
}
