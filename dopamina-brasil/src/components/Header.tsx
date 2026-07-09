'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useGame } from '@/contexts/GameContext';

const marqueeItems = [
  '🛵 ENTREGA POR MOTOBOYS (QUASE) REAIS',
  '📍 RASTREAMENTO AO VIVO PELO BRASIL',
  '💸 CHECKOUT 1-CLIQUE QUE SE PAGA SOZINHO',
  '💊 100% FALSO, 200% DOPAMINA',
  '🧾 A FATURA NUNCA CHEGA',
  '🛍️ PREÇO FINAL: SEMPRE R$ 0,00',
];

export default function Header() {
  const { totalItems, toggleCart } = useCart();
  const { level, levelEmoji, levelTitle, xp } = useGame();

  return (
    <header className="sticky top-0 z-40">
      {/* Marquee Banner */}
      <div className="overflow-hidden bg-magenta py-2 text-[11px] font-bold uppercase tracking-wider text-white">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap pr-10">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-pop">✦</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="text-3xl transition-transform group-hover:rotate-12 group-hover:scale-110">💊</span>
            <span className="font-[var(--font-display)] text-2xl font-extrabold tracking-tight text-foreground">
              dopamina
            </span>
          </Link>

          {/* Search */}
          <div className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-border bg-surface-light px-4 py-2.5 transition focus-within:border-magenta md:flex">
            <span className="text-muted">🔍</span>
            <input
              placeholder="buscar dopamina, PS5, skincare..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted"
              readOnly
            />
          </div>

          {/* Nav */}
          <nav className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface-light hover:text-foreground lg:block"
            >
              Catálogo
            </Link>
            <Link
              href="/ranking"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface-light hover:text-foreground lg:block"
            >
              Ranking 🏆
            </Link>

            {/* XP Badge */}
            <div className="hidden items-center gap-1.5 rounded-full bg-surface-light px-3 py-2 text-xs font-bold text-muted lg:flex">
              <span>{levelEmoji}</span>
              <span className="text-pop">{xp} XP</span>
            </div>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 rounded-full bg-magenta px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-magenta-light active:scale-95"
            >
              🛒 <span className="hidden sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pop text-[10px] font-black text-background">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
