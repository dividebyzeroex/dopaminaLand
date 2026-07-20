'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '@/lib/tracking';

interface BrowserSignal {
  icon: string;
  label: string;
  value: string;
  insight: string;
  category: 'hardware' | 'behavior' | 'desire' | 'psycho';
}

// Map browser signals to satirical consumer insights
function inferDesires(signals: BrowserSignal[]): string[] {
  const desires: string[] = [];
  
  signals.forEach(s => {
    if (s.label === 'Tela' && parseInt(s.value) > 1920) desires.push('Monitores Ultrawide & TVs 4K');
    if (s.label === 'Tela' && parseInt(s.value) <= 1366) desires.push('Notebooks Compactos & Tablets');
    if (s.label === 'RAM' && parseInt(s.value) >= 8) desires.push('PC Gamer & Workstations');
    if (s.label === 'RAM' && parseInt(s.value) < 8) desires.push('Celulares Básicos & Acessórios');
    if (s.label === 'CPU Cores' && parseInt(s.value) >= 8) desires.push('Processadores High-End');
    if (s.label === 'GPU') desires.push('Placas de Vídeo & Periféricos Gamer');
    if (s.label === 'Bateria' && parseInt(s.value) < 50) desires.push('Carregadores Portáteis & Power Banks');
    if (s.label === 'Tema' && s.value.includes('Escuro')) desires.push('Acessórios Dark/Cyberpunk');
    if (s.label === 'Tema' && s.value.includes('Claro')) desires.push('Produtos Minimalistas & Clean');
    if (s.label === 'Idioma' && s.value.includes('pt')) desires.push('Produtos Nacionais 🇧🇷');
    if (s.label === 'Idioma' && s.value.includes('en')) desires.push('Gadgets Importados');
    if (s.label === 'Conexão' && s.value.includes('4g')) desires.push('Roteadores Wi-Fi & Mesh');
    if (s.label === 'Touch') desires.push('Capinhas de Celular & Películas');
    if (s.label === 'Fuso Horário' && s.value.includes('Sao_Paulo')) desires.push('Café Gourmet ☕');
  });

  // Always add some funny ones
  desires.push('Terapia (brincadeira... ou não?)');
  desires.push('Mais Dopamina (óbvio)');

  return [...new Set(desires)].slice(0, 8);
}

function getConsumerArchetype(signals: BrowserSignal[]): { name: string; emoji: string; description: string } {
  const ram = signals.find(s => s.label === 'RAM');
  const cores = signals.find(s => s.label === 'CPU Cores');
  const battery = signals.find(s => s.label === 'Bateria');
  const theme = signals.find(s => s.label === 'Tema');

  const ramVal = ram ? parseInt(ram.value) : 4;
  const coreVal = cores ? parseInt(cores.value) : 4;

  if (ramVal >= 16 && coreVal >= 8) {
    return { name: 'O Predador Digital', emoji: '🦈', description: 'Setup brutal. Compra por impulso com internet de alta velocidade. Já tem tudo, mas quer mais.' };
  }
  if (ramVal >= 8) {
    return { name: 'O Entusiasta Cauteloso', emoji: '🦊', description: 'Pesquisa 47 reviews antes de comprar. Adiciona ao carrinho e fecha a aba. Volta 3 dias depois.' };
  }
  if (battery && parseInt(battery.value) < 30) {
    return { name: 'O Comprador Desesperado', emoji: '🔥', description: 'Navegando com bateria baixa. Compra rápido antes do celular morrer. Sem tempo pra pensar.' };
  }
  if (theme?.value.includes('Escuro')) {
    return { name: 'O Coruja Noturna', emoji: '🦉', description: 'Faz compras às 3h da manhã no modo escuro. Decisões duvidosas. Arrepende de manhã.' };
  }
  return { name: 'O Explorador Casual', emoji: '🐨', description: 'Navega sem pressa. Coloca coisas no carrinho por diversão. Nunca finaliza (até agora).' };
}

export default function DigitalDnaScanner() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [signals, setSignals] = useState<BrowserSignal[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  const runScan = useCallback(async () => {
    setScanning(true);
    setProgress(0);
    setScanComplete(false);
    setRevealedCount(0);

    const detectedSignals: BrowserSignal[] = [];
    const nav = navigator as any;

    // Simulate dramatic progress
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 40));
      setProgress(i);
    }

    // ──── Collect real browser signals ────
    // Screen
    detectedSignals.push({
      icon: '🖥️', label: 'Tela', value: `${screen.width}x${screen.height}`,
      insight: screen.width > 1920 ? 'Tela grande = desejo por experiências visuais ricas' : 'Tela compacta = compra rápida no celular',
      category: 'hardware',
    });

    // Pixel ratio (Retina?)
    detectedSignals.push({
      icon: '✨', label: 'Pixel Ratio', value: `${window.devicePixelRatio}x`,
      insight: window.devicePixelRatio > 1 ? 'Display premium detectado — gosto refinado confirmado' : 'Tela padrão — foco em custo-benefício',
      category: 'hardware',
    });

    // RAM
    if (nav.deviceMemory) {
      detectedSignals.push({
        icon: '🧠', label: 'RAM', value: `${nav.deviceMemory}GB`,
        insight: nav.deviceMemory >= 8 ? 'Hardware potente = tendência a compras de alto valor' : 'Hardware modesto = caçador de ofertas',
        category: 'hardware',
      });
    }

    // CPU Cores
    if (nav.hardwareConcurrency) {
      detectedSignals.push({
        icon: '⚙️', label: 'CPU Cores', value: `${nav.hardwareConcurrency}`,
        insight: nav.hardwareConcurrency >= 8 ? 'Processador multi-core = multitarefa obsessiva de comparação de preços' : 'Processador básico = comprador direto ao ponto',
        category: 'hardware',
      });
    }

    // GPU (WebGL)
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
          detectedSignals.push({
            icon: '🎮', label: 'GPU', value: renderer.substring(0, 40),
            insight: renderer.toLowerCase().includes('nvidia') || renderer.toLowerCase().includes('radeon') ? 'GPU dedicada = gamer confirmado, vulnerável a periféricos RGB' : 'GPU integrada = usuário pragmático',
            category: 'hardware',
          });
        }
      }
    } catch {}

    // Battery
    try {
      const battery: any = await (nav as any).getBattery?.();
      if (battery) {
        const pct = Math.round(battery.level * 100);
        detectedSignals.push({
          icon: '🔋', label: 'Bateria', value: `${pct}%${battery.charging ? ' ⚡' : ''}`,
          insight: pct < 30 ? 'BATERIA BAIXA = urgência máxima. Compra por impulso iminente!' : pct < 60 ? 'Bateria média = decisão moderada' : 'Bateria cheia = navegação prolongada de vitrines',
          category: 'behavior',
        });
      }
    } catch {}

    // Connection
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      detectedSignals.push({
        icon: '📶', label: 'Conexão', value: `${conn.effectiveType?.toUpperCase() || 'Desconhecida'}${conn.downlink ? ` (${conn.downlink}Mbps)` : ''}`,
        insight: conn.effectiveType === '4g' ? 'Internet rápida = menos paciência, mais cliques impulsivos' : 'Internet lenta = cada clique é pensado com cuidado',
        category: 'behavior',
      });
      if (conn.saveData) {
        detectedSignals.push({
          icon: '💾', label: 'Economia de Dados', value: 'ATIVA',
          insight: 'Modo economia = consciência financeira. Mas... a tentação é forte.',
          category: 'behavior',
        });
      }
    }

    // Dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    detectedSignals.push({
      icon: prefersDark ? '🌙' : '☀️', label: 'Tema', value: prefersDark ? 'Modo Escuro' : 'Modo Claro',
      insight: prefersDark ? 'Modo escuro = compras noturnas, menos inibição, mais dopamina' : 'Modo claro = compras racionais (mas não imune à tentação)',
      category: 'psycho',
    });

    // Language
    detectedSignals.push({
      icon: '🌐', label: 'Idioma', value: navigator.language,
      insight: navigator.language.startsWith('pt') ? 'Brasileiro confirmado — vulnerável a promoções relâmpago e frete grátis' : 'Idioma estrangeiro — possível influência de tendências globais',
      category: 'psycho',
    });

    // Timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    detectedSignals.push({
      icon: '🕐', label: 'Fuso Horário', value: tz,
      insight: tz.includes('Sao_Paulo') ? 'São Paulo timezone — capital do consumo brasileiro' : `Timezone ${tz} — consumidor de nicho regional`,
      category: 'psycho',
    });

    // Touch capability
    if (navigator.maxTouchPoints > 0) {
      detectedSignals.push({
        icon: '👆', label: 'Touch', value: `${navigator.maxTouchPoints} pontos`,
        insight: 'Dispositivo touch = scroll infinito de feeds de compras. Dedo já está treinado.',
        category: 'behavior',
      });
    }

    // Time of day analysis
    const hour = new Date().getHours();
    let timeInsight = '';
    if (hour >= 0 && hour < 6) timeInsight = 'MADRUGADA — Zona de perigo máximo. Zero filtros racionais.';
    else if (hour < 12) timeInsight = 'Manhã — Decisões mais conscientes... por enquanto.';
    else if (hour < 18) timeInsight = 'Tarde — Tédio pós-almoço = gatilho de compras.';
    else timeInsight = 'Noite — Modo relaxamento ativo. Defesas mentais baixas.';
    
    detectedSignals.push({
      icon: hour < 6 ? '🌃' : hour < 12 ? '🌅' : hour < 18 ? '🌤️' : '🌆',
      label: 'Horário', value: `${String(hour).padStart(2, '0')}h`,
      insight: timeInsight,
      category: 'psycho',
    });

    // Cookies count (our own domain only)
    const cookieCount = document.cookie ? document.cookie.split(';').length : 0;
    detectedSignals.push({
      icon: '🍪', label: 'Cookies', value: `${cookieCount} encontrados`,
      insight: cookieCount > 5 ? 'Muitos cookies = visitante frequente. Já está no funil de conversão.' : 'Poucos cookies = visitante novo. Momento de primeira impressão.',
      category: 'behavior',
    });

    // LocalStorage keys
    const lsKeys = Object.keys(localStorage).length;
    detectedSignals.push({
      icon: '📦', label: 'Dados Locais', value: `${lsKeys} registros`,
      insight: lsKeys > 10 ? 'Muitos dados armazenados = usuário engajado com múltiplos sites' : 'Poucos dados = navegação limpa ou modo anônimo',
      category: 'behavior',
    });

    // Reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      detectedSignals.push({
        icon: '🧘', label: 'Animações', value: 'Reduzidas',
        insight: 'Preferência por menos movimento = comprador focado e deliberado',
        category: 'psycho',
      });
    }

    setSignals(detectedSignals);
    setScanComplete(true);
    setScanning(false);

    // Send to telemetry
    const telemetryPayload: Record<string, string> = {};
    detectedSignals.forEach(s => {
      telemetryPayload[s.label.toLowerCase().replace(/\s/g, '_')] = s.value;
    });
    trackEvent('digital_dna_scan', undefined, undefined, telemetryPayload);

    // Reveal signals one by one for dramatic effect
    for (let i = 0; i < detectedSignals.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      setRevealedCount(i + 1);
    }
  }, []);

  const archetype = scanComplete ? getConsumerArchetype(signals) : null;
  const desires = scanComplete ? inferDesires(signals) : [];

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-b from-card to-surface p-6 md:p-8 shadow-2xl overflow-hidden relative">
      {/* Decorative grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(204,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🧬</p>
          <h2 className="text-2xl font-black text-foreground">Scanner de DNA Digital</h2>
          <p className="text-sm text-muted mt-1">
            Analisamos seu navegador para revelar seus desejos de consumo ocultos
          </p>
        </div>

        {/* Scan Button / Progress */}
        {!scanComplete && (
          <div className="text-center">
            {scanning ? (
              <div className="space-y-4">
                <div className="mx-auto w-full max-w-sm">
                  <div className="h-3 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon via-cyan-400 to-neon transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-mono text-neon animate-pulse">
                  {progress < 20 && '🔍 Escaneando cookies...'}
                  {progress >= 20 && progress < 40 && '🧠 Analisando hardware...'}
                  {progress >= 40 && progress < 60 && '📡 Interceptando sinais...'}
                  {progress >= 60 && progress < 80 && '🎯 Mapeando desejos ocultos...'}
                  {progress >= 80 && '🧬 Decodificando DNA digital...'}
                </p>
              </div>
            ) : (
              <button
                onClick={runScan}
                className="rounded-2xl bg-gradient-to-r from-neon to-cyan-400 px-8 py-4 text-lg font-extrabold text-background transition hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(204,255,0,0.3)]"
              >
                🧬 ESCANEAR MEU DNA DIGITAL
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {scanComplete && (
          <div className="space-y-6 animate-fade-in">
            {/* Consumer Archetype */}
            {archetype && (
              <div className="rounded-2xl border border-neon/20 bg-neon/5 p-6 text-center">
                <p className="text-5xl mb-2">{archetype.emoji}</p>
                <h3 className="text-xl font-black text-neon">{archetype.name}</h3>
                <p className="text-sm text-muted mt-2 max-w-md mx-auto">{archetype.description}</p>
              </div>
            )}

            {/* Detected Signals Grid */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Sinais Detectados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {signals.slice(0, revealedCount).map((signal, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 transition-all duration-300 ${
                      signal.category === 'psycho' ? 'border-violet-500/20 bg-violet-500/5' :
                      signal.category === 'desire' ? 'border-orange-500/20 bg-orange-500/5' :
                      signal.category === 'behavior' ? 'border-cyan-500/20 bg-cyan-500/5' :
                      'border-border bg-black/20'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{signal.icon}</span>
                      <span className="text-xs font-bold text-muted uppercase">{signal.label}</span>
                      <span className="ml-auto text-xs font-black text-foreground">{signal.value}</span>
                    </div>
                    <p className="text-[11px] text-muted leading-snug">{signal.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inferred Desires */}
            {desires.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">🎯 Desejos de Consumo Detectados</h3>
                <div className="flex flex-wrap gap-2">
                  {desires.map((desire, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-neon/10 border border-neon/20 px-3 py-1.5 text-xs font-bold text-neon"
                    >
                      {desire}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rescan */}
            <div className="text-center pt-2">
              <button
                onClick={runScan}
                className="text-xs text-muted hover:text-neon transition font-bold"
              >
                🔄 Escanear novamente
              </button>
            </div>

            {/* Fine print */}
            <p className="text-[9px] text-muted/30 text-center leading-relaxed">
              Nenhum dado de terceiros foi acessado. Todas as análises usam APIs públicas do navegador (Same-Origin Policy respeitada).
              As "previsões" são uma sátira sobre práticas reais de tracking digital. Nenhum dado é vendido, compartilhado ou usado para fins maliciosos. É tudo zoeira.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
