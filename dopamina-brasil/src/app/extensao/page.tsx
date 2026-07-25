'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

export default function ExtensaoPage() {
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const bookmarkletCode = "javascript:void((function(){(function () { if (window.__dopamina_universal_engine_active) { alert('⚡ Dopamina Anti-Truque já está ativo nesta página!'); return; } window.__dopamina_universal_engine_active = true; const host = window.location.hostname.toLowerCase(); let storeName = 'E-COMMERCE'; if (host.includes('mercadolivre') || host.includes('mercadolibre')) storeName = 'MERCADO LIVRE'; else if (host.includes('amazon')) storeName = 'AMAZON BRASIL'; else if (host.includes('shopee')) storeName = 'SHOPEE'; else if (host.includes('magazineluiza') || host.includes('magalu')) storeName = 'MAGALU'; else if (host.includes('fastshop')) storeName = 'FAST SHOP'; else if (host.includes('kabum')) storeName = 'KABUM!'; else if (host.includes('aliexpress')) storeName = 'ALIEXPRESS'; else if (host.includes('americanas')) storeName = 'AMERICANAS'; else if (host.includes('casasbahia')) storeName = 'CASAS BAHIA'; else if (host.includes('shein')) storeName = 'SHEIN'; else if (host.includes('netshoes')) storeName = 'NETSHOES'; const style = document.createElement('style'); style.textContent = ` #dopamina-top-bar { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; height: 48px !important; background: rgba(10, 10, 15, 0.97) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; border-bottom: 2px solid #ccff00 !important; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.85), 0 0 20px rgba(204, 255, 0, 0.15) !important; z-index: 2147483647 !important; font-family: system-ui, -apple-system, sans-serif !important; margin: 0 !important; padding: 0 16px !important; display: flex !important; align-items: center !important; color: #ffffff !important; } .dopamina-badge { display: inline-block !important; position: relative !important; margin: 2px 6px !important; padding: 3px 8px !important; border-radius: 6px !important; border: 1px dashed !important; font-size: 10px !important; font-weight: 900 !important; font-family: system-ui, sans-serif !important; cursor: help !important; z-index: 99999 !important; vertical-align: middle !important; } #dopamina-narrator { position: fixed !important; bottom: 16px !important; left: 16px !important; width: 320px !important; max-width: 90vw !important; background: rgba(9, 9, 11, 0.97) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(168, 85, 247, 0.5) !important; border-radius: 16px !important; padding: 14px 16px !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.2) !important; z-index: 2147483646 !important; font-family: system-ui, sans-serif !important; color: #ffffff !important; } `; (document.head || document.documentElement).appendChild(style); const bar = document.createElement('div'); bar.id = 'dopamina-top-bar'; const left = document.createElement('div'); left.style.cssText = 'display:flex;align-items:center;gap:8px;'; left.innerHTML = `<b style=\"color:#ccff00;font-size:13px;letter-spacing:0.5px;\">⚡ DOPAMINA</b><span style=\"background:rgba(204,255,0,0.15);border:1px solid rgba(204,255,0,0.3);color:#ccff00;padding:2px 6px;border-radius:99px;font-size:9px;font-weight:800;\">ENGINE: ${storeName}</span>`; const mid = document.createElement('div'); mid.id = 'dopamina-score-val'; mid.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:11px;'; mid.innerHTML = '<span style=\"font-weight:800;color:#22c55e;\">🟢 ENGINE UNIVERSAL ATIVA</span>'; const right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:8px;'; const btnXray = document.createElement('button'); btnXray.textContent = '🔬 Raio-X ON'; btnXray.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;cursor:pointer;'; let isXray = true; btnXray.onclick = function () { isXray = !isXray; btnXray.textContent = isXray ? '🔬 Raio-X ON' : '🔬 Raio-X OFF'; document.querySelectorAll('.dopamina-badge').forEach(b => { (b as HTMLElement).style.display = isXray ? 'inline-block' : 'none'; }); }; const link = document.createElement('a'); link.href = 'https://dopaminado.com.br'; link.target = '_blank'; link.style.cssText = 'background:#ccff00;color:#000;padding:4px 12px;border-radius:6px;font-weight:900;font-size:11px;text-decoration:none;'; link.textContent = 'Dopamina Land ➔'; const btnClose = document.createElement('button'); btnClose.textContent = '✕'; btnClose.style.cssText = 'background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;'; btnClose.onclick = function () { bar.remove(); document.getElementById('dopamina-narrator')?.remove(); }; right.appendChild(btnXray); right.appendChild(link); right.appendChild(btnClose); bar.appendChild(left); bar.appendChild(mid); bar.appendChild(right); (document.body || document.documentElement).appendChild(bar); const narrator = document.createElement('div'); narrator.id = 'dopamina-narrator'; narrator.innerHTML = ` <div style=\"display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #c084fc; margin-bottom: 6px;\"> <span>🧠 Consciência de Consumo</span> <button id=\"dopamina-close-narrator\" style=\"background: transparent; border: none; color: #a1a1aa; cursor: pointer;\">✕</button> </div> <p id=\"dopamina-narrator-text\" style=\"font-size: 11px; color: #e4e4e7; line-height: 1.4; margin: 0;\"> Escaneando seletores dedicados de ${storeName}... </p> `; (document.body || document.documentElement).appendChild(narrator); document.getElementById('dopamina-close-narrator')?.addEventListener('click', () => narrator.remove()); const seen = new Set(); let eventSent = false; function generateUUID() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); } function scanDOM() { let count = 0; const counts: Record<string, number> = { ancoragem: 0, enquadramento: 0, escassez: 0, fomo: 0, social: 0, dor: 0 }; function addBadge(el: Element, label: string, desc: string, bg: string, border: string, color: string, key: string) { if (seen.has(el) || count >= 12) return; seen.add(el); count++; counts[key] = (counts[key] || 0) + 1; const b = document.createElement('span'); b.className = 'dopamina-badge'; b.style.cssText = `background:${bg} !important; border-color:${border} !important; color:${color} !important;`; b.title = desc; b.textContent = label; if (el.parentNode) el.parentNode.insertBefore(b, el.nextSibling); } const priceSel = [ '.ui-pdp-price__original-value', 'span.andes-money-amount--previous', '.ui-search-price__part--original', '.a-text-price[data-a-strike=\"true\"]', '.basisPrice .a-offscreen', '.a-color-secondary.a-text-strike', '._2MaB83', '.pq2W2k', '.p9c8gA', '[data-testid=\"price-original\"]', '.oldPrice', '[class*=\"precoAntigo\"]', '.price--originalText--', '.origin-price', 's', 'del', 'strike', '[class*=\"old-price\"]', '[class*=\"original-price\"]', '[class*=\"price-de\"]', '[class*=\"anterior\"]', '[style*=\"line-through\"]' ].join(','); document.querySelectorAll(priceSel).forEach(el => { const txt = (el.textContent || '').trim(); if (txt.match(/R\\$\\s*\\d+/) || txt.match(/\\$\\s*\\d+/) || el.tagName === 'S' || el.tagName === 'DEL' || el.tagName === 'STRIKE') { addBadge(el, '⚓ Ancoragem', 'Preço riscado alto para ancorar a percepção de valor.', 'rgba(249,115,22,0.25)', '#f97316', '#f97316', 'ancoragem'); } }); if (counts.ancoragem === 0) { document.querySelectorAll('span, p, div, b, strong').forEach(el => { if (el.children.length > 0) return; const style = window.getComputedStyle(el); if (style.textDecorationLine.includes('line-through') || style.textDecoration.includes('line-through')) { addBadge(el, '⚓ Ancoragem', 'Estilo riscado computado no elemento.', 'rgba(249,115,22,0.25)', '#f97316', '#f97316', 'ancoragem'); } }); } const discSel = [ '.savingsPercentage', '.reinventPriceSavingsPercentageMargin', '.ui-pdp-discount', '._2tWj2x', '.shopee-badge', '[data-testid=\"price-discount\"]', '.discountTag', '.price--discount--', '[class*=\"discount\"]', '[class*=\"badge\"]', '[class*=\"tag\"]', '[class*=\"saving\"]', '[class*=\"off\"]' ].join(','); document.querySelectorAll(discSel).forEach(el => { const txt = (el.textContent || '').toLowerCase(); if (txt.includes('%') || txt.includes('off') || txt.includes('desconto')) { addBadge(el, '🏷️ Enquadramento', 'Selo de porcentagem para inflar o valor do desconto.', 'rgba(59,130,246,0.25)', '#3b82f6', '#3b82f6', 'enquadramento'); } }); const timerSel = [ '#dealBadgeSupportingText', '.dealTimer', '#dealClock', '.ui-pdp-promotions-pill', '.flash-sale-timer', '.shopee-countdown', '[data-testid=\"badge-timer\"]', '.timerText', '[class*=\"cronometro\"]', '[class*=\"timer\"]', '[class*=\"countdown\"]', '[class*=\"flash\"]', '[class*=\"oferta\"]' ].join(','); document.querySelectorAll(timerSel).forEach(el => { addBadge(el, '⏰ Escassez', 'Contagem regressiva para forçar compra impulsiva.', 'rgba(234,179,8,0.25)', '#eab308', '#eab308', 'escassez'); }); document.querySelectorAll('p, span, div, strong, b, h1, h2, h3').forEach(el => { if (el.children.length > 0) return; const txt = (el.textContent || '').toLowerCase().trim(); if (txt.includes('restam') || txt.includes('últimas unidades') || txt.includes('estoque baixo') || txt.includes('só hoje') || (txt.includes('apenas') && txt.includes('estoque'))) { addBadge(el, '🔴 FOMO', 'Estoque limitadíssimo para gerar medo de perder a compra.', 'rgba(239,68,68,0.25)', '#ef4444', '#ef4444', 'fomo'); } else if (txt.includes('mais vendido') || txt.includes('nº 1 em') || txt.includes('comprados nas') || txt.includes('comprados no mês') || txt.includes('em alta') || txt.includes('vendidos')) { addBadge(el, '⭐ Prova Social', 'Popularidade destacada para induzir comportamento de manada.', 'rgba(168,85,247,0.25)', '#a855f7', '#a855f7', 'social'); } else if (txt.includes('12x sem juros') || txt.includes('10x sem juros') || txt.includes('frete grátis') || txt.includes('cupom')) { addBadge(el, '💸 Dor Mitigada', 'Parcelamento e frete grátis para amortecer a dor do pagamento.', 'rgba(34,197,94,0.25)', '#22c55e', '#22c55e', 'dor'); } }); const dangerScore = Math.min(99, 35 + count * 9); const scoreColor = dangerScore > 65 ? '#ef4444' : '#eab308'; const pills = []; if (counts.ancoragem > 0) pills.push(`⚓ ${counts.ancoragem} Ancoragem`); if (counts.enquadramento > 0) pills.push(`🏷️ ${counts.enquadramento} Desconto`); if (counts.escassez > 0) pills.push(`⏰ ${counts.escassez} Timer`); if (counts.fomo > 0) pills.push(`🔴 ${counts.fomo} FOMO`); if (counts.social > 0) pills.push(`⭐ ${counts.social} Social`); if (counts.dor > 0) pills.push(`💸 ${counts.dor} Facilitadores`); mid.innerHTML = `<span style=\"font-weight:900;color:${scoreColor}; font-size:12px;\">🚨 INDUÇÃO: ${dangerScore}/100</span><span style=\"color:#71717a;\">|</span><span style=\"color:#a1a1aa; font-weight:600;\">${pills.length > 0 ? pills.join(' · ') : count + ' gatilhos identificados'}</span>`; const msgEl = document.getElementById('dopamina-narrator-text'); if (msgEl) { msgEl.textContent = count > 0 ? `Auditamos ${count} gatilhos em ${storeName} (${pills.join(', ')}). A loja está usando esse ecossistema para influenciar sua decisão!` : `Analisando a estrutura de ${storeName}... Role a página para inspecionar outros blocos de produtos.`; } if (!window.__dopamina_price_widget_injected) { window.__dopamina_price_widget_injected = true; let productName = document.querySelector('h1')?.textContent?.trim() || document.title.split('-')[0]; let currentPriceNum = null; const priceSelectors = ['.ui-pdp-price__second-line .andes-money-amount__fraction', '.a-price-whole', '.price-template-price-block .price', '[data-testid=\"price-value\"]', '[class*=\"OfferLabel\"] [class*=\"price\"]']; for(let sel of priceSelectors) { let el = document.querySelector(sel); if (el) { let txt = el.textContent.replace(/[^0-9,]/g, '').replace(',', '.'); if (txt) { currentPriceNum = parseFloat(txt); if (currentPriceNum > 0) break; } } } const buyBoxSelectors = [ '.ui-pdp-actions', '.ui-pdp-actions__container', '#addToCart_feature_div', '#desktop_buybox', '#buybox', '.shopee-button-solid--primary', '.pdp-action-area', '.buy-box', '.buy-button', '[data-testid=\"buy-btn\"]', 'button.button-buy', '[class*=\"BuyButton\"]', '[class*=\"OfferBox\"]', '[class*=\"ProductAction\"]' ]; let buyBox = null; for(let sel of buyBoxSelectors) { buyBox = document.querySelector(sel); if (buyBox) break; } if (buyBox && productName) { const widget = document.createElement('div'); widget.id = 'dopamina-price-widget'; widget.style.cssText = 'margin: 16px 0; padding: 16px; background: rgba(9, 9, 11, 0.95); border: 1px solid #3f3f46; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: system-ui, sans-serif;'; widget.innerHTML = `<div style=\"display:flex;align-items:center;gap:8px;font-size:12px;font-weight:bold;color:#a1a1aa;\"><div class=\"dopamina-spinner\" style=\"width:14px;height:14px;border:2px solid #a1a1aa;border-top-color:transparent;border-radius:50%;animation:dopamina-spin 1s linear infinite;\"></div>Consultando Mercado Livre/Bondfaro...</div> <style>@keyframes dopamina-spin { to { transform: rotate(360deg); } }</style>`; buyBox.parentNode.insertBefore(widget, buyBox); fetch(`https://www.dopaminado.com.br/api/price-history?q=${encodeURIComponent(productName)}&current_price=${currentPriceNum || ''}`) .then(r => r.json()) .then(data => { if (data.success) { widget.style.borderColor = data.is_fomo_alert ? '#f97316' : '#22c55e'; const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val); widget.innerHTML = ` <div style=\"display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;\"> <div style=\"display:flex; align-items:center; gap:6px;\"> <span style=\"font-size:16px;\">${data.is_fomo_alert ? '🚨' : '✅'}</span> <span style=\"font-size:12px; font-weight:900; color:${data.is_fomo_alert ? '#f97316' : '#22c55e'}; text-transform:uppercase;\"> ${data.is_fomo_alert ? 'ALERTA DE PREÇO ALTO' : 'PREÇO DE MERCADO JUSTO'} </span> </div> <span style=\"font-size:10px; font-weight:bold; color:#71717a; background:#18181b; padding:2px 6px; border-radius:4px; border:1px solid #27272a;\">Bondfaro Sync</span> </div> <div style=\"font-size:12px; color:#e4e4e7; line-height:1.4; margin-bottom:12px; font-weight:500;\"> ${data.message} </div> <div style=\"background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; margin-bottom:12px;\"> <div style=\"display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px;\"> <span style=\"color:#a1a1aa;\">Preço detectado aqui:</span> <strong style=\"color:${data.is_fomo_alert ? '#f87171' : '#e4e4e7'}\">${data.current_price ? formatBRL(data.current_price) : 'N/A'}</strong> </div> <div style=\"display:flex; justify-content:space-between; font-size:12px; margin-bottom:12px;\"> <span style=\"color:#a1a1aa;\">Piso do mercado (Buscapé):</span> <strong style=\"color:#4ade80\">${formatBRL(data.scraped_price)}</strong> </div> ${data.is_fomo_alert ? ` <div style=\"margin-top:8px; padding-top:12px; border-top:1px dashed #3f3f46; display:flex; flex-direction:column; gap:8px;\"> <span style=\"font-size:10px; color:#a1a1aa;\">Oferta mais barata detectada: <strong style=\"color:#fff;\">${data.scraped_name}</strong></span> <a href=\"${data.url}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:block; text-align:center; background:#f97316; color:#fff; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold; text-decoration:none; transition:0.2s; box-shadow:0 2px 10px rgba(0,0,0,0.5);\"> VER LOJA MAIS BARATA ➔ </a> </div> ` : ` <div style=\"margin-top:8px; padding-top:12px; border-top:1px dashed #3f3f46; display:flex; flex-direction:column; gap:4px; align-items:center;\"> <span style=\"font-size:16px;\">🏆</span> <strong style=\"color:#22c55e; font-size:12px;\">Você já está na melhor oferta!</strong> <span style=\"font-size:10px; color:#a1a1aa; text-align:center;\">Não encontramos nenhum preço menor que o atual no Buscapé.</span> </div> `} </div> `; } else { widget.remove(); } }).catch(() => widget.remove()); } } if (!eventSent) { eventSent = true; try { fetch('https://www.dopaminado.com.br/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: generateUUID(), event_type: 'dark_pattern_audit', product_id: storeName, price_displayed: dangerScore, metadata: { store_name: storeName, url: window.location.href, danger_score: dangerScore, counts: counts, triggers_count: count } }), keepalive: true }).catch(() => {}); } catch (e) {} } } scanDOM(); setTimeout(scanDOM, 500); setTimeout(scanDOM, 1500); setTimeout(scanDOM, 3000);})();})())";

  // Bypass React 19 javascript: URL sanitizer via native DOM setAttribute
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [bookmarkletCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    trackEvent('bookmarklet_installed', undefined, undefined, { method: 'copy' });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDragStart = () => {
    trackEvent('bookmarklet_installed', undefined, undefined, { method: 'drag' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      
      {/* Main Extension/Bookmarklet Hero */}
      <div className="rounded-3xl border border-neon/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-neon/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-4xl shadow-lg shadow-neon/10">
            ⚡
          </div>
        </div>

        <span className="inline-block rounded-full bg-neon/10 border border-neon/30 px-4 py-1.5 text-xs font-black text-neon mb-4">
          AUDITOR ANTI-FOMO UNIVERSAL
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
          Instale a Dopamina Bar em <span className="text-neon">1 clique</span>
        </h1>

        <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Nossa engine analisa preços ocultos, gatilhos de escassez e táticas de manipulação psicológica em tempo real nas maiores lojas do Brasil. <strong>Basta arrastar o botão abaixo para a sua barra de favoritos.</strong>
        </p>

        {/* Drag & Drop Bookmarklet Button */}
        <div className="mt-10 flex flex-col items-center justify-center gap-6 relative z-10">
          
          <div className="animate-bounce mb-2">
            <span className="text-zinc-500 text-sm font-bold">Arraste este botão ↓</span>
          </div>

          <a
            ref={anchorRef}
            onDragStart={handleDragStart}
            className="group relative rounded-2xl bg-neon px-8 py-5 text-base font-black text-background transition hover:bg-neon-light active:scale-95 shadow-[0_0_40px_rgba(204,255,0,0.3)] border-2 border-neon cursor-grab active:cursor-grabbing flex items-center gap-4"
            title="Arraste este botão para sua barra de favoritos!"
          >
            <span className="text-2xl group-hover:scale-125 transition">⚡</span>
            <span>Dopamina Anti-Truque</span>
            <span className="text-[10px] bg-black/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Arraste para Favoritos</span>
          </a>

          <div className="flex items-center gap-4 mt-2">
            <div className="h-[1px] w-12 bg-zinc-800"></div>
            <span className="text-xs text-zinc-600 font-bold uppercase">Ou adicione manualmente</span>
            <div className="h-[1px] w-12 bg-zinc-800"></div>
          </div>

          {/* Copy Code Option */}
          <button
            onClick={copyCode}
            className="rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-sm font-bold text-zinc-300 transition"
          >
            {copied ? '✅ Código Copiado com Sucesso!' : '📋 Copiar Código da Extensão'}
          </button>
        </div>

        {/* Step by Step Manual instructions */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50 text-left max-w-2xl mx-auto">
          <h3 className="font-black text-lg text-zinc-200 mb-4">📍 Como usar a ferramenta:</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-black text-sm">1</div>
              <div>
                <p className="font-bold text-zinc-300 text-sm">Salve na Barra de Favoritos</p>
                <p className="text-xs text-zinc-500 mt-1">Arraste o botão neon lá para cima, ou copie o código e crie um favorito manual apertando <kbd className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded border border-zinc-700 mx-1">Ctrl + D</kbd>.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-black text-sm">2</div>
              <div>
                <p className="font-bold text-zinc-300 text-sm">Acesse um E-commerce</p>
                <p className="text-xs text-zinc-500 mt-1">Entre na página de qualquer produto da Amazon, Mercado Livre, Shopee, KaBuM!, etc.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-neon/20 border border-neon/30 text-neon font-black text-sm">3</div>
              <div>
                <p className="font-bold text-neon text-sm">Clique no Favorito!</p>
                <p className="text-xs text-zinc-400 mt-1">Ao clicar no favorito salvo, a <strong>Dopamina Bar</strong> vai injetar a telemetria na hora, revelar se o desconto é falso e auditar a loja!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Stores Grid */}
      <div className="mt-8">
        <p className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Plataformas com Telemetria Ativa</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {['Mercado Livre', 'Amazon Brasil', 'Shopee', 'Magalu', 'KaBuM!', 'AliExpress'].map(store => (
            <div key={store} className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3 text-xs font-bold text-zinc-400">
              {store}
            </div>
          ))}
        </div>
      </div>

      {/* Alternative ZIP Option for Power Users */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <p className="font-bold text-zinc-200">📦 Desenvolvedores & Power Users</p>
          <p className="text-zinc-500 mt-0.5">Se preferir inspecionar o código fonte ou carregar o manifesto diretamente no navegador.</p>
        </div>
        <a
          href="/extension/dopamina-extension.zip"
          download="dopamina-extension.zip"
          className="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 font-bold text-zinc-300 transition shrink-0"
        >
          Baixar Código Fonte (ZIP)
        </a>
      </div>
    </div>
  );
}
