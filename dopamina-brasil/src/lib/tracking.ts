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

export async function initSession(forceUpdate: boolean = false) {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  const initialized = sessionStorage.getItem('dopamina_session_initialized');
  
  // Only track session once per browser session (unless forced)
  if (initialized && !forceUpdate) return;

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source') || '';
  const utm_medium = urlParams.get('utm_medium') || '';
  const utm_campaign = urlParams.get('utm_campaign') || '';
  const referrer = document.referrer || '';

  // Extrair metadados nativos de Hardware e Conexão (se suportados pelo browser)
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  let email = '';
  let nickname = '';
  try {
    const saved = localStorage.getItem('dopamina-game');
    if (saved) {
      const parsed = JSON.parse(saved);
      email = parsed.email || '';
      nickname = parsed.nickname || '';
    }
  } catch {}

  const deviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceMemory: nav.deviceMemory || null, // RAM estimate in GB
    hardwareConcurrency: nav.hardwareConcurrency || null, // CPU cores
    connectionType: connection ? connection.effectiveType : null, // 4g, 3g, etc
    dataSaver: connection ? connection.saveData : false, // true if user is on restricted data
    prefersDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    utm_source,
    utm_medium,
    utm_campaign,
    referrer,
    email,
    nickname
  };

  // Simulação de Gênero para composição de Dashboard de Vendas por Impulso
  // Como não há coleta real, atribuímos uma persona simulada (probabilística)
  let mockGender = localStorage.getItem('dopamina_mock_gender');
  if (!mockGender) {
    mockGender = Math.random() > 0.45 ? 'Feminino' : 'Masculino';
    localStorage.setItem('dopamina_mock_gender', mockGender);
  }

  try {
    await fetch('/api/track-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        session_id: sessionId, 
        device_info: deviceInfo,
        mock_gender: mockGender 
      }),
      keepalive: true
    });
    sessionStorage.setItem('dopamina_session_initialized', 'true');
  } catch (error) {
    console.error('Failed to init tracking session', error);
  }
}

export async function trackEvent(
  eventType: 'view_item' | 'add_to_cart' | 'dwell_time_exceeded' | 'fake_checkout' | 'scroll_depth' | 'page_leave' | 'rage_click' | 'share_product' | 'search' | 'cart_abandoned' | 'checkout_basket' | 'dead_click' | 'cursor_frustration' | 'js_error' | 'element_visible' | 'heatmap_click' | 'heatmap_move' | 'web_vitals' | 'tracking_update' | 'digital_dna_scan' | 'narrator_interaction' | 'neuro_xray_toggle' | 'resistance_training_start' | 'resistance_training_fail' | 'resistance_training_complete' | 'wrapped_generated' | 'wrapped_shared',
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
      }),
      keepalive: true
    });
  } catch (error) {
    console.error(`Failed to track event ${eventType}`, error);
  }
}
