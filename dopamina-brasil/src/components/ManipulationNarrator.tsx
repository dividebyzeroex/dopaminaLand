'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/tracking';

// ─── Pre-written contextual commentary ───
interface NarratorLine {
  trigger: string;
  lines: string[];
  technique: string;
}

const NARRATOR_LINES: NarratorLine[] = [
  {
    trigger: 'page_load',
    technique: 'Priming',
    lines: [
      'Bem-vindo de volta. O fundo escuro e o verde neon não são acidentais — eles ativam seu sistema de recompensa antes mesmo de você ver um produto. Isso se chama Priming. 🧠',
      'Percebeu como a página carrega rápido? Velocidade reduz a "fricção cognitiva". Quanto menos você pensa, mais compra. Neuro-marketing 101.',
      'O layout foi desenhado pra seu olho ir direto pro preço com desconto. Você nem percebeu, mas seu cérebro já está calculando a "economia".',
    ],
  },
  {
    trigger: 'view_item',
    technique: 'Ancoragem Cognitiva',
    lines: [
      'Olhando um produto? O preço "original" riscado existe apenas pra ancorar seu cérebro num valor alto. Agora o preço real parece uma pechincha. Clássica Ancoragem. ⚓',
      'Você está comparando preços mentalmente. Mas comparando com o quê? Com o preço riscado que nós colocamos ali. Você nem percebeu que te demos a régua. 📏',
      'As estrelas de avaliação ativam o Viés de Conformidade. "Se 4.337 pessoas aprovaram, deve ser bom." Seu cérebro é preguiçoso assim. ⭐',
      'Sabia que produtos com imagem maior parecem mais valiosos? Seu cérebro primitivo associa tamanho com importância. Psicologia da Gestalt. 🖼️',
    ],
  },
  {
    trigger: 'add_to_cart',
    technique: 'Efeito Dotação',
    lines: [
      'Adicionou ao carrinho! O Efeito Dotação acabou de ativar. Agora seu cérebro sente que o produto já é seu. Tirá-lo do carrinho vai doer mais do que nunca tê-lo adicionado. 🧲',
      'Cada item no carrinho aumenta o "custo afundado" psicológico. Você investiu cliques, tempo, decisão. Sair agora? Seria "desperdiçar" tudo isso. 💸',
      'O som sutil e a animação do botão liberaram uma micro-dose de dopamina. Literalmente. É por isso que a gente existe. ⚡',
      '"Adicionar ao carrinho" em vez de "Comprar" reduz a ansiedade. Você não está comprando, está só... guardando. Inofensivo, né? Haha. 🛒',
    ],
  },
  {
    trigger: 'scroll',
    technique: 'Comprometimento Escalado',
    lines: [
      'Quanto mais você scrolla, mais o Viés de Comprometimento te prende. Você já investiu atenção demais pra fechar a aba agora. Parabéns, você é refém do scroll. 📜',
      'O scroll infinito foi inventado pra eliminar "pontos de saída". Se a página tivesse fim, você pararia pra pensar. Mas não tem fim. Nunca tem. ♾️',
      'Cada produto novo que aparece é um "loop de dopamina". Novidade → antecipação → micro-recompensa → repetir. Seu cérebro é um hamster na rodinha. 🐹',
    ],
  },
  {
    trigger: 'dwell_time',
    technique: 'Paralisia da Escolha',
    lines: [
      'Você tá parado há um tempão olhando isso. A Paralisia da Escolha te travou. Muitas opções = ansiedade. A solução que seu cérebro encontra? Comprar o primeiro que parecer "bom o suficiente". 🎯',
      '30 segundos no mesmo produto. Nesse tempo, 14 algoritmos de e-commerce real já ajustaram seus anúncios de retargeting. Aqui a gente só te conta. 👁️',
      'Quanto mais tempo olhando, mais familiar o produto fica. Familiaridade gera confiança falsa. Isso se chama Efeito da Mera Exposição. 🔄',
    ],
  },
  {
    trigger: 'fake_checkout',
    technique: 'Dopamina de Compra',
    lines: [
      'CHECKOUT! O pico de dopamina que você sentiu agora é IDÊNTICO ao de uma compra real. Só que aqui custa R$ 0,00. De nada. 🎰',
      'O botão verde brilhante no checkout ativa o centro de recompensa. A cor verde significa "seguro, pode ir". Psicologia da Cor em ação. 🟢',
      'Sabia que lojas reais escondem o botão de "continuar comprando" no checkout? É pra você não desistir. Nós mostramos pra te educar. 🎓',
    ],
  },
  {
    trigger: 'fomo_toast',
    technique: 'Prova Social',
    lines: [
      'Aquele toast de "alguém comprou"? Prova Social pura. Se outros estão comprando, deve ser seguro. Seu cérebro tribal não evoluiu pra distinguir pop-ups de decisões reais. 🏕️',
      '"127 pessoas compraram hoje" — Viés de Bandwagon. Se todo mundo tá fazendo, deve ser certo. Spoiler: nem sempre é. 🎪',
    ],
  },
  {
    trigger: 'discount_badge',
    technique: 'Enquadramento',
    lines: [
      'O badge de "-15%" usa Enquadramento. Ele mostra quanto você "economiza" em vez de quanto você gasta. Truque de perspectiva. Você não economiza comprando. Você economiza não comprando. 🏷️',
      '"De R$ 66.144 por R$ 56.054" — seu cérebro fez a conta da economia (R$ 10.090!) antes de questionar se você precisa disso. Ancoragem + Enquadramento = combo fatal. 💀',
    ],
  },
  {
    trigger: 'cart_full',
    technique: 'Efeito IKEA',
    lines: [
      'Carrinho cheio! O Efeito IKEA diz que quanto mais esforço você coloca em algo, mais valor atribui. Você montou esse carrinho com carinho. Abandoná-lo? Impensável. 🔧',
      'Cada item no carrinho é um "compromisso micro". Psicólogos chamam isso de "Foot-in-the-Door". Primeiro um clique, depois dois, depois... checkout. 🚪',
    ],
  },
  {
    trigger: 'return_visit',
    technique: 'Loop de Hábito',
    lines: [
      'Você voltou! O Loop de Hábito (gatilho → rotina → recompensa) está se formando. O gatilho: tédio. A rotina: abrir o site. A recompensa: dopamina. Charles Duhigg ficaria orgulhoso. 🔁',
      'Visitantes que retornam convertem 73% mais que novos. Não porque o site melhorou — porque seu cérebro já criou o hábito. Pavlov mandou abraços. 🐕',
    ],
  },
  {
    trigger: 'idle',
    technique: 'Efeito Zeigarnik',
    lines: [
      'Parou de interagir? O Efeito Zeigarnik diz que seu cérebro não vai esquecer as tarefas incompletas. Aquele produto no carrinho? Vai te perseguir. 👻',
      'O silêncio também é uma técnica. Sem estímulos, seu cérebro busca a recompensa mais fácil. Que tal... scrollar mais um pouquinho? 😏',
      'Sabia que 68% das compras online acontecem em momentos de tédio? Você não precisa do produto. Precisa de estímulo. E nós fornecemos. 🎭',
    ],
  },
];

// ─── Component ───
export default function ManipulationNarrator() {
  const [messages, setMessages] = useState<{ id: number; text: string; technique: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentTechnique, setCurrentTechnique] = useState('');
  const messageIdRef = useRef(0);
  const lastTriggerRef = useRef('');
  const queueRef = useRef<{ text: string; technique: string }[]>([]);
  const isProcessingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Don't render in iframes
  const [inIframe, setInIframe] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) setInIframe(true);
  }, []);

  const pickLine = useCallback((trigger: string) => {
    const group = NARRATOR_LINES.find(n => n.trigger === trigger);
    if (!group) return null;
    const line = group.lines[Math.floor(Math.random() * group.lines.length)];
    return { text: line, technique: group.technique };
  }, []);

  // Typewriter effect processor
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return;
    isProcessingRef.current = true;

    const item = queueRef.current.shift()!;
    setCurrentTechnique(item.technique);
    setIsTyping(true);
    setDisplayedText('');

    let i = 0;
    const chars = item.text.split('');
    const typeInterval = setInterval(() => {
      if (i < chars.length) {
        setDisplayedText(prev => prev + chars[i]);
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        const id = ++messageIdRef.current;
        setMessages(prev => [...prev.slice(-4), { id, text: item.text, technique: item.technique }]);
        setDisplayedText('');
        setCurrentTechnique('');
        isProcessingRef.current = false;

        // Process next in queue after a delay
        setTimeout(() => processQueue(), 3000);
      }
    }, 18);
  }, []);

  const queueNarration = useCallback((trigger: string) => {
    if (trigger === lastTriggerRef.current) return; // Don't repeat same trigger consecutively
    lastTriggerRef.current = trigger;

    const item = pickLine(trigger);
    if (!item) return;

    queueRef.current.push(item);
    if (!isProcessingRef.current) {
      processQueue();
    }
  }, [pickLine, processQueue]);

  // Listen for custom narration events
  useEffect(() => {
    if (inIframe) return;

    const handleNarrate = (e: CustomEvent) => {
      queueNarration(e.detail.trigger);
    };

    window.addEventListener('dopamina:narrate' as any, handleNarrate);

    // Show narrator after intro sequence
    const timer = setTimeout(() => {
      setIsVisible(true);
      queueNarration('page_load');
    }, 5000);

    // Idle detection
    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => queueNarration('idle'), 120000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('scroll', resetIdle);
    window.addEventListener('click', resetIdle);
    resetIdle();

    // Scroll depth narration
    let hasScrolled50 = false;
    const onScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 40 && !hasScrolled50) {
        hasScrolled50 = true;
        queueNarration('scroll');
      }
    };
    window.addEventListener('scroll', onScroll);

    // Return visit detection
    try {
      const lastVisit = localStorage.getItem('dopamina-narrator-last');
      if (lastVisit) {
        const hoursSince = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60);
        if (hoursSince > 1) {
          setTimeout(() => queueNarration('return_visit'), 8000);
        }
      }
      localStorage.setItem('dopamina-narrator-last', Date.now().toString());
    } catch {}

    return () => {
      clearTimeout(timer);
      clearTimeout(idleTimer);
      window.removeEventListener('dopamina:narrate' as any, handleNarrate);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('click', resetIdle);
      window.removeEventListener('scroll', onScroll);
    };
  }, [inIframe, queueNarration]);

  if (inIframe || !isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-6 left-6 z-[85] transition-all duration-500 ${isMinimized ? 'w-12 h-12' : 'w-[340px] max-w-[85vw]'}`}
    >
      {isMinimized ? (
        /* Minimized bubble */
        <button
          onClick={() => { setIsMinimized(false); trackEvent('narrator_interaction' as any, undefined, undefined, { action: 'expand' }); }}
          className="w-12 h-12 rounded-full bg-purple-600/90 border border-purple-400/30 backdrop-blur-md flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 hover:scale-110 transition animate-pulse"
          title="Narrador de Manipulação"
        >
          🧠
        </button>
      ) : (
        /* Expanded narrator panel */
        <div className="rounded-2xl border border-purple-500/20 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-purple-900/30 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <div>
                <p className="text-xs font-bold text-purple-300">Sua Consciência</p>
                <p className="text-[10px] text-purple-400/70">Narrador de Manipulação</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setIsMinimized(true); trackEvent('narrator_interaction' as any, undefined, undefined, { action: 'minimize' }); }}
                className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs hover:bg-purple-500/40 transition"
              >
                −
              </button>
              <button
                onClick={() => { setIsVisible(false); trackEvent('narrator_interaction' as any, undefined, undefined, { action: 'close' }); }}
                className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 text-xs hover:bg-red-500/40 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[280px] overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                <span className="inline-block text-[9px] font-bold text-purple-400/60 bg-purple-500/10 rounded-full px-2 py-0.5 mb-1">
                  {msg.technique}
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">{msg.text}</p>
              </div>
            ))}

            {/* Currently typing */}
            {isTyping && (
              <div className="animate-fade-in">
                <span className="inline-block text-[9px] font-bold text-purple-400/60 bg-purple-500/10 rounded-full px-2 py-0.5 mb-1">
                  {currentTechnique}
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {displayedText}
                  <span className="animate-pulse text-purple-400">▌</span>
                </p>
              </div>
            )}

            {messages.length === 0 && !isTyping && (
              <p className="text-xs text-zinc-500 italic text-center py-4">
                Observando suas decisões... 👁️
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
