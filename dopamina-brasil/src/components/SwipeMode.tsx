'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/tracking';
import Image from 'next/image';

interface SwipeModeProps {
  products: Product[];
  onClose: () => void;
}

export default function SwipeMode({ products, onClose }: SwipeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [coinAnim, setCoinAnim] = useState(false);
  const [stats, setStats] = useState({ added: 0, skipped: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  const currentProduct = products[currentIndex];
  const isFinished = currentIndex >= products.length;

  const playSound = useCallback((type: 'coin' | 'woosh') => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'coin') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {}
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isFinished) return;
    setSwipeDirection(direction);

    if (direction === 'right' && currentProduct) {
      addItem({
        id: String(currentProduct.id),
        slug: currentProduct.slug,
        name: currentProduct.name || currentProduct.shortName,
        shortName: currentProduct.shortName,
        image: currentProduct.image || '',
        localImage: currentProduct.localImage || '',
        gradient: currentProduct.gradient || 'from-surface to-surface',
        originalPrice: currentProduct.originalPrice || currentProduct.salePrice,
        salePrice: currentProduct.salePrice,
        quantity: 1,
      });
      trackEvent('add_to_cart', String(currentProduct.id), currentProduct.salePrice);
      setCoinAnim(true);
      playSound('coin');
      setStats(s => ({ ...s, added: s.added + 1 }));
      setTimeout(() => setCoinAnim(false), 600);
    } else {
      playSound('woosh');
      setStats(s => ({ ...s, skipped: s.skipped + 1 }));
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setTouchDelta(0);
      setCurrentIndex(i => i + 1);
    }, 350);
  }, [currentProduct, isFinished, addItem, addXp, playSound]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSwipe, onClose]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDelta) > 80) {
      handleSwipe(touchDelta > 0 ? 'right' : 'left');
    } else {
      setTouchDelta(0);
    }
    setTouchStart(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        <button onClick={onClose} className="text-muted hover:text-foreground text-sm font-bold transition">
          ✕ Sair
        </button>
        <div className="flex items-center gap-1 text-xs font-bold text-neon">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          MODO VÍCIO
        </div>
        <span className="text-xs text-muted">{currentIndex + 1}/{products.length}</span>
      </div>

      {/* Stats */}
      <div className="absolute top-14 flex gap-6 text-xs font-bold">
        <span className="text-red-400">❌ {stats.skipped}</span>
        <span className="text-neon">🛒 {stats.added}</span>
      </div>

      {/* Card */}
      {!isFinished && currentProduct ? (
        <div
          ref={cardRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative w-[85vw] max-w-sm aspect-[3/4] cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `translateX(${swipeDirection === 'right' ? 400 : swipeDirection === 'left' ? -400 : touchDelta}px) rotate(${swipeDirection === 'right' ? 15 : swipeDirection === 'left' ? -15 : touchDelta * 0.08}deg)`,
            transition: swipeDirection ? 'all 0.35s cubic-bezier(.4,0,.2,1)' : touchDelta ? 'none' : 'all 0.3s ease',
            opacity: swipeDirection ? 0 : 1,
          }}
        >
          {/* Swipe Indicators */}
          <div className={`absolute top-6 left-6 z-10 rounded-xl border-4 border-neon px-4 py-2 text-2xl font-black text-neon rotate-[-15deg] transition-opacity ${touchDelta > 50 ? 'opacity-100' : 'opacity-0'}`}>
            QUERO! 🛒
          </div>
          <div className={`absolute top-6 right-6 z-10 rounded-xl border-4 border-red-500 px-4 py-2 text-2xl font-black text-red-500 rotate-[15deg] transition-opacity ${touchDelta < -50 ? 'opacity-100' : 'opacity-0'}`}>
            NEXT ❌
          </div>

          {/* Product Card */}
          <div className="h-full w-full rounded-3xl border-2 border-border bg-gradient-to-b from-card to-surface overflow-hidden shadow-2xl shadow-neon/10">
            <div className="relative h-[60%] w-full bg-surface-lighter flex items-center justify-center overflow-hidden">
              {currentProduct.localImage ? (
                <Image
                  src={currentProduct.localImage}
                  alt={currentProduct.shortName}
                  fill
                  className="object-cover"
                  sizes="85vw"
                />
              ) : (
                <span className="text-8xl">{currentProduct.image}</span>
              )}
              {currentProduct.tag && (
                <span className="absolute top-4 right-4 rounded-full bg-pop px-3 py-1 text-xs font-extrabold text-background">
                  {currentProduct.tag}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <h2 className="text-xl font-black text-foreground leading-tight">{currentProduct.shortName}</h2>
              <div className="flex items-baseline gap-2">
                {currentProduct.originalPrice && (
                  <span className="text-sm text-muted line-through">R$ {currentProduct.originalPrice.toLocaleString('pt-BR')}</span>
                )}
                <span className="text-3xl font-black text-neon">R$ {currentProduct.salePrice.toLocaleString('pt-BR')}</span>
              </div>
              <span className="text-xs text-muted/60">Frete: Grátis (óbvio)</span>
            </div>
          </div>
        </div>
      ) : (
        /* End Screen */
        <div className="text-center px-6">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-3xl font-black text-foreground">Modo Vício Concluído!</h2>
          <p className="mt-2 text-muted">
            Você adicionou <span className="text-neon font-black">{stats.added}</span> itens e ignorou <span className="text-red-400 font-black">{stats.skipped}</span>.
          </p>
          <button onClick={onClose} className="mt-8 rounded-2xl bg-neon px-8 py-4 text-lg font-extrabold text-background transition hover:scale-105 active:scale-95">
            Voltar à Loja
          </button>
        </div>
      )}

      {/* Coin Animation */}
      {coinAnim && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                animationDelay: `${i * 60}ms`,
                transform: `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px)`,
              }}
            >
              🪙
            </span>
          ))}
        </div>
      )}

      {/* Bottom Buttons */}
      {!isFinished && (
        <div className="absolute bottom-12 flex gap-8">
          <button
            onClick={() => handleSwipe('left')}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/50 bg-red-500/10 text-3xl transition hover:scale-110 hover:bg-red-500/20 active:scale-95"
          >
            ❌
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon/50 bg-neon/10 text-3xl transition hover:scale-110 hover:bg-neon/20 active:scale-95"
          >
            🛒
          </button>
        </div>
      )}
    </div>
  );
}
