'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { trackEvent } from '@/lib/tracking';

interface WrappedSlide {
  id: string;
  bgGradient: string;
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  detail?: string;
}

function getArchetype(totalSpent: number, purchaseCount: number, level: number): { name: string; emoji: string; description: string } {
  if (level >= 6) return { name: 'O CEO da Shopee Imaginária', emoji: '👑', description: 'Gastou tanto que já poderia ter aberto a própria loja. Mas não abriu. Porque comprar é mais divertido que vender.' };
  if (totalSpent > 200000) return { name: 'O Predador Digital', emoji: '🦈', description: 'Ataca com velocidade cirúrgica. Viu, quis, comprou. Sem remorso. Sem review. Puro instinto.' };
  if (purchaseCount > 10) return { name: 'O Maratonista Compulsivo', emoji: '🏃', description: 'Não compra por necessidade. Compra pelo ritual. O clique no botão é o vício, não o produto.' };
  if (totalSpent > 50000) return { name: 'O Entusiasta Cauteloso', emoji: '🦊', description: 'Pesquisa 47 reviews, compara preços em 12 sites... e depois compra por impulso às 2AM.' };
  if (purchaseCount > 3) return { name: 'O Explorador Curioso', emoji: '🔍', description: 'Ainda testando as águas. Mas a dopamina já pegou. É questão de tempo.' };
  return { name: 'O Novato Inocente', emoji: '🐣', description: 'Ainda não entendeu que a loja é falsa. Ou entendeu e não se importa. Ambos são preocupantes.' };
}

function getPeakHour(): { hour: number; label: string; insight: string } {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) return { hour, label: `${hour}AM`, insight: 'Compras de madrugada. Cortisol alto + defesas baixas = carteira aberta.' };
  if (hour >= 5 && hour < 9) return { hour, label: `${hour}AM`, insight: 'Comprador matinal. Decide antes do café. Perigoso.' };
  if (hour >= 9 && hour < 12) return { hour, label: `${hour}AM`, insight: 'Comprando no horário de trabalho. Dopamina > produtividade.' };
  if (hour >= 12 && hour < 14) return { hour, label: `${hour}h`, insight: 'Hora do almoço = hora da compra. O estômago cheio libera serotonina, que enfraquece suas defesas.' };
  if (hour >= 14 && hour < 18) return { hour, label: `${hour}h`, insight: 'Tarde. O tédio pós-almoço é o melhor amigo do e-commerce.' };
  if (hour >= 18 && hour < 22) return { hour, label: `${hour}h`, insight: 'Noite. Dia cansativo = decisões ruins. É ciência.' };
  return { hour, label: `${hour}h`, insight: 'Noite alta. A fadiga de decisão está no máximo. Compras agora são 73% mais impulsivas.' };
}

export default function DopaminaWrapped() {
  const { xp, level, levelTitle, levelEmoji, totalSpent, purchaseCount, achievements, orders, nickname } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const archetype = getArchetype(totalSpent, purchaseCount, level);
  const peakHour = getPeakHour();

  // Compute favorite category from orders
  const categoryCount: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.name.toLowerCase().includes('rtx') || item.name.toLowerCase().includes('placa') ? 'Placas de Vídeo' :
                  item.name.toLowerCase().includes('macbook') || item.name.toLowerCase().includes('mac') ? 'MacBooks' :
                  item.name.toLowerCase().includes('pc') || item.name.toLowerCase().includes('gamer') ? 'PCs Gamer' :
                  'Outros';
      categoryCount[key] = (categoryCount[key] || 0) + 1;
    });
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhuma ainda';
  const topCategoryCount = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[1] || 0;

  const hasImmunity = achievements.includes('dopamine_immune');

  const slides: WrappedSlide[] = [
    {
      id: 'total-spent',
      bgGradient: 'from-emerald-900/80 to-zinc-950',
      icon: '💸',
      title: 'Em 2026, você gastou',
      value: `R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: 'que não existem. 🎉',
      detail: `Em ${purchaseCount} compras fictícias. Dinheiro real economizado: tudo isso.`,
    },
    {
      id: 'favorite-product',
      bgGradient: 'from-purple-900/80 to-zinc-950',
      icon: '🏆',
      title: 'Seu vício favorito',
      value: topCategory,
      subtitle: `Você adicionou ${topCategoryCount}x essa categoria.`,
      detail: 'O cérebro busca padrões de recompensa. Você encontrou o seu.',
    },
    {
      id: 'peak-hour',
      bgGradient: 'from-blue-900/80 to-zinc-950',
      icon: '🌙',
      title: 'Você compra mais às',
      value: peakHour.label,
      subtitle: peakHour.insight,
      detail: 'Coincidência? Não. Neurociência.',
    },
    {
      id: 'archetype',
      bgGradient: 'from-amber-900/80 to-zinc-950',
      icon: archetype.emoji,
      title: 'Seu arquétipo de consumidor',
      value: archetype.name,
      subtitle: archetype.description,
    },
    {
      id: 'level',
      bgGradient: 'from-red-900/80 to-zinc-950',
      icon: levelEmoji,
      title: 'Seu nível de vício',
      value: `Nível ${level} — ${levelTitle}`,
      subtitle: `${xp.toLocaleString('pt-BR')} XP acumulados. ${achievements.length} achievements.`,
      detail: hasImmunity ? '🛡️ Você completou o Treinamento de Resistência. Respeito.' : 'Você ainda não completou o Treinamento de Resistência. 😏',
    },
    {
      id: 'final',
      bgGradient: 'from-neon/20 to-zinc-950',
      icon: '⚡',
      title: 'Dopamina Wrapped 2026',
      value: nickname,
      subtitle: `${archetype.emoji} ${archetype.name}`,
      detail: `Nível ${level} · R$ ${totalSpent.toLocaleString('pt-BR')} gastos · ${purchaseCount} compras`,
    },
  ];

  const generateShareImage = useCallback(async () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#0f1a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Border
    ctx.strokeStyle = '#ccff0040';
    ctx.lineWidth = 2;
    ctx.roundRect(10, 10, 580, 780, 20);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ccff00';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ DOPAMINA WRAPPED 2026', 300, 60);

    // Nickname
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(nickname, 300, 110);

    // Archetype
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText(`${archetype.emoji} ${archetype.name}`, 300, 160);

    // Stats boxes
    const stats = [
      { label: 'GASTO FICTÍCIO', value: `R$ ${totalSpent.toLocaleString('pt-BR')}` },
      { label: 'COMPRAS', value: purchaseCount.toString() },
      { label: 'NÍVEL', value: `${level} — ${levelTitle}` },
      { label: 'XP TOTAL', value: xp.toLocaleString('pt-BR') },
      { label: 'ACHIEVEMENTS', value: achievements.length.toString() },
      { label: 'VÍCIO FAVORITO', value: topCategory },
    ];

    stats.forEach((stat, i) => {
      const x = i % 2 === 0 ? 40 : 310;
      const y = 210 + Math.floor(i / 2) * 120;

      ctx.fillStyle = '#ffffff08';
      ctx.beginPath();
      ctx.roundRect(x, y, 250, 100, 12);
      ctx.fill();

      ctx.strokeStyle = '#ccff0020';
      ctx.beginPath();
      ctx.roundRect(x, y, 250, 100, 12);
      ctx.stroke();

      ctx.fillStyle = '#ccff00';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, x + 16, y + 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(stat.value, x + 16, y + 65);
    });

    // Footer
    ctx.fillStyle = '#ffffff40';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('dopaminado.com.br', 300, 760);

    // Download
    const link = document.createElement('a');
    link.download = `dopamina-wrapped-${nickname.replace(/\s/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setIsGeneratingImage(false);
    trackEvent('wrapped_shared' as any, undefined, undefined, { method: 'download' });
  }, [nickname, archetype, totalSpent, purchaseCount, level, levelTitle, xp, achievements, topCategory]);

  const shareWhatsApp = () => {
    const text = `⚡ Meu Dopamina Wrapped 2026:\n\n${archetype.emoji} ${archetype.name}\n💸 Gastei R$ ${totalSpent.toLocaleString('pt-BR')} fictícios\n🏆 Nível ${level} — ${levelTitle}\n🎯 ${purchaseCount} compras · ${achievements.length} achievements\n\nDescubra seu perfil: dopaminado.com.br`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    trackEvent('wrapped_shared' as any, undefined, undefined, { method: 'whatsapp' });
  };

  const shareX = () => {
    const text = `${archetype.emoji} Meu perfil de consumidor é "${archetype.name}" — Gastei R$ ${totalSpent.toLocaleString('pt-BR')} fictícios no @DopaminaBR\n\nDescubra o seu: dopaminado.com.br`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    trackEvent('wrapped_shared' as any, undefined, undefined, { method: 'twitter' });
  };

  if (purchaseCount === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <span className="text-4xl">📊</span>
        <h3 className="text-sm font-bold text-zinc-400 mt-2">Dopamina Wrapped</h3>
        <p className="text-xs text-zinc-600 mt-1">Faça pelo menos 1 compra para gerar seu relatório.</p>
      </div>
    );
  }

  return (
    <>
      {/* Entry Card */}
      <button
        onClick={() => { setIsOpen(true); setCurrentSlide(0); trackEvent('wrapped_generated' as any); }}
        className="w-full rounded-2xl border border-neon/20 bg-gradient-to-r from-purple-900/30 via-zinc-900 to-emerald-900/30 p-6 text-left transition hover:border-neon/40 hover:shadow-lg hover:shadow-neon/5 group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neon font-bold mb-1">✨ SEU RELATÓRIO ESTÁ PRONTO</p>
            <h3 className="text-lg font-black text-zinc-100">Dopamina Wrapped 2026</h3>
            <p className="text-xs text-zinc-500 mt-1">Descubra seu perfil de consumidor e compartilhe</p>
          </div>
          <span className="text-4xl group-hover:scale-110 transition">📊</span>
        </div>
      </button>

      {/* Wrapped Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-md mx-4">
            {/* Slide */}
            <div
              className={`relative rounded-3xl border border-zinc-700/50 bg-gradient-to-b ${slides[currentSlide].bgGradient} p-8 text-center shadow-2xl min-h-[400px] flex flex-col items-center justify-center`}
              style={{ animation: 'wrappedFadeIn 0.5s ease-out' }}
              key={currentSlide}
            >
              <span className="text-5xl mb-4">{slides[currentSlide].icon}</span>
              <p className="text-sm text-zinc-400 font-bold">{slides[currentSlide].title}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 mt-2 leading-tight">{slides[currentSlide].value}</h2>
              <p className="text-sm text-zinc-400 mt-3">{slides[currentSlide].subtitle}</p>
              {slides[currentSlide].detail && (
                <p className="text-xs text-zinc-600 mt-2">{slides[currentSlide].detail}</p>
              )}

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition ${i === currentSlide ? 'bg-neon' : 'bg-zinc-700'}`} />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentSlide(c => Math.max(0, c - 1))}
                disabled={currentSlide === 0}
                className="rounded-full bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-400 transition hover:bg-zinc-700 disabled:opacity-30"
              >
                ← Anterior
              </button>

              {currentSlide === slides.length - 1 ? (
                <div className="flex gap-2">
                  <button onClick={shareWhatsApp} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition">
                    WhatsApp
                  </button>
                  <button onClick={shareX} className="rounded-full bg-zinc-700 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-600 transition">
                    𝕏
                  </button>
                  <button
                    onClick={generateShareImage}
                    disabled={isGeneratingImage}
                    className="rounded-full bg-neon px-3 py-2 text-xs font-bold text-black hover:bg-neon-light transition disabled:opacity-50"
                  >
                    {isGeneratingImage ? '...' : '📥 Baixar'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentSlide(c => Math.min(slides.length - 1, c + 1))}
                  className="rounded-full bg-neon px-4 py-2 text-xs font-bold text-black transition hover:bg-neon-light"
                >
                  Próximo →
                </button>
              )}
            </div>

            <button onClick={() => setIsOpen(false)} className="w-full text-center text-xs text-zinc-600 mt-3 hover:text-zinc-400 transition">
              fechar
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <style jsx global>{`
        @keyframes wrappedFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
