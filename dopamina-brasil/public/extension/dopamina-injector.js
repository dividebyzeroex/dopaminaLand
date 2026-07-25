(function () {
  if (window.__dopamina_universal_engine_active) {
    alert('⚡ Dopamina Anti-Truque já está ativo nesta página!');
    return;
  }
  window.__dopamina_universal_engine_active = true;

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

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    #dopamina-top-bar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 48px !important;
      background: rgba(10, 10, 15, 0.97) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border-bottom: 2px solid #ccff00 !important;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.85), 0 0 20px rgba(204, 255, 0, 0.15) !important;
      z-index: 2147483647 !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      margin: 0 !important;
      padding: 0 16px !important;
      display: flex !important;
      align-items: center !important;
      color: #ffffff !important;
    }
    .dopamina-badge {
      display: inline-block !important;
      position: relative !important;
      margin: 2px 6px !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      border: 1px dashed !important;
      font-size: 10px !important;
      font-weight: 900 !important;
      font-family: system-ui, sans-serif !important;
      cursor: help !important;
      z-index: 99999 !important;
      vertical-align: middle !important;
    }
    #dopamina-narrator {
      position: fixed !important;
      bottom: 16px !important;
      left: 16px !important;
      width: 320px !important;
      max-width: 90vw !important;
      background: rgba(9, 9, 11, 0.97) !important;
      backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(168, 85, 247, 0.5) !important;
      border-radius: 16px !important;
      padding: 14px 16px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.2) !important;
      z-index: 2147483646 !important;
      font-family: system-ui, sans-serif !important;
      color: #ffffff !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // Top Bar DOM
  const bar = document.createElement('div');
  bar.id = 'dopamina-top-bar';

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:8px;';
  left.innerHTML = `<b style="color:#ccff00;font-size:13px;letter-spacing:0.5px;">⚡ DOPAMINA</b><span style="background:rgba(204,255,0,0.15);border:1px solid rgba(204,255,0,0.3);color:#ccff00;padding:2px 6px;border-radius:99px;font-size:9px;font-weight:800;">ENGINE: ${storeName}</span>`;

  const mid = document.createElement('div');
  mid.id = 'dopamina-score-val';
  mid.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:11px;';
  mid.innerHTML = '<span style="font-weight:800;color:#22c55e;">🟢 ENGINE UNIVERSAL ATIVA</span>';

  const right = document.createElement('div');
  right.style.cssText = 'display:flex;align-items:center;gap:8px;';

  const btnXray = document.createElement('button');
  btnXray.textContent = '🔬 Raio-X ON';
  btnXray.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;cursor:pointer;';
  let isXray = true;
  btnXray.onclick = function () {
    isXray = !isXray;
    btnXray.textContent = isXray ? '🔬 Raio-X ON' : '🔬 Raio-X OFF';
    document.querySelectorAll('.dopamina-badge').forEach(b => {
      (b as HTMLElement).style.display = isXray ? 'inline-block' : 'none';
    });
  };

  const link = document.createElement('a');
  link.href = 'https://dopaminado.com.br';
  link.target = '_blank';
  link.style.cssText = 'background:#ccff00;color:#000;padding:4px 12px;border-radius:6px;font-weight:900;font-size:11px;text-decoration:none;';
  link.textContent = 'Dopamina Land ➔';

  const btnClose = document.createElement('button');
  btnClose.textContent = '✕';
  btnClose.style.cssText = 'background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;';
  btnClose.onclick = function () {
    bar.remove();
    document.getElementById('dopamina-narrator')?.remove();
  };

  right.appendChild(btnXray);
  right.appendChild(link);
  right.appendChild(btnClose);

  bar.appendChild(left);
  bar.appendChild(mid);
  bar.appendChild(right);
  (document.body || document.documentElement).appendChild(bar);

  // Narrator DOM
  const narrator = document.createElement('div');
  narrator.id = 'dopamina-narrator';
  narrator.innerHTML = `
    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #c084fc; margin-bottom: 6px;">
      <span>🧠 Consciência de Consumo</span>
      <button id="dopamina-close-narrator" style="background: transparent; border: none; color: #a1a1aa; cursor: pointer;">✕</button>
    </div>
    <p id="dopamina-narrator-text" style="font-size: 11px; color: #e4e4e7; line-height: 1.4; margin: 0;">
      Escaneando seletores dedicados de ${storeName}...
    </p>
  `;
  (document.body || document.documentElement).appendChild(narrator);
  document.getElementById('dopamina-close-narrator')?.addEventListener('click', () => narrator.remove());

  const seen = new Set();
  let eventSent = false;

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function scanDOM() {
    let count = 0;
    const counts: Record<string, number> = { ancoragem: 0, enquadramento: 0, escassez: 0, fomo: 0, social: 0, dor: 0 };

    function addBadge(el: Element, label: string, desc: string, bg: string, border: string, color: string, key: string) {
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
        addBadge(el, '⚓ Ancoragem', 'Preço riscado alto para ancorar a percepção de valor.', 'rgba(249,115,22,0.25)', '#f97316', '#f97316', 'ancoragem');
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

    mid.innerHTML = `<span style="font-weight:900;color:${scoreColor}; font-size:12px;">🚨 INDUÇÃO: ${dangerScore}/100</span><span style="color:#71717a;">|</span><span style="color:#a1a1aa; font-weight:600;">${pills.length > 0 ? pills.join(' · ') : count + ' gatilhos identificados'}</span>`;

    const msgEl = document.getElementById('dopamina-narrator-text');
    if (msgEl) {
      msgEl.textContent = count > 0
        ? `Auditamos ${count} gatilhos em ${storeName} (${pills.join(', ')}). A loja está usando esse ecossistema para influenciar sua decisão!`
        : `Analisando a estrutura de ${storeName}... Role a página para inspecionar outros blocos de produtos.`;
    }

    // --- WIDGET DE HISTÓRICO DE PREÇOS (Integração Bondfaro) ---
    if (!window.__dopamina_price_widget_injected) {
      window.__dopamina_price_widget_injected = true;
      let productName = document.querySelector('h1')?.textContent?.trim() || document.title.split('-')[0];
      let currentPriceNum = null;
      const priceSelectors = ['.ui-pdp-price__second-line .andes-money-amount__fraction', '.a-price-whole', '.price-template-price-block .price', '[data-testid="price-value"]'];
      for(let sel of priceSelectors) {
        let el = document.querySelector(sel);
        if (el) {
           let txt = el.textContent.replace(/[^0-9,]/g, '').replace(',', '.');
           if (txt) {
             currentPriceNum = parseFloat(txt);
             if (currentPriceNum > 0) break;
           }
        }
      }

      // Mais amplo para cobrir ML, Amazon, Shopee e genéricos
      const buyBoxSelectors = [
        '.ui-pdp-actions', '.ui-pdp-actions__container', 
        '#addToCart_feature_div', '#desktop_buybox', '#buybox',
        '.shopee-button-solid--primary', '.pdp-action-area',
        '.buy-box', '.buy-button', '[data-testid="buy-btn"]', 'button.button-buy'
      ];
      let buyBox = null;
      for(let sel of buyBoxSelectors) {
        buyBox = document.querySelector(sel);
        if (buyBox) break;
      }

      if (buyBox && productName) {
        // Inject loading skeleton
        const widget = document.createElement('div');
        widget.id = 'dopamina-price-widget';
        widget.style.cssText = 'margin: 16px 0; padding: 16px; background: rgba(9, 9, 11, 0.95); border: 1px solid #3f3f46; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: system-ui, sans-serif;';
        widget.innerHTML = `<div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:bold;color:#a1a1aa;"><div class="dopamina-spinner" style="width:14px;height:14px;border:2px solid #a1a1aa;border-top-color:transparent;border-radius:50%;animation:dopamina-spin 1s linear infinite;"></div>Consultando Mercado Livre/Bondfaro...</div>
        <style>@keyframes dopamina-spin { to { transform: rotate(360deg); } }</style>`;
        
        buyBox.parentNode.insertBefore(widget, buyBox);

        // Fetch real data
        fetch(`https://www.dopaminado.com.br/api/price-history?q=${encodeURIComponent(productName)}&current_price=${currentPriceNum || ''}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.history) {
              const minPrice = Math.min(...data.history) * 0.95;
              const maxPrice = Math.max(...data.history) * 1.05;
              
              const barsHtml = data.history.map(p => {
                const heightPct = ((p - minPrice) / (maxPrice - minPrice)) * 100;
                return `<div style="flex:1; display:flex; align-items:flex-end; justify-content:center; group relative;">
                  <div style="width:100%; max-width:6px; background:${data.is_fomo_alert ? '#f97316' : '#22c55e'}; height:${Math.max(10, heightPct)}%; border-radius:2px; opacity:0.8; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'" title="R$ ${p.toFixed(2)}"></div>
                </div>`;
              }).join('');

              widget.style.borderColor = data.is_fomo_alert ? '#f97316' : '#22c55e';
              widget.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:16px;">${data.is_fomo_alert ? '🚨' : '✅'}</span>
                    <span style="font-size:12px; font-weight:900; color:${data.is_fomo_alert ? '#f97316' : '#22c55e'}; text-transform:uppercase;">
                      ${data.is_fomo_alert ? 'Alerta de Falsa Escassez' : 'Preço de Mercado Justo'}
                    </span>
                  </div>
                  <span style="font-size:10px; font-weight:bold; color:#71717a; background:#18181b; padding:2px 6px; border-radius:4px; border:1px solid #27272a;">Bondfaro Sync</span>
                </div>
                <div style="font-size:12px; color:#e4e4e7; line-height:1.4; margin-bottom:16px; font-weight:500;">
                  ${data.message}
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                  <div style="font-size:10px; color:#71717a; font-weight:bold;">HISTÓRICO (ÚLTIMOS 30 DIAS)</div>
                  <div style="height:48px; display:flex; align-items:flex-end; gap:2px; background:rgba(0,0,0,0.2); padding:4px; border-radius:6px; border:1px solid #27272a;">
                    ${barsHtml}
                  </div>
                </div>
              `;
            } else {
              widget.remove();
            }
          }).catch(() => widget.remove());
      }
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
