import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// Generates a simple pseudo-UUID for anonymous tracking
function generateAnonymousSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getSessionId() {
  try {
    let sessionId = await AsyncStorage.getItem('dopamina_session_id');
    if (!sessionId) {
      sessionId = generateAnonymousSessionId();
      await AsyncStorage.setItem('dopamina_session_id', sessionId);
    }
    return sessionId;
  } catch (e) {
    return generateAnonymousSessionId();
  }
}

export type IntentEventType = 'view_item' | 'add_to_cart' | 'fake_checkout' | 'dwell_time_exceeded' | 'begin_checkout';

interface TrackPayload {
  eventType: IntentEventType;
  productId?: number;
  priceDisplayed?: number;
  metadata?: Record<string, any>;
}

export async function trackIntent(payload: TrackPayload) {
  const sessionId = await getSessionId();
  if (!sessionId) return;

  try {
    // Ensure session exists in the database
    await supabase.from('sessions').upsert(
      { session_id: sessionId },
      { onConflict: 'session_id', ignoreDuplicates: true }
    );

    const { error } = await supabase.from('intent_events').insert({
      session_id: sessionId,
      event_type: payload.eventType,
      product_id: payload.productId,
      price_displayed: payload.priceDisplayed,
      metadata: payload.metadata || {},
    });

    if (error) {
      console.warn('Failed to track intent:', error.message);
    }
  } catch (error) {
    console.warn('Error tracking intent:', error);
  }
}

export function useIntentTracker(
  productId?: number, 
  priceDisplayed?: number,
  options: { autoTrackView?: boolean } = { autoTrackView: true }
) {
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!productId || options.autoTrackView === false) return;

    // Track view immediately
    trackIntent({ eventType: 'view_item', productId, priceDisplayed });

    // Track dwell time (e.g., > 10 seconds means high interest)
    dwellTimerRef.current = setTimeout(() => {
      trackIntent({ eventType: 'dwell_time_exceeded', productId, priceDisplayed });
    }, 10000);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [productId, priceDisplayed, options.autoTrackView]);

  const trackAddToCart = () => trackIntent({ eventType: 'add_to_cart', productId, priceDisplayed });
  const trackCheckout = (totalValue: number) => trackIntent({ eventType: 'fake_checkout', metadata: { totalValue } });

  return { trackAddToCart, trackCheckout };
}
