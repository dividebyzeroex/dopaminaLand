'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/lib/supabase';

const marqueeItems = [
  '🛵 ENTREGA POR MOTOBOYS (QUASE) REAIS',
  '📍 RASTREAMENTO AO VIVO PELO BRASIL',
  '💸 CHECKOUT 1-CLIQUE QUE SE PAGA SOZINHO',
  '⚡ 100% FALSO, 200% DOPAMINA',
  '🧾 A FATURA NUNCA CHEGA',
  '🛍️ PREÇO FINAL: SEMPRE R$ 0,00',
];

export default function Header() {
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const { level, levelEmoji, levelTitle, xp } = useGame();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, short_name, image_url, slug, sale_price')
        .ilike('name', `%${query}%`)
        .limit(5);
        
      if (!error && data) {
        setResults(data);
        setShowDropdown(true);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="sticky top-0 z-40">
      {/* Marquee Banner */}
      <div className="overflow-hidden bg-neon py-2 text-[11px] font-bold uppercase tracking-wider text-white">
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
            <span className="text-3xl transition-transform group-hover:rotate-12 group-hover:scale-110">⚡</span>
            <span className="font-[var(--font-display)] text-2xl font-extrabold tracking-tight text-foreground">dopaminando</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative ml-2 hidden flex-1 md:block">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface-light px-4 py-2.5 transition focus-within:border-neon">
              <span className="text-muted">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (query.trim()) setShowDropdown(true);
                }}
                placeholder="buscar dopamina, PS5, skincare..."
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted"
              />
              {isSearching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-neon border-t-transparent"></span>}
            </div>

            {/* Dropdown Results */}
            {showDropdown && (query.trim().length > 0) && (
              <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
                {results.length > 0 ? (
                  <div className="flex flex-col">
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setShowDropdown(false);
                          setQuery('');
                          router.push(`/produto/${product.slug}`);
                        }}
                        className="flex items-center gap-3 border-b border-border p-3 text-left transition hover:bg-surface-light last:border-0"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white">
                          <img src={product.image_url} alt={product.short_name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="truncate text-sm font-bold text-foreground">{product.short_name}</h4>
                          <p className="text-xs text-muted">R$ {product.sale_price.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted">
                    {isSearching ? 'Buscando dopamina...' : 'Nenhum produto encontrado 😢'}
                  </div>
                )}
              </div>
            )}
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
            <Link
              href="/minha-conta"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface-light hover:text-foreground lg:block"
            >
              Minha conta 👤
            </Link>

            {/* XP Badge */}
            <div className="hidden items-center gap-1.5 rounded-full bg-surface-light px-3 py-2 text-xs font-bold text-muted lg:flex">
              <span>{levelEmoji}</span>
              <span className="text-pop">{xp} XP</span>
            </div>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 rounded-full bg-neon px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-neon-light active:scale-95"
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
