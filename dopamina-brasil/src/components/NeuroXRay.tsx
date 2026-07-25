'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/tracking';

interface XRayOverlay {
  id: string;
  selector: string;
  technique: string;
  icon: string;
  shortLabel: string;
  explanation: string;
  color: string;
}

const XRAY_OVERLAYS: XRayOverlay[] = [
  {
    id: 'anchor-price',
    selector: '.line-through',
    technique: 'Ancoragem',
    icon: '⚓',
    shortLabel: 'ANCORAGEM',
    explanation: 'O preço "original" riscado existe apenas para ancorar seu cérebro num valor alto. O desconto parece enorme — mas comparado a quê?',
    color: '#f97316',
  },
  {
    id: 'cta-button',
    selector: '[data-text="ADICIONAR 🛒"], button.glitch-hover',
    technique: 'Psicologia da Cor',
    icon: '🟢',
    shortLabel: 'PSICOLOGIA DA COR',
    explanation: 'Botões verdes = segurança. Seu cérebro associa verde com "pode ir, é seguro". Por isso CTAs são quase sempre verdes.',
    color: '#22c55e',
  },
  {
    id: 'discount-badge',
    selector: '.bg-pop',
    technique: 'Enquadramento',
    icon: '🏷️',
    shortLabel: 'ENQUADRAMENTO',
    explanation: 'Mostrar o desconto (%) em vez do gasto total muda a perspectiva. Você foca na "economia", não no gasto.',
    color: '#eab308',
  },
  {
    id: 'stars',
    selector: '.text-amber-400',
    technique: 'Validação Social',
    icon: '⭐',
    shortLabel: 'VALIDAÇÃO SOCIAL',
    explanation: 'Estrelas e reviews criam confiança artificial. "4.337 pessoas aprovaram" ativa o Viés de Conformidade.',
    color: '#f59e0b',
  },
  {
    id: 'installments',
    selector: '[class*="text-muted"]:has(> :not(*))',
    technique: 'Dor do Pagamento',
    icon: '💳',
    shortLabel: 'DOR DO PAGAMENTO',
    explanation: 'Parcelar divide a dor psicológica. R$ 14.000 dói. R$ 3.500 x4? Quase indolor. Mesmo total, menos sofrimento.',
    color: '#8b5cf6',
  },
  {
    id: 'product-image',
    selector: '.card-tilt .aspect-square',
    technique: 'Apelo Visual',
    icon: '🖼️',
    shortLabel: 'APELO VISUAL',
    explanation: 'Imagens grandes + fundo limpo + leve rotação no hover. Seu cérebro primitivo associa tamanho com valor.',
    color: '#06b6d4',
  },
  {
    id: 'trust-badges',
    selector: '[class*="trust"], [class*="frete"]',
    technique: 'Reciprocidade',
    icon: '🎁',
    shortLabel: 'RECIPROCIDADE',
    explanation: '"Frete Grátis" cria sensação de presente. Reciprocidade: você recebeu algo, agora sente obrigação de retribuir comprando.',
    color: '#ec4899',
  },
];

export default function NeuroXRay() {
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [hoveredOverlay, setHoveredOverlay] = useState<string | null>(null);
  const [overlayPositions, setOverlayPositions] = useState<{ id: string; rect: DOMRect; overlay: XRayOverlay }[]>([]);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) setInIframe(true);
  }, []);

  const computeOverlays = useCallback(() => {
    const positions: { id: string; rect: DOMRect; overlay: XRayOverlay }[] = [];
    const seen = new Set<Element>();

    XRAY_OVERLAYS.forEach(overlay => {
      try {
        const elements = document.querySelectorAll(overlay.selector);
        elements.forEach((el, i) => {
          if (seen.has(el)) return;
          seen.add(el);

          const rect = el.getBoundingClientRect();
          // Only include visible elements
          if (rect.width > 10 && rect.height > 10 && rect.top < window.innerHeight && rect.bottom > 0) {
            positions.push({
              id: `${overlay.id}-${i}`,
              rect: rect,
              overlay,
            });
          }
        });
      } catch {}
    });

    // Also find all text containing "sem juros" or "parcel" for installments
    const allElements = document.querySelectorAll('p, span');
    allElements.forEach((el, i) => {
      if (seen.has(el)) return;
      const text = el.textContent?.toLowerCase() || '';
      if (text.includes('sem juros') || text.includes('parcel')) {
        seen.add(el);
        const rect = el.getBoundingClientRect();
        if (rect.width > 10 && rect.height > 5 && rect.top < window.innerHeight && rect.bottom > 0) {
          positions.push({
            id: `installment-detect-${i}`,
            rect,
            overlay: XRAY_OVERLAYS.find(o => o.id === 'installments')!,
          });
        }
      }
    });

    setOverlayPositions(positions);
  }, []);

  const toggle = useCallback(() => {
    if (!active) {
      setActive(true);
      setScanning(true);
      trackEvent('neuro_xray_toggle' as any, undefined, undefined, { action: 'activate' });

      // Scanner animation
      setTimeout(() => {
        setScanning(false);
        computeOverlays();
      }, 2000);
    } else {
      setActive(false);
      setScanning(false);
      setOverlayPositions([]);
      trackEvent('neuro_xray_toggle' as any, undefined, undefined, { action: 'deactivate' });
    }
  }, [active, computeOverlays]);

  // Recompute on scroll/resize when active
  useEffect(() => {
    if (!active || scanning) return;

    const handler = () => computeOverlays();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);

    const interval = setInterval(handler, 3000); // Periodic refresh

    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      clearInterval(interval);
    };
  }, [active, scanning, computeOverlays]);

  if (inIframe) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`fixed top-[72px] right-4 z-[88] flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
          active
            ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
            : 'border-zinc-600/50 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <span className={active ? 'animate-pulse' : ''}>🔬</span>
        <span className="hidden sm:inline">{active ? 'Desativar Raio-X' : 'Raio-X'}</span>
      </button>

      {/* Scanning animation */}
      {scanning && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <div
            ref={scanLineRef}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_10px_rgba(34,211,238,0.3)]"
            style={{
              animation: 'scanDown 2s ease-in-out',
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-cyan-400 text-sm font-bold animate-pulse">🔬 ANALISANDO TÉCNICAS DE MANIPULAÇÃO...</p>
            <p className="text-cyan-400/60 text-xs mt-1">Escaneando elementos de neuro-marketing</p>
          </div>
        </div>
      )}

      {/* Overlays on detected elements */}
      {active && !scanning && overlayPositions.map(({ id, rect, overlay }) => (
        <div
          key={id}
          className="fixed z-[180] pointer-events-auto cursor-help"
          style={{
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            position: 'absolute',
          }}
          onMouseEnter={() => setHoveredOverlay(id)}
          onMouseLeave={() => setHoveredOverlay(null)}
        >
          {/* Highlight border */}
          <div
            className="absolute inset-0 rounded-lg border-2 border-dashed animate-pulse"
            style={{ borderColor: overlay.color + '80', backgroundColor: overlay.color + '08' }}
          />

          {/* Label pill */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black shadow-lg z-10"
            style={{ backgroundColor: overlay.color + '30', color: overlay.color, border: `1px solid ${overlay.color}50` }}
          >
            {overlay.icon} {overlay.shortLabel}
          </div>

          {/* Expanded tooltip on hover */}
          {hoveredOverlay === id && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[260px] rounded-xl border p-3 shadow-2xl z-20 backdrop-blur-xl"
              style={{ backgroundColor: '#0a0a0f', borderColor: overlay.color + '40' }}
            >
              <p className="text-[10px] font-bold mb-1" style={{ color: overlay.color }}>
                {overlay.icon} {overlay.technique}
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">{overlay.explanation}</p>
            </div>
          )}
        </div>
      ))}

      {/* Active state: dim background slightly + stats */}
      {active && !scanning && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[85] rounded-full border border-cyan-500/20 bg-zinc-950/90 backdrop-blur-md px-5 py-2 shadow-lg">
          <p className="text-[11px] text-cyan-400 font-bold text-center">
            🔬 {overlayPositions.length} técnicas de manipulação detectadas nesta tela
          </p>
        </div>
      )}

      {/* Inject keyframes */}
      <style jsx global>{`
        @keyframes scanDown {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }
      `}</style>
    </>
  );
}
