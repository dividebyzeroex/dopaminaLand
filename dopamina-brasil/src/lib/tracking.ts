'use client';

// Function to generate a random UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('dopamina_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('dopamina_session_id', sessionId);
  }
  return sessionId;
}

export async function initSession() {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  const initialized = sessionStorage.getItem('dopamina_session_initialized');
  
  // Only track session once per browser session
  if (initialized) return;

  const deviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  try {
    await fetch('/api/track-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, device_info: deviceInfo })
    });
    sessionStorage.setItem('dopamina_session_initialized', 'true');
  } catch (error) {
    console.error('Failed to init tracking session', error);
  }
}

export async function trackEvent(
  eventType: 'view_item' | 'add_to_cart' | 'dwell_time_exceeded' | 'fake_checkout',
  productId?: string,
  priceDisplayed?: number,
  metadata?: any
) {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        product_id: productId,
        price_displayed: priceDisplayed,
        metadata: metadata
      })
    });
  } catch (error) {
    console.error(`Failed to track event ${eventType}`, error);
  }
}
