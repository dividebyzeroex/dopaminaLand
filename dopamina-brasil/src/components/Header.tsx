'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useGame } from '@/contexts/GameContext';
import { useDaily } from '@/contexts/DailyContext';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/tracking';


export default function Header() {
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const { level, levelEmoji, levelTitle, xp } = useGame();
  const { streak, streakEmoji } = useDaily();

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
        if (query.trim().length > 2) {
          trackEvent('search', undefined, undefined, { query: query.trim() });
        }
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2">
      <div className="rounded-full border border-border bg-card/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="mx-auto flex items-center gap-4 px-4 py-2.5 sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="text-3xl transition-transform group-hover:rotate-12 group-hover:scale-110">⚡</span>
            <span className="font-[var(--font-display)] text-2xl font-extrabold tracking-tight text-foreground animate-neon-flicker">dopaminado</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative ml-2 hidden flex-1 md:block">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 transition focus-within:border-neon/50 focus-within:shadow-[0_0_15px_rgba(204,255,0,0.05)]">
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
              <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
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
                        className="flex items-center gap-3 border-b border-border p-3 text-left transition hover:bg-surface last:border-0"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-light">
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
              href="/lootbox"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface hover:text-neon lg:block"
            >
              📦 Caixa
            </Link>
            <Link
              href="/extensao"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-neon bg-neon/10 border border-neon/30 transition hover:bg-neon hover:text-background lg:block"
            >
              🛡️ Extensão
            </Link>
            <Link
              href="/ranking"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface hover:text-foreground lg:block"
            >
              Ranking 🏆
            </Link>
            <Link
              href="/blog"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface hover:text-foreground lg:block"
            >
              Blog
            </Link>
            <Link
              href="/minha-conta"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface hover:text-foreground lg:block"
            >
              Minha conta 👤
            </Link>

            {/* Streak + XP Badge */}
            <div className="hidden items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-xs font-bold text-muted lg:flex">
              {streak > 0 && <span className="animate-fire">{streakEmoji}</span>}
              <span>{levelEmoji}</span>
              <span className="text-neon">{xp} XP</span>
            </div>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 rounded-full bg-neon px-4 py-2.5 text-sm font-extrabold text-background shadow-lg transition hover:bg-neon-light active:scale-95 animate-pulse-glow"
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
