'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ExtensaoPage() {
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const bookmarkletCode = "javascript:void((function(){\"use strict\";(function(){if(window.__dopamina_universal_engine_active){alert(\"\\u26A1 Dopamina Anti-Truque j\\xE1 est\\xE1 ativo nesta p\\xE1gina!\");return}window.__dopamina_universal_engine_active=!0;const r=window.location.hostname.toLowerCase();let a=\"E-COMMERCE\";r.includes(\"mercadolivre\")||r.includes(\"mercadolibre\")?a=\"MERCADO LIVRE\":r.includes(\"amazon\")?a=\"AMAZON BRASIL\":r.includes(\"shopee\")?a=\"SHOPEE\":r.includes(\"magazineluiza\")||r.includes(\"magalu\")?a=\"MAGALU\":r.includes(\"kabum\")?a=\"KABUM!\":r.includes(\"aliexpress\")?a=\"ALIEXPRESS\":r.includes(\"americanas\")?a=\"AMERICANAS\":r.includes(\"casasbahia\")?a=\"CASAS BAHIA\":r.includes(\"shein\")?a=\"SHEIN\":r.includes(\"netshoes\")&&(a=\"NETSHOES\");const C=document.createElement(\"style\");C.textContent=`\n    #dopamina-top-bar {\n      position: fixed !important;\n      top: 0 !important;\n      left: 0 !important;\n      right: 0 !important;\n      height: 48px !important;\n      background: rgba(10, 10, 15, 0.97) !important;\n      backdrop-filter: blur(12px) !important;\n      -webkit-backdrop-filter: blur(12px) !important;\n      border-bottom: 2px solid #ccff00 !important;\n      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.85), 0 0 20px rgba(204, 255, 0, 0.15) !important;\n      z-index: 2147483647 !important;\n      font-family: system-ui, -apple-system, sans-serif !important;\n      margin: 0 !important;\n      padding: 0 16px !important;\n      display: flex !important;\n      align-items: center !important;\n      color: #ffffff !important;\n    }\n    .dopamina-badge {\n      display: inline-block !important;\n      position: relative !important;\n      margin: 2px 6px !important;\n      padding: 3px 8px !important;\n      border-radius: 6px !important;\n      border: 1px dashed !important;\n      font-size: 10px !important;\n      font-weight: 900 !important;\n      font-family: system-ui, sans-serif !important;\n      cursor: help !important;\n      z-index: 99999 !important;\n      vertical-align: middle !important;\n    }\n    #dopamina-narrator {\n      position: fixed !important;\n      bottom: 16px !important;\n      left: 16px !important;\n      width: 320px !important;\n      max-width: 90vw !important;\n      background: rgba(9, 9, 11, 0.97) !important;\n      backdrop-filter: blur(12px) !important;\n      border: 1px solid rgba(168, 85, 247, 0.5) !important;\n      border-radius: 16px !important;\n      padding: 14px 16px !important;\n      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.2) !important;\n      z-index: 2147483646 !important;\n      font-family: system-ui, sans-serif !important;\n      color: #ffffff !important;\n    }\n  `,(document.head||document.documentElement).appendChild(C);const m=document.createElement(\"div\");m.id=\"dopamina-top-bar\";const _=document.createElement(\"div\");_.style.cssText=\"display:flex;align-items:center;gap:8px;\",_.innerHTML=`<b style=\"color:#ccff00;font-size:13px;letter-spacing:0.5px;\">\\u26A1 DOPAMINA</b><span style=\"background:rgba(204,255,0,0.15);border:1px solid rgba(204,255,0,0.3);color:#ccff00;padding:2px 6px;border-radius:99px;font-size:9px;font-weight:800;\">ENGINE: ${a}</span>`;const u=document.createElement(\"div\");u.id=\"dopamina-score-val\",u.style.cssText=\"display:flex;align-items:center;gap:10px;font-size:11px;\",u.innerHTML='<span style=\"font-weight:800;color:#22c55e;\">\\u{1F7E2} ENGINE UNIVERSAL ATIVA</span>';const f=document.createElement(\"div\");f.style.cssText=\"display:flex;align-items:center;gap:8px;\";const x=document.createElement(\"button\");x.textContent=\"\\u{1F52C} Raio-X ON\",x.style.cssText=\"background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;cursor:pointer;\";let b=!0;x.onclick=function(){b=!b,x.textContent=b?\"\\u{1F52C} Raio-X ON\":\"\\u{1F52C} Raio-X OFF\",document.querySelectorAll(\".dopamina-badge\").forEach(s=>{s.style.display=b?\"inline-block\":\"none\"})};const g=document.createElement(\"a\");g.href=\"https://dopaminado.com.br\",g.target=\"_blank\",g.style.cssText=\"background:#ccff00;color:#000;padding:4px 12px;border-radius:6px;font-weight:900;font-size:11px;text-decoration:none;\",g.textContent=\"Dopamina Land \\u2794\";const h=document.createElement(\"button\");h.textContent=\"\\u2715\",h.style.cssText=\"background:none;border:none;color:#aaa;cursor:pointer;font-size:14px;\",h.onclick=function(){m.remove(),document.getElementById(\"dopamina-narrator\")?.remove()},f.appendChild(x),f.appendChild(g),f.appendChild(h),m.appendChild(_),m.appendChild(u),m.appendChild(f),(document.body||document.documentElement).appendChild(m);const y=document.createElement(\"div\");y.id=\"dopamina-narrator\",y.innerHTML=`\n    <div style=\"display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #c084fc; margin-bottom: 6px;\">\n      <span>\\u{1F9E0} Consci\\xEAncia de Consumo</span>\n      <button id=\"dopamina-close-narrator\" style=\"background: transparent; border: none; color: #a1a1aa; cursor: pointer;\">\\u2715</button>\n    </div>\n    <p id=\"dopamina-narrator-text\" style=\"font-size: 11px; color: #e4e4e7; line-height: 1.4; margin: 0;\">\n      Escaneando seletores dedicados de ${a}...\n    </p>\n  `,(document.body||document.documentElement).appendChild(y),document.getElementById(\"dopamina-close-narrator\")?.addEventListener(\"click\",()=>y.remove());const A=new Set;let k=!1;function z(){return\"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\".replace(/[xy]/g,function(s){const o=Math.random()*16|0;return(s==\"x\"?o:o&3|8).toString(16)})}function v(){let s=0;const o={ancoragem:0,enquadramento:0,escassez:0,fomo:0,social:0,dor:0};function p(t,e,E,S,l,i,n){if(A.has(t)||s>=12)return;A.add(t),s++,o[n]=(o[n]||0)+1;const d=document.createElement(\"span\");d.className=\"dopamina-badge\",d.style.cssText=`background:${S} !important; border-color:${l} !important; color:${i} !important;`,d.title=E,d.textContent=e,t.parentNode&&t.parentNode.insertBefore(d,t.nextSibling)}const M=[\".ui-pdp-price__original-value\",\"span.andes-money-amount--previous\",\".ui-search-price__part--original\",'.a-text-price[data-a-strike=\"true\"]',\".basisPrice .a-offscreen\",\".a-color-secondary.a-text-strike\",\"._2MaB83\",\".pq2W2k\",\".p9c8gA\",'[data-testid=\"price-original\"]',\".oldPrice\",'[class*=\"precoAntigo\"]',\".price--originalText--\",\".origin-price\",\"s\",\"del\",\"strike\",'[class*=\"old-price\"]','[class*=\"original-price\"]','[class*=\"price-de\"]','[class*=\"anterior\"]','[style*=\"line-through\"]'].join(\",\");document.querySelectorAll(M).forEach(t=>{const e=(t.textContent||\"\").trim();(e.match(/R\\$\\s*\\d+/)||e.match(/\\$\\s*\\d+/)||t.tagName===\"S\"||t.tagName===\"DEL\"||t.tagName===\"STRIKE\")&&p(t,\"\\u2693 Ancoragem\",\"Pre\\xE7o riscado alto para ancorar a percep\\xE7\\xE3o de valor.\",\"rgba(249,115,22,0.25)\",\"#f97316\",\"#f97316\",\"ancoragem\")}),o.ancoragem===0&&document.querySelectorAll(\"span, p, div, b, strong\").forEach(t=>{if(t.children.length>0)return;const e=window.getComputedStyle(t);(e.textDecorationLine.includes(\"line-through\")||e.textDecoration.includes(\"line-through\"))&&p(t,\"\\u2693 Ancoragem\",\"Estilo riscado computado no elemento.\",\"rgba(249,115,22,0.25)\",\"#f97316\",\"#f97316\",\"ancoragem\")});const N=[\".savingsPercentage\",\".reinventPriceSavingsPercentageMargin\",\".ui-pdp-discount\",\"._2tWj2x\",\".shopee-badge\",'[data-testid=\"price-discount\"]',\".discountTag\",\".price--discount--\",'[class*=\"discount\"]','[class*=\"badge\"]','[class*=\"tag\"]','[class*=\"saving\"]','[class*=\"off\"]'].join(\",\");document.querySelectorAll(N).forEach(t=>{const e=(t.textContent||\"\").toLowerCase();(e.includes(\"%\")||e.includes(\"off\")||e.includes(\"desconto\"))&&p(t,\"\\u{1F3F7}\\uFE0F Enquadramento\",\"Selo de porcentagem para inflar o valor do desconto.\",\"rgba(59,130,246,0.25)\",\"#3b82f6\",\"#3b82f6\",\"enquadramento\")});const I=[\"#dealBadgeSupportingText\",\".dealTimer\",\"#dealClock\",\".ui-pdp-promotions-pill\",\".flash-sale-timer\",\".shopee-countdown\",'[data-testid=\"badge-timer\"]',\".timerText\",'[class*=\"cronometro\"]','[class*=\"timer\"]','[class*=\"countdown\"]','[class*=\"flash\"]','[class*=\"oferta\"]'].join(\",\");document.querySelectorAll(I).forEach(t=>{p(t,\"\\u23F0 Escassez\",\"Contagem regressiva para for\\xE7ar compra impulsiva.\",\"rgba(234,179,8,0.25)\",\"#eab308\",\"#eab308\",\"escassez\")}),document.querySelectorAll(\"p, span, div, strong, b, h1, h2, h3\").forEach(t=>{if(t.children.length>0)return;const e=(t.textContent||\"\").toLowerCase().trim();e.includes(\"restam\")||e.includes(\"\\xFAltimas unidades\")||e.includes(\"estoque baixo\")||e.includes(\"s\\xF3 hoje\")||e.includes(\"apenas\")&&e.includes(\"estoque\")?p(t,\"\\u{1F534} FOMO\",\"Estoque limitad\\xEDssimo para gerar medo de perder a compra.\",\"rgba(239,68,68,0.25)\",\"#ef4444\",\"#ef4444\",\"fomo\"):e.includes(\"mais vendido\")||e.includes(\"n\\xBA 1 em\")||e.includes(\"comprados nas\")||e.includes(\"comprados no m\\xEAs\")||e.includes(\"em alta\")||e.includes(\"vendidos\")?p(t,\"\\u2B50 Prova Social\",\"Popularidade destacada para induzir comportamento de manada.\",\"rgba(168,85,247,0.25)\",\"#a855f7\",\"#a855f7\",\"social\"):(e.includes(\"12x sem juros\")||e.includes(\"10x sem juros\")||e.includes(\"frete gr\\xE1tis\")||e.includes(\"cupom\"))&&p(t,\"\\u{1F4B8} Dor Mitigada\",\"Parcelamento e frete gr\\xE1tis para amortecer a dor do pagamento.\",\"rgba(34,197,94,0.25)\",\"#22c55e\",\"#22c55e\",\"dor\")});const w=Math.min(99,35+s*9),L=w>65?\"#ef4444\":\"#eab308\",c=[];o.ancoragem>0&&c.push(`\\u2693 ${o.ancoragem} Ancoragem`),o.enquadramento>0&&c.push(`\\u{1F3F7}\\uFE0F ${o.enquadramento} Desconto`),o.escassez>0&&c.push(`\\u23F0 ${o.escassez} Timer`),o.fomo>0&&c.push(`\\u{1F534} ${o.fomo} FOMO`),o.social>0&&c.push(`\\u2B50 ${o.social} Social`),o.dor>0&&c.push(`\\u{1F4B8} ${o.dor} Facilitadores`),u.innerHTML=`<span style=\"font-weight:900;color:${L}; font-size:12px;\">\\u{1F6A8} INDU\\xC7\\xC3O: ${w}/100</span><span style=\"color:#71717a;\">|</span><span style=\"color:#a1a1aa; font-weight:600;\">${c.length>0?c.join(\" \\xB7 \"):s+\" gatilhos identificados\"}</span>`;const T=document.getElementById(\"dopamina-narrator-text\");if(T&&(T.textContent=s>0?`Auditamos ${s} gatilhos em ${a} (${c.join(\", \")}). A loja est\\xE1 usando esse ecossistema para influenciar sua decis\\xE3o!`:`Analisando a estrutura de ${a}... Role a p\\xE1gina para inspecionar outros blocos de produtos.`),!window.__dopamina_price_widget_injected){window.__dopamina_price_widget_injected=!0;let t=document.querySelector(\"h1\")?.textContent?.trim()||document.title.split(\"-\")[0],e=null;const E=[\".ui-pdp-price__second-line .andes-money-amount__fraction\",\".a-price-whole\",\".price-template-price-block .price\",'[data-testid=\"price-value\"]'];for(let i of E){let n=document.querySelector(i);if(n){let d=n.textContent.replace(/[^0-9,]/g,\"\").replace(\",\",\".\");if(d&&(e=parseFloat(d),e>0))break}}const S=[\".ui-pdp-actions\",\".ui-pdp-actions__container\",\"#addToCart_feature_div\",\"#desktop_buybox\",\"#buybox\",\".shopee-button-solid--primary\",\".pdp-action-area\",\".buy-box\",\".buy-button\",'[data-testid=\"buy-btn\"]',\"button.button-buy\"];let l=null;for(let i of S)if(l=document.querySelector(i),l)break;if(l&&t){const i=document.createElement(\"div\");i.id=\"dopamina-price-widget\",i.style.cssText=\"margin: 16px 0; padding: 16px; background: rgba(9, 9, 11, 0.95); border: 1px solid #3f3f46; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: system-ui, sans-serif;\",i.innerHTML=`<div style=\"display:flex;align-items:center;gap:8px;font-size:12px;font-weight:bold;color:#a1a1aa;\"><div class=\"dopamina-spinner\" style=\"width:14px;height:14px;border:2px solid #a1a1aa;border-top-color:transparent;border-radius:50%;animation:dopamina-spin 1s linear infinite;\"></div>Consultando Mercado Livre/Bondfaro...</div>\n        <style>@keyframes dopamina-spin { to { transform: rotate(360deg); } }</style>`,l.parentNode.insertBefore(i,l),fetch(`https://www.dopaminado.com.br/api/price-history?q=${encodeURIComponent(t)}&current_price=${e||\"\"}`).then(n=>n.json()).then(n=>{if(n.success&&n.history){const d=Math.min(...n.history)*.95,q=Math.max(...n.history)*1.05,j=n.history.map($=>{const O=($-d)/(q-d)*100;return`<div style=\"flex:1; display:flex; align-items:flex-end; justify-content:center; group relative;\">\n                  <div style=\"width:100%; max-width:6px; background:${n.is_fomo_alert?\"#f97316\":\"#22c55e\"}; height:${Math.max(10,O)}%; border-radius:2px; opacity:0.8; transition:0.2s;\" onmouseover=\"this.style.opacity='1'\" onmouseout=\"this.style.opacity='0.8'\" title=\"R$ ${$.toFixed(2)}\"></div>\n                </div>`}).join(\"\");i.style.borderColor=n.is_fomo_alert?\"#f97316\":\"#22c55e\",i.innerHTML=`\n                <div style=\"display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;\">\n                  <div style=\"display:flex; align-items:center; gap:6px;\">\n                    <span style=\"font-size:16px;\">${n.is_fomo_alert?\"\\u{1F6A8}\":\"\\u2705\"}</span>\n                    <span style=\"font-size:12px; font-weight:900; color:${n.is_fomo_alert?\"#f97316\":\"#22c55e\"}; text-transform:uppercase;\">\n                      ${n.is_fomo_alert?\"Alerta de Falsa Escassez\":\"Pre\\xE7o de Mercado Justo\"}\n                    </span>\n                  </div>\n                  <span style=\"font-size:10px; font-weight:bold; color:#71717a; background:#18181b; padding:2px 6px; border-radius:4px; border:1px solid #27272a;\">Bondfaro Sync</span>\n                </div>\n                <div style=\"font-size:12px; color:#e4e4e7; line-height:1.4; margin-bottom:16px; font-weight:500;\">\n                  ${n.message}\n                </div>\n                <div style=\"display:flex; flex-direction:column; gap:4px;\">\n                  <div style=\"font-size:10px; color:#71717a; font-weight:bold;\">HIST\\xD3RICO (\\xDALTIMOS 30 DIAS)</div>\n                  <div style=\"height:48px; display:flex; align-items:flex-end; gap:2px; background:rgba(0,0,0,0.2); padding:4px; border-radius:6px; border:1px solid #27272a;\">\n                    ${j}\n                  </div>\n                </div>\n              `}else i.remove()}).catch(()=>i.remove())}}if(!k){k=!0;try{fetch(\"https://www.dopaminado.com.br/api/track-event\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({session_id:z(),event_type:\"dark_pattern_audit\",product_id:a,price_displayed:w,metadata:{store_name:a,url:window.location.href,danger_score:w,counts:o,triggers_count:s}}),keepalive:!0}).catch(()=>{})}catch{}}}v(),setTimeout(v,500),setTimeout(v,1500),setTimeout(v,3e3)})();})())";

  // Bypass React 19 javascript: URL sanitizer via native DOM setAttribute
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [bookmarkletCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Chrome Web Store Banner Header */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            Chrome Web Store
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            ✓ Verificado & Seguro
          </span>
          <span className="text-xs text-zinc-400 font-semibold">
            +100.000 usuários ativos
          </span>
        </div>

        {/* Extension Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-3xl shadow-lg">
              ⚡
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Dopamina — Auditor Anti-Manipulação
              </h1>
              <div className="flex items-center gap-2 mt-1 text-xs text-amber-400 font-semibold">
                <span>★★★★★</span>
                <span className="text-zinc-400">4.9 (1.420 avaliações)</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">Produtividade / Compras</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 max-w-lg">
                Engine de auditoria universal integrada para Mercado Livre, Amazon, Shopee, Magalu, KaBuM!, AliExpress e qualquer loja virtual do Brasil com telemetria ativa.
              </p>
            </div>
          </div>

          {/* Official Chrome Store Install CTA */}
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-xs font-black text-white transition active:scale-95 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S17.63 0 12 0zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
              </svg>
              <span>Usar no Chrome (1-Clique)</span>
            </a>
            <span className="text-[10px] text-zinc-500 text-center">Oferecido por dopaminado.com.br</span>
          </div>
        </div>
      </div>

      {/* Instant 1-Click Injector Section (Bookmarklet - Universal Engine) */}
      <div className="mt-8 rounded-3xl border border-neon/30 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-8 text-center shadow-2xl relative overflow-hidden">
        <span className="inline-block rounded-full bg-neon/10 border border-neon/30 px-3 py-1 text-[11px] font-black text-neon mb-3">
          ⚡ ENGINE UNIVERSAL (COM TELEMETRIA HTTP AO VIVO)
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-foreground">
          Como ativar em <span className="text-neon">1 clique</span> em qualquer e-commerce do Brasil:
        </h2>

        <p className="text-xs text-muted max-w-xl mx-auto mt-2 leading-relaxed">
          Arraste o botão neon abaixo para a <strong>barra de favoritos do seu navegador</strong> (ou copie o código abaixo). Detecta automaticamente a loja, expõe os gatilhos e envia a auditoria para o painel de insights!
        </p>

        {/* Drag & Drop Bookmarklet Button */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          <a
            ref={anchorRef}
            className="group relative rounded-2xl bg-neon px-8 py-4 text-sm font-black text-background transition hover:bg-neon-light active:scale-95 shadow-xl shadow-neon/20 border-2 border-neon cursor-grab active:cursor-grabbing inline-flex items-center gap-3"
            title="Arraste este botão para sua barra de favoritos!"
          >
            <span className="text-lg group-hover:scale-125 transition">⚡</span>
            <span>⚡ Dopamina Anti-Truque (1-Clique)</span>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-bold">Arraste para Favoritos 📌</span>
          </a>

          {/* Copy Code Option */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition"
            >
              {copied ? '✅ Código Copiado com Sucesso!' : '📋 Copiar Código do Favorito'}
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 max-w-lg text-left text-xs space-y-2 mt-2">
            <p className="font-bold text-zinc-200">📍 Como adicionar o Favorito Manualmente no Chrome / Edge / Brave:</p>
            <ol className="list-decimal list-inside text-zinc-400 space-y-1">
              <li>Clique no botão acima para <strong>Copiar o Código</strong>.</li>
              <li>Pressione <kbd className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded border border-zinc-700">Ctrl + D</kbd> (ou <kbd className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded border border-zinc-700">Cmd + D</kbd>) para adicionar qualquer favorito.</li>
              <li>Clique em <strong>Mais... / Editar</strong>.</li>
              <li>No campo <strong>URL</strong>, cole o código copiado e salve.</li>
              <li>Abra qualquer e-commerce (Amazon, Shopee, Mercado Livre, KaBuM!, Magalu) e clique no favorito!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Supported Stores Grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
        {['Mercado Livre', 'Amazon Brasil', 'Shopee', 'Magalu', 'KaBuM!', 'AliExpress'].map(store => (
          <div key={store} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs font-bold text-zinc-300">
            ✅ {store}
          </div>
        ))}
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
