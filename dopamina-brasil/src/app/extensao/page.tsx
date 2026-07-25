'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

export default function ExtensaoPage() {
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const bookmarkletCode = "javascript:void((function(){\"use strict\";(function(){if(window.__dopamina_universal_engine_active){alert(\"\\u26A1 Dopamina Anti-Truque j\\xE1 est\\xE1 ativo nesta p\\xE1gina!\");return}window.__dopamina_universal_engine_active=!0;const r=window.location.hostname.toLowerCase();let a=\"E-COMMERCE\";r.includes(\"mercadolivre\")||r.includes(\"mercadolibre\")?a=\"MERCADO LIVRE\":r.includes(\"amazon\")?a=\"AMAZON BRASIL\":r.includes(\"shopee\")?a=\"SHOPEE\":r.includes(\"magazineluiza\")||r.includes(\"magalu\")?a=\"MAGALU\":r.includes(\"kabum\")?a=\"KABUM!\":r.includes(\"aliexpress\")?a=\"ALIEXPRESS\":r.includes(\"americanas\")?a=\"AMERICANAS\":r.includes(\"casasbahia\")?a=\"CASAS BAHIA\":r.includes(\"shein\")?a=\"SHEIN\":r.includes(\"netshoes\")&&(a=\"NETSHOES\");const S=document.createElement(\"style\");S.textContent=`\n    #dopamina-top-bar {\n      position: fixed !important;\n      top: 0 !important;\n      left: 0 !important;\n      right: 0 !important;\n      height: 48px !important;\n      background: rgba(10, 10, 15, 0.97) !important;\n      backdrop-filter: blur(12px) !important;\n      -webkit-backdrop-filter: blur(12px) !important;\n      border-bottom: 2px solid #ccff00 !important;\n      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.85), 0 0 20px rgba(204, 255, 0, 0.15) !important;\n      z-index: 2147483647 !important;\n      font-family: system-ui, -apple-system, sans-serif !important;\n      margin: 0 !important;\n      padding: 0 16px !important;\n      display: flex !important;\n      align-items: center !important;\n      color: #ffffff !important;\n    }\n    .dopamina-badge {\n      display: inline-block !important;\n      position: relative !important;\n      margin: 2px 6px !important;\n      padding: 3px 8px !important;\n      border-radius: 6px !important;\n      border: 1px dashed !important;\n      font-size: 10px !important;\n      font-weight: 900 !important;\n      font-family: system-ui, sans-serif !important;\n      cursor: help !important;\n      z-index: 99999 !important;\n      vertical-align: middle !important;\n    }\n    #dopamina-narrator {\n      position: fixed !important;\n      bottom: 16px !important;\n      left: 16px !important;\n      width: 320px !important;\n      max-width: 90vw !important;\n      background: rgba(9, 9, 11, 0.97) !important;\n      backdrop-filter: blur(12px) !important;\n      border: 1px solid rgba(168, 85, 247, 0.5) !important;\n      border-radius: 16px !important;\n      padding: 14px 16px !important;\n      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.2) !important;\n      z-index: 2147483646 !important;\n      font-family: system-ui, sans-serif !important;\n      color: #ffffff !important;\n    }\n  `,(document.head||document.documentElement).appendChild(S);const m=document.createElement(\"div\");m.id=\"dopamina-top-bar\";const E=document.createElement(\"div\");E.style.cssText=\"display:flex;align-items:center;gap:8px;\",E.innerHTML=`<b style=\"color:#ccff00;font-size:13px;letter-spacing:0.5px;\">\\u26A1 DOPAMINA</b><span style=\"background:rgba(204,255,0,0.15);border:1px solid rgba(204,255,0,0.3);color:#ccff00;padding:2px 6px;border-radius:99px;font-size:9px;font-weight:800;\">ENGINE: ${a}</span>`;const u=document.createElement(\"div\");u.id=\"dopamina-score-val\",u.style.cssText=\"display:flex;align-items:center;gap:10px;font-size:11px;\",u.innerHTML='<span style=\"font-weight:800;color:#22c55e;\">\\u{1F7E2} ENGINE UNIVERSAL ATIVA</span>';const f=document.createElement(\"div\");f.style.cssText=\"display:flex;align-items:center;gap:8px;\";const x=document.createElement(\"button\");x.textContent=\"\\u{1F52C} Raio-X ON\",x.style.cssText=\"background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;cursor:pointer;\";let b=!0;x.onclick=function(){b=!b,x.textContent=b?\"\\u{1F52C} Raio-X ON\":\"\\u{1F52C} Raio-X OFF\",document.querySelectorAll(\".dopamina-badge\").forEach(s=>{s.style.display=b?\"inline-block\":\"none\"})};const g=document.createElement(\"a\");g.href=\"https://dopaminado.com.br\",g.target=\"_blank\",g.style.cssText=\"background:#ccff00;color:#000;padding:4px 12px;border-radius:6px;font-weight:900;font-size:11px;text-decoration:none;\",g.textContent=\"Dopamina Land \\u2794\";const y=document.createElement(\"button\");y.textContent=\"\\u2715\",y.style.cssText=\"background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;\",y.onclick=function(){m.remove(),document.getElementById(\"dopamina-narrator\")?.remove()},f.appendChild(x),f.appendChild(g),f.appendChild(y),m.appendChild(E),m.appendChild(u),m.appendChild(f),(document.body||document.documentElement).appendChild(m);const h=document.createElement(\"div\");h.id=\"dopamina-narrator\",h.innerHTML=`\n    <div style=\"display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #c084fc; margin-bottom: 6px;\">\n      <span>\\u{1F9E0} Consci\\xEAncia de Consumo</span>\n      <button id=\"dopamina-close-narrator\" style=\"background: transparent; border: none; color: #a1a1aa; cursor: pointer;\">\\u2715</button>\n    </div>\n    <p id=\"dopamina-narrator-text\" style=\"font-size: 11px; color: #e4e4e7; line-height: 1.4; margin: 0;\">\n      Escaneando seletores dedicados de ${a}...\n    </p>\n  `,(document.body||document.documentElement).appendChild(h),document.getElementById(\"dopamina-close-narrator\")?.addEventListener(\"click\",()=>h.remove());const C=new Set;let k=!1;function z(){return\"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\".replace(/[xy]/g,function(s){const n=Math.random()*16|0;return(s==\"x\"?n:n&3|8).toString(16)})}function v(){let s=0;const n={ancoragem:0,enquadramento:0,escassez:0,fomo:0,social:0,dor:0};function p(t,e,w,A,l,i,o){if(C.has(t)||s>=12)return;C.add(t),s++,n[o]=(n[o]||0)+1;const d=document.createElement(\"span\");d.className=\"dopamina-badge\",d.style.cssText=`background:${A} !important; border-color:${l} !important; color:${i} !important;`,d.title=w,d.textContent=e,t.parentNode&&t.parentNode.insertBefore(d,t.nextSibling)}const $=[\".ui-pdp-price__original-value\",\"span.andes-money-amount--previous\",\".ui-search-price__part--original\",'.a-text-price[data-a-strike=\"true\"]',\".basisPrice .a-offscreen\",\".a-color-secondary.a-text-strike\",\"._2MaB83\",\".pq2W2k\",\".p9c8gA\",'[data-testid=\"price-original\"]',\".oldPrice\",'[class*=\"precoAntigo\"]',\".price--originalText--\",\".origin-price\",\"s\",\"del\",\"strike\",'[class*=\"old-price\"]','[class*=\"original-price\"]','[class*=\"price-de\"]','[class*=\"anterior\"]','[style*=\"line-through\"]'].join(\",\");document.querySelectorAll($).forEach(t=>{const e=(t.textContent||\"\").trim();(e.match(/R\\$\\s*\\d+/)||e.match(/\\$\\s*\\d+/)||t.tagName===\"S\"||t.tagName===\"DEL\"||t.tagName===\"STRIKE\")&&p(t,\"\\u2693 Ancoragem\",\"Pre\\xE7o riscado alto para ancorar a percep\\xE7\\xE3o de valor.\",\"rgba(249,115,22,0.25)\",\"#f97316\",\"#f97316\",\"ancoragem\")}),n.ancoragem===0&&document.querySelectorAll(\"span, p, div, b, strong\").forEach(t=>{if(t.children.length>0)return;const e=window.getComputedStyle(t);(e.textDecorationLine.includes(\"line-through\")||e.textDecoration.includes(\"line-through\"))&&p(t,\"\\u2693 Ancoragem\",\"Estilo riscado computado no elemento.\",\"rgba(249,115,22,0.25)\",\"#f97316\",\"#f97316\",\"ancoragem\")});const N=[\".savingsPercentage\",\".reinventPriceSavingsPercentageMargin\",\".ui-pdp-discount\",\"._2tWj2x\",\".shopee-badge\",'[data-testid=\"price-discount\"]',\".discountTag\",\".price--discount--\",'[class*=\"discount\"]','[class*=\"badge\"]','[class*=\"tag\"]','[class*=\"saving\"]','[class*=\"off\"]'].join(\",\");document.querySelectorAll(N).forEach(t=>{const e=(t.textContent||\"\").toLowerCase();(e.includes(\"%\")||e.includes(\"off\")||e.includes(\"desconto\"))&&p(t,\"\\u{1F3F7}\\uFE0F Enquadramento\",\"Selo de porcentagem para inflar o valor do desconto.\",\"rgba(59,130,246,0.25)\",\"#3b82f6\",\"#3b82f6\",\"enquadramento\")});const M=[\"#dealBadgeSupportingText\",\".dealTimer\",\"#dealClock\",\".ui-pdp-promotions-pill\",\".flash-sale-timer\",\".shopee-countdown\",'[data-testid=\"badge-timer\"]',\".timerText\",'[class*=\"cronometro\"]','[class*=\"timer\"]','[class*=\"countdown\"]','[class*=\"flash\"]','[class*=\"oferta\"]'].join(\",\");document.querySelectorAll(M).forEach(t=>{p(t,\"\\u23F0 Escassez\",\"Contagem regressiva para for\\xE7ar compra impulsiva.\",\"rgba(234,179,8,0.25)\",\"#eab308\",\"#eab308\",\"escassez\")}),document.querySelectorAll(\"p, span, div, strong, b, h1, h2, h3\").forEach(t=>{if(t.children.length>0)return;const e=(t.textContent||\"\").toLowerCase().trim();e.includes(\"restam\")||e.includes(\"\\xFAltimas unidades\")||e.includes(\"estoque baixo\")||e.includes(\"s\\xF3 hoje\")||e.includes(\"apenas\")&&e.includes(\"estoque\")?p(t,\"\\u{1F534} FOMO\",\"Estoque limitad\\xEDssimo para gerar medo de perder a compra.\",\"rgba(239,68,68,0.25)\",\"#ef4444\",\"#ef4444\",\"fomo\"):e.includes(\"mais vendido\")||e.includes(\"n\\xBA 1 em\")||e.includes(\"comprados nas\")||e.includes(\"comprados no m\\xEAs\")||e.includes(\"em alta\")||e.includes(\"vendidos\")?p(t,\"\\u2B50 Prova Social\",\"Popularidade destacada para induzir comportamento de manada.\",\"rgba(168,85,247,0.25)\",\"#a855f7\",\"#a855f7\",\"social\"):(e.includes(\"12x sem juros\")||e.includes(\"10x sem juros\")||e.includes(\"frete gr\\xE1tis\")||e.includes(\"cupom\"))&&p(t,\"\\u{1F4B8} Dor Mitigada\",\"Parcelamento e frete gr\\xE1tis para amortecer a dor do pagamento.\",\"rgba(34,197,94,0.25)\",\"#22c55e\",\"#22c55e\",\"dor\")});const _=Math.min(99,35+s*9),L=_>65?\"#ef4444\":\"#eab308\",c=[];n.ancoragem>0&&c.push(`\\u2693 ${n.ancoragem} Ancoragem`),n.enquadramento>0&&c.push(`\\u{1F3F7}\\uFE0F ${n.enquadramento} Desconto`),n.escassez>0&&c.push(`\\u23F0 ${n.escassez} Timer`),n.fomo>0&&c.push(`\\u{1F534} ${n.fomo} FOMO`),n.social>0&&c.push(`\\u2B50 ${n.social} Social`),n.dor>0&&c.push(`\\u{1F4B8} ${n.dor} Facilitadores`),u.innerHTML=`<span style=\"font-weight:900;color:${L}; font-size:12px;\">\\u{1F6A8} INDU\\xC7\\xC3O: ${_}/100</span><span style=\"color:#71717a;\">|</span><span style=\"color:#a1a1aa; font-weight:600;\">${c.length>0?c.join(\" \\xB7 \"):s+\" gatilhos identificados\"}</span>`;const T=document.getElementById(\"dopamina-narrator-text\");if(T&&(T.textContent=s>0?`Auditamos ${s} gatilhos em ${a} (${c.join(\", \")}). A loja est\\xE1 usando esse ecossistema para influenciar sua decis\\xE3o!`:`Analisando a estrutura de ${a}... Role a p\\xE1gina para inspecionar outros blocos de produtos.`),!window.__dopamina_price_widget_injected){window.__dopamina_price_widget_injected=!0;let t=document.querySelector(\"h1\")?.textContent?.trim()||document.title.split(\"-\")[0],e=null;const w=[\".ui-pdp-price__second-line .andes-money-amount__fraction\",\".a-price-whole\",\".price-template-price-block .price\",'[data-testid=\"price-value\"]'];for(let i of w){let o=document.querySelector(i);if(o){let d=o.textContent.replace(/[^0-9,]/g,\"\").replace(\",\",\".\");if(d&&(e=parseFloat(d),e>0))break}}const A=[\".ui-pdp-actions\",\".ui-pdp-actions__container\",\"#addToCart_feature_div\",\"#desktop_buybox\",\"#buybox\",\".shopee-button-solid--primary\",\".pdp-action-area\",\".buy-box\",\".buy-button\",'[data-testid=\"buy-btn\"]',\"button.button-buy\"];let l=null;for(let i of A)if(l=document.querySelector(i),l)break;if(l&&t){const i=document.createElement(\"div\");i.id=\"dopamina-price-widget\",i.style.cssText=\"margin: 16px 0; padding: 16px; background: rgba(9, 9, 11, 0.95); border: 1px solid #3f3f46; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: system-ui, sans-serif;\",i.innerHTML=`<div style=\"display:flex;align-items:center;gap:8px;font-size:12px;font-weight:bold;color:#a1a1aa;\"><div class=\"dopamina-spinner\" style=\"width:14px;height:14px;border:2px solid #a1a1aa;border-top-color:transparent;border-radius:50%;animation:dopamina-spin 1s linear infinite;\"></div>Consultando Mercado Livre/Bondfaro...</div>\n        <style>@keyframes dopamina-spin { to { transform: rotate(360deg); } }</style>`,l.parentNode.insertBefore(i,l),fetch(`https://www.dopaminado.com.br/api/price-history?q=${encodeURIComponent(t)}&current_price=${e||\"\"}`).then(o=>o.json()).then(o=>{if(o.success){i.style.borderColor=o.is_fomo_alert?\"#f97316\":\"#22c55e\";const d=O=>new Intl.NumberFormat(\"pt-BR\",{style:\"currency\",currency:\"BRL\"}).format(O);i.innerHTML=`\n                <div style=\"display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;\">\n                  <div style=\"display:flex; align-items:center; gap:6px;\">\n                    <span style=\"font-size:16px;\">${o.is_fomo_alert?\"\\u{1F6A8}\":\"\\u2705\"}</span>\n                    <span style=\"font-size:12px; font-weight:900; color:${o.is_fomo_alert?\"#f97316\":\"#22c55e\"}; text-transform:uppercase;\">\n                      ${o.is_fomo_alert?\"ALERTA DE PRE\\xC7O ALTO\":\"PRE\\xC7O DE MERCADO JUSTO\"}\n                    </span>\n                  </div>\n                  <span style=\"font-size:10px; font-weight:bold; color:#71717a; background:#18181b; padding:2px 6px; border-radius:4px; border:1px solid #27272a;\">Bondfaro Sync</span>\n                </div>\n                <div style=\"font-size:12px; color:#e4e4e7; line-height:1.4; margin-bottom:12px; font-weight:500;\">\n                  ${o.message}\n                </div>\n                \n                <div style=\"background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; margin-bottom:12px;\">\n                  <div style=\"display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px;\">\n                    <span style=\"color:#a1a1aa;\">Pre\\xE7o detectado aqui:</span>\n                    <strong style=\"color:${o.is_fomo_alert?\"#f87171\":\"#e4e4e7\"}\">${o.current_price?d(o.current_price):\"N/A\"}</strong>\n                  </div>\n                  <div style=\"display:flex; justify-content:space-between; font-size:12px; margin-bottom:12px;\">\n                    <span style=\"color:#a1a1aa;\">Piso do mercado (Buscap\\xE9):</span>\n                    <strong style=\"color:#4ade80\">${d(o.scraped_price)}</strong>\n                  </div>\n                  \n                  ${o.is_fomo_alert?`\n                  <div style=\"margin-top:8px; padding-top:12px; border-top:1px dashed #3f3f46; display:flex; flex-direction:column; gap:8px;\">\n                    <span style=\"font-size:10px; color:#a1a1aa;\">Oferta mais barata detectada: <strong style=\"color:#fff;\">${o.scraped_name}</strong></span>\n                    <a href=\"${o.url}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:block; text-align:center; background:#f97316; color:#fff; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold; text-decoration:none; transition:0.2s; box-shadow:0 2px 10px rgba(0,0,0,0.5);\">\n                      VER LOJA MAIS BARATA \\u2794\n                    </a>\n                  </div>\n                  `:`\n                  <div style=\"margin-top:8px; padding-top:12px; border-top:1px dashed #3f3f46; display:flex; flex-direction:column; gap:4px; align-items:center;\">\n                    <span style=\"font-size:16px;\">\\u{1F3C6}</span>\n                    <strong style=\"color:#22c55e; font-size:12px;\">Voc\\xEA j\\xE1 est\\xE1 na melhor oferta!</strong>\n                    <span style=\"font-size:10px; color:#a1a1aa; text-align:center;\">N\\xE3o encontramos nenhum pre\\xE7o menor que o atual no Buscap\\xE9.</span>\n                  </div>\n                  `}\n                </div>\n              `}else i.remove()}).catch(()=>i.remove())}}if(!k){k=!0;try{fetch(\"https://www.dopaminado.com.br/api/track-event\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({session_id:z(),event_type:\"dark_pattern_audit\",product_id:a,price_displayed:_,metadata:{store_name:a,url:window.location.href,danger_score:_,counts:n,triggers_count:s}}),keepalive:!0}).catch(()=>{})}catch{}}}v(),setTimeout(v,500),setTimeout(v,1500),setTimeout(v,3e3)})();})())";

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
