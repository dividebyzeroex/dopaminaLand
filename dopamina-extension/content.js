(function () {
  if (window.__dopamina_extension_loaded) return;
  window.__dopamina_extension_loaded = true;

  const host = window.location.hostname.toLowerCase();
  let storeName = 'E-COMMERCE';
  if (host.includes('mercadolivre') || host.includes('mercadolibre')) storeName = 'MERCADO LIVRE';
  else if (host.includes('amazon')) storeName = 'AMAZON BRASIL';
  else if (host.includes('shopee')) storeName = 'SHOPEE';
  else if (host.includes('magazineluiza') || host.includes('magalu')) storeName = 'MAGALU';
  else if (host.includes('kabum')) storeName = 'KABUM!';
  else if (host.includes('aliexpress')) storeName = 'ALIEXPRESS';
  else if (host.includes('americanas')) storeName = 'AMERICANAS';
  else if (host.includes('casasbahia')) storeName = 'CASAS BAHIA';
  else if (host.includes('shein')) storeName = 'SHEIN';
  else if (host.includes('netshoes')) storeName = 'NETSHOES';

  // Audit State
  let isXRayActive = true;
  let eventSent = false;

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 1. Create Top Floating Bar
  const bar = document.createElement('div');
  bar.id = 'dopamina-top-bar';
  bar.innerHTML = `
    <div className="dopamina-bar-content">
      <div className="dopamina-brand">
        <span className="dopamina-logo">⚡ DOPAMINA</span>
        <span className="dopamina-tag">ENGINE: ${storeName}</span>
      </div>
      <div className="dopamina-stats" id="dopamina-score-container">
        <span className="dopamina-score-badge" id="dopamina-score">🛡️ Engine Universal Ativa...</span>
      </div>
      <div className="dopamina-actions">
        <button id="dopamina-toggle-xray" className="dopamina-btn">🔬 Raio-X ON</button>
        <a href="https://dopaminado.com.br" target="_blank" className="dopamina-btn dopamina-btn-neon">Dopamina Land ➔</a>
        <button id="dopamina-close-bar" className="dopamina-btn-icon">✕</button>
      </div>
    </div>
  `;
  (document.body || document.documentElement).prepend(bar);

  // 2. Create Narrador Bubble
  const narrator = document.createElement('div');
  narrator.id = 'dopamina-narrator';
  narrator.innerHTML = `
    <div className="dopamina-narrator-inner">
      <div className="dopamina-narrator-header">
        <span>🧠 Consciência de Consumo</span>
        <button id="dopamina-close-narrator">✕</button>
      </div>
      <p id="dopamina-narrator-text" className="dopamina-narrator-text">
        Auditando seletores de ${storeName}... Role a página para examinar as ofertas.
      </p>
    </div>
  `;
  (document.body || document.documentElement).appendChild(narrator);

  document.getElementById('dopamina-close-bar')?.addEventListener('click', () => bar.remove());
  document.getElementById('dopamina-close-narrator')?.addEventListener('click', () => narrator.remove());

  document.getElementById('dopamina-toggle-xray')?.addEventListener('click', (e) => {
    isXRayActive = !isXRayActive;
    e.target.textContent = isXRayActive ? '🔬 Raio-X ON' : '🔬 Raio-X OFF';
    document.querySelectorAll('.dopamina-badge').forEach(b => {
      b.style.display = isXRayActive ? 'inline-block' : 'none';
    });
  });

  const seen = new Set();
  function scanDOM() {
    let count = 0;
    const counts = { ancoragem: 0, enquadramento: 0, escassez: 0, fomo: 0, social: 0, dor: 0 };

    function addBadge(el, label, desc, bg, border, color, key) {
      if (seen.has(el) || count >= 12) return;
      seen.add(el);
      count++;
      counts[key] = (counts[key] || 0) + 1;
      const b = document.createElement('span');
      b.className = 'dopamina-badge';
      b.style.cssText = `background:${bg} !important; border-color:${border} !important; color:${color} !important;`;
      b.title = desc;
      b.textContent = label;
      if (el.parentNode) el.parentNode.insertBefore(b, el.nextSibling);
    }

    // 1. Ancoragem de Preço
    const priceSel = [
      '.ui-pdp-price__original-value', 'span.andes-money-amount--previous', '.ui-search-price__part--original',
      '.a-text-price[data-a-strike="true"]', '.basisPrice .a-offscreen', '.a-color-secondary.a-text-strike',
      '._2MaB83', '.pq2W2k', '.p9c8gA', '[data-testid="price-original"]', '.oldPrice', '[class*="precoAntigo"]',
      '.price--originalText--', '.origin-price', 's', 'del', 'strike', '[class*="old-price"]', '[class*="original-price"]',
      '[class*="price-de"]', '[class*="anterior"]', '[style*="line-through"]'
    ].join(',');

    document.querySelectorAll(priceSel).forEach(el => {
      const txt = (el.textContent || '').trim();
      if (txt.match(/R\$\s*\d+/) || txt.match(/\$\s*\d+/) || el.tagName === 'S' || el.tagName === 'DEL' || el.tagName === 'STRIKE') {
        addBadge(el, '⚓ Ancoragem', 'Preço riscado alto para ancorar percepção de valor.', 'rgba(249,115,22,0.25)', '#f97316', '#f97316', 'ancoragem');
      }
    });

    // Fallback Computado para CSS line-through
    if (counts.ancoragem === 0) {
      document.querySelectorAll('span, p, div, b, strong').forEach(el => {
        if (el.children.length > 0) return;
        const style = window.getComputedStyle(el);
        if (style.textDecorationLine.includes('line-through') || style.textDecoration.includes('line-through')) {
          addBadge(el, '⚓ Ancoragem', 'Estilo riscado computado no elemento.', 'rgba(249,115,22,0.25)', '#f97316', '#f97316', 'ancoragem');
        }
      });
    }

    // 2. Enquadramento / Desconto
    const discSel = [
      '.savingsPercentage', '.reinventPriceSavingsPercentageMargin', '.ui-pdp-discount', '._2tWj2x', '.shopee-badge',
      '[data-testid="price-discount"]', '.discountTag', '.price--discount--',
      '[class*="discount"]', '[class*="badge"]', '[class*="tag"]', '[class*="saving"]', '[class*="off"]'
    ].join(',');

    document.querySelectorAll(discSel).forEach(el => {
      const txt = (el.textContent || '').toLowerCase();
      if (txt.includes('%') || txt.includes('off') || txt.includes('desconto')) {
        addBadge(el, '🏷️ Enquadramento', 'Selo de porcentagem para inflar o valor do desconto.', 'rgba(59,130,246,0.25)', '#3b82f6', '#3b82f6', 'enquadramento');
      }
    });

    // 3. Escassez / Timers
    const timerSel = [
      '#dealBadgeSupportingText', '.dealTimer', '#dealClock', '.ui-pdp-promotions-pill', '.flash-sale-timer',
      '.shopee-countdown', '[data-testid="badge-timer"]', '.timerText', '[class*="cronometro"]',
      '[class*="timer"]', '[class*="countdown"]', '[class*="flash"]', '[class*="oferta"]'
    ].join(',');

    document.querySelectorAll(timerSel).forEach(el => {
      addBadge(el, '⏰ Escassez', 'Contagem regressiva para forçar compra impulsiva.', 'rgba(234,179,8,0.25)', '#eab308', '#eab308', 'escassez');
    });

    // 4. FOMO & Prova Social & Dor Mitigada
    document.querySelectorAll('p, span, div, strong, b, h1, h2, h3').forEach(el => {
      if (el.children.length > 0) return;
      const txt = (el.textContent || '').toLowerCase().trim();
      if (txt.includes('restam') || txt.includes('últimas unidades') || txt.includes('estoque baixo') || txt.includes('só hoje') || (txt.includes('apenas') && txt.includes('estoque'))) {
        addBadge(el, '🔴 FOMO', 'Estoque limitadíssimo para gerar medo de perder a compra.', 'rgba(239,68,68,0.25)', '#ef4444', '#ef4444', 'fomo');
      } else if (txt.includes('mais vendido') || txt.includes('nº 1 em') || txt.includes('comprados nas') || txt.includes('comprados no mês') || txt.includes('em alta') || txt.includes('vendidos')) {
        addBadge(el, '⭐ Prova Social', 'Popularidade destacada para induzir comportamento de manada.', 'rgba(168,85,247,0.25)', '#a855f7', '#a855f7', 'social');
      } else if (txt.includes('12x sem juros') || txt.includes('10x sem juros') || txt.includes('frete grátis') || txt.includes('cupom')) {
        addBadge(el, '💸 Dor Mitigada', 'Parcelamento e frete grátis para amortecer a dor do pagamento.', 'rgba(34,197,94,0.25)', '#22c55e', '#22c55e', 'dor');
      }
    });

    const dangerScore = Math.min(99, 35 + count * 9);
    const scoreColor = dangerScore > 65 ? '#ef4444' : '#eab308';
    const pills = [];
    if (counts.ancoragem > 0) pills.push(`⚓ ${counts.ancoragem} Ancoragem`);
    if (counts.enquadramento > 0) pills.push(`🏷️ ${counts.enquadramento} Desconto`);
    if (counts.escassez > 0) pills.push(`⏰ ${counts.escassez} Timer`);
    if (counts.fomo > 0) pills.push(`🔴 ${counts.fomo} FOMO`);
    if (counts.social > 0) pills.push(`⭐ ${counts.social} Social`);
    if (counts.dor > 0) pills.push(`💸 ${counts.dor} Facilitadores`);

    const scoreContainer = document.getElementById('dopamina-score-container');
    if (scoreContainer) {
      scoreContainer.innerHTML = `<span style="font-weight:900;color:${scoreColor}; font-size:12px;">🚨 INDUÇÃO: ${dangerScore}/100</span><span style="color:#71717a;">|</span><span style="color:#a1a1aa; font-weight:600;">${pills.length > 0 ? pills.join(' · ') : count + ' gatilhos identificados'}</span>`;
    }

    const msgEl = document.getElementById('dopamina-narrator-text');
    if (msgEl) {
      msgEl.textContent = count > 0
        ? `Auditamos ${count} gatilhos em ${storeName} (${pills.join(', ')}). A loja está usando esse ecossistema para influenciar sua decisão!`
        : `Analisando a estrutura de ${storeName}... Role a página para inspecionar outros blocos de produtos.`;
    }

    // Transmit Real Telemetry Event to Supabase API with valid UUID v4
    if (!eventSent) {
      eventSent = true;
      try {
        fetch('https://www.dopaminado.com.br/api/track-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: generateUUID(),
            event_type: 'dark_pattern_audit',
            product_id: storeName,
            price_displayed: dangerScore,
            metadata: {
              store_name: storeName,
              url: window.location.href,
              danger_score: dangerScore,
              counts: counts,
              triggers_count: count
            }
          }),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }
  }

  scanDOM();
  setTimeout(scanDOM, 500);
  setTimeout(scanDOM, 1500);
  setTimeout(scanDOM, 3000);
})();
