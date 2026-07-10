'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';

const trustBadges = [
  { emoji: '🧾', title: '100% dopaminando real', desc: 'a fatura nunca chega' },
  { emoji: '🛵', title: 'motoboys (quase) reais', desc: 'saem de casa pra entregar pra você' },
  { emoji: '⚡', title: 'checkout 1-clique autopago', desc: 'em 15 segundos' },
  { emoji: '📍', title: 'rastreamento ao vivo', desc: 'a viagem real até sua porta' },
];

export default function HomePageClient({ products, flashDeals = [] }: { products: any[], flashDeals?: any[] }) {
  const categories = [
    { id: 'todos', label: 'Todos', emoji: '🔥' },
    { id: 'games', label: 'Games', emoji: '🎮' },
    { id: 'tecnologia', label: 'Tecnologia', emoji: '📱' },
    { id: 'beleza', label: 'Beleza', emoji: '💄' },
    { id: 'moda', label: 'Moda', emoji: '👟' },
    { id: 'casa', label: 'Casa', emoji: '🛋️' },
  ];
  const [activeCategory, setActiveCategory] = useState('todos');
  const [heroSlide, setHeroSlide] = useState(0);
  const { addItem } = useCart();

  const [displayedProducts, setDisplayedProducts] = useState(products);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(products.length === 25);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackEvent('view_item', undefined, undefined, { page: 'home' });
  }, []);

  const fetchProducts = async (category: string, pageIndex: number, append: boolean) => {
    setIsLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageIndex * 25, (pageIndex + 1) * 25 - 1);

    if (category !== 'todos') {
      query = query.eq('category', category);
    }

    const { data } = await query;
    const mapped = (data || []).map((p: any) => ({
      ...p,
      localImage: p.image_url,
      shortName: p.short_name,
      salePrice: p.sale_price,
    }));

    if (append) {
      setDisplayedProducts((prev: any) => {
        // Prevent duplicates just in case
        const existingIds = new Set(prev.map((p: any) => p.id));
        const newItems = mapped.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
    } else {
      setDisplayedProducts(mapped);
    }
    setHasMore(mapped.length === 25);
    setIsLoading(false);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setPage(0);
    // Fetch first page of new category
    fetchProducts(catId, 0, false);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(activeCategory, nextPage, true);
  };



  const heroProduct = products[0]; // RTX 4090

  return (
    <div>
      {/* ============ HERO BANNER ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border shadow-[0_30px_80px_-40px_rgba(124,58,237,0.4)]">
          {/* Slider container */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${heroSlide * 100}%)` }}
          >
            {/* Slide 1 — Main Hero */}
            <div className="w-full shrink-0">
              <div className="grain relative flex min-h-[460px] items-center overflow-hidden bg-gradient-to-br from-surface via-surface-light to-[#ffedd5] px-6 py-10 sm:px-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-neon/30 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-purple/20 blur-3xl" />

                <div className="relative grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neon">
                      ✦ a única loja honesta da internet
                    </span>
                    <h1 className="mt-5 font-[var(--font-display)] text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-7xl">
                      compre{' '}
                      <span className="gradient-text">tudo</span>.
                      <br />
                      pague{' '}
                      <span className="gradient-text">nada</span>.
                    </h1>
                    <p className="mt-5 max-w-md text-base font-medium text-muted sm:text-lg">
                      A loja que vende a dopaminando de comprar. A fatura nunca chega. 🧠
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <a
                        href="#catalogo"
                        className="rounded-full bg-neon px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:scale-105 hover:bg-neon-light active:scale-95 whitespace-nowrap"
                      >
                        quero minha dopaminando 🚀
                      </a>
                      <a
                        href="/ofertas"
                        className="rounded-full border-2 border-border px-7 py-3 text-base font-bold text-foreground transition hover:border-neon hover:text-neon whitespace-nowrap"
                      >
                        ver ofertas 🔥
                      </a>
                    </div>
                  </div>

                  {/* Hero Product */}
                  <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-neon to-purple opacity-90 blur-[2px]" />
                    <div className="absolute inset-10 rounded-full bg-gradient-to-br from-neon/80 to-purple/80" />
                    <span className="relative z-10 text-[120px] animate-float drop-shadow-[0_22px_40px_rgba(27,16,32,0.45)]">
                      🎮
                    </span>

                    {/* Spinning badge */}
                    <svg viewBox="0 0 100 100" className="absolute -right-3 -top-3 z-20 h-24 w-24 animate-spin-slow drop-shadow-lg">
                      <circle cx="50" cy="50" r="49" fill="#1b1020" />
                      <defs>
                        <path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                      </defs>
                      <text fontSize="7.6" fontWeight="800" fill="#faf6f2">
                        <textPath href="#circ" startOffset="0" textLength="237" lengthAdjust="spacing">
                          DOPAMINA GRÁTIS ✦ VEM PEGAR A SUA ✦
                        </textPath>
                      </text>
                      <text x="50" y="58" textAnchor="middle" fontSize="26">⚡</text>
                    </svg>

                    {/* Product info card */}
                    <div className="absolute -bottom-3 left-0 z-20 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">destaque</p>
                      <p className="max-w-[10rem] truncate text-xs font-bold text-foreground">{heroProduct.shortName}</p>
                      <p className="font-[var(--font-display)] text-lg font-extrabold text-neon">
                        R$ {heroProduct.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 — Coupon */}
            <div className="w-full shrink-0">
              <div className="relative flex min-h-[460px] items-center overflow-hidden bg-[#160c20] px-6 py-10 text-white sm:px-12">
                <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-pop/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-neon/20 blur-3xl" />

                <div className="relative grid w-full items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-pop/40 bg-pop/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-pop">
                      ✦ oferta premium de boas-vindas
                    </span>
                    <h2 className="mt-5 font-[var(--font-display)] text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
                      <span className="gradient-text-gold">25% OFF</span>
                      <br />
                      no seu primeiro pedido
                    </h2>
                    <p className="mt-4 max-w-md text-base font-medium text-white/70">
                      Use o cupom no checkout e veja o dinheiro falso derreter diante dos seus olhos. ✨
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText('DOPAMINA25');
                        }}
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-pop/50 bg-white/5 px-4 py-3 transition hover:border-pop sm:w-auto sm:justify-start sm:px-5"
                      >
                        <span className="font-[var(--font-display)] text-base font-extrabold tracking-wide text-pop sm:text-lg sm:tracking-wider">
                          DOPAMINA25
                        </span>
                        <span className="shrink-0 rounded-lg bg-pop px-3 py-1 text-xs font-black text-background">
                          copiar
                        </span>
                      </button>
                      <a
                        href="#catalogo"
                        className="rounded-full bg-white px-7 py-3 text-base font-extrabold text-black transition hover:scale-105 active:scale-95 whitespace-nowrap"
                      >
                        começar a comprar 🚀
                      </a>
                    </div>
                  </div>

                  <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center">
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#ffe9a3] via-pop to-[#e0982e] shadow-[0_0_60px_rgba(255,210,74,0.4)]" />
                    <div className="relative z-10 text-center text-background">
                      <p className="font-[var(--font-display)] text-6xl font-black leading-none sm:text-7xl">25%</p>
                      <p className="mt-1 text-sm font-black uppercase tracking-[0.2em]">off</p>
                      <p className="mt-2 inline-block rounded-full bg-background px-3 py-1 text-[11px] font-black text-pop">
                        1º PEDIDO
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3 — Flash Deals */}
            <div className="w-full shrink-0">
              <div className="relative flex min-h-[460px] items-center overflow-hidden bg-gradient-to-br from-neon via-[#d61f8c] to-purple px-6 py-10 text-white sm:px-12">
                <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

                <div className="relative grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur">
                      🔥 ofertas relâmpago
                    </span>
                    <h2 className="mt-5 font-[var(--font-display)] text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
                      até{' '}
                      <span className="text-pop">38% OFF</span>
                      <br />
                      no que não existe
                    </h2>
                    <p className="mt-4 max-w-md text-base font-medium text-white/75">
                      Descontos absurdos em produtos que você nunca vai receber. Pegue enquanto a dopaminando tá em promoção. 🐋
                    </p>
                    <a
                      href="/ofertas"
                      className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-neon shadow-lg transition hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      ver ofertas →
                    </a>
                  </div>

                  <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center">
                    <p className="font-[var(--font-display)] text-[7rem] font-black leading-none text-white/90 drop-shadow-2xl sm:text-[10rem]">
                      %
                    </p>
                    <div className="absolute right-2 top-6 rotate-12 rounded-2xl bg-pop px-4 py-2 font-[var(--font-display)] text-2xl font-black text-background shadow-xl">
                      -38%
                    </div>
                    <div className="absolute bottom-8 left-2 -rotate-6 rounded-2xl bg-white px-4 py-2 font-[var(--font-display)] text-xl font-black text-neon shadow-xl">
                      -25%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            aria-label="anterior"
            onClick={() => setHeroSlide(s => (s - 1 + 3) % 3)}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-xl font-black text-foreground shadow-lg backdrop-blur transition hover:bg-surface active:scale-90"
          >
            ‹
          </button>
          <button
            aria-label="próximo"
            onClick={() => setHeroSlide(s => (s + 1) % 3)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-xl font-black text-foreground shadow-lg backdrop-blur transition hover:bg-surface active:scale-90"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-surface/70 px-2.5 py-1.5 shadow backdrop-blur">
            {[0, 1, 2].map(i => (
              <button
                key={i}
                aria-label={`slide ${i + 1}`}
                onClick={() => setHeroSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  heroSlide === i ? 'w-6 bg-neon' : 'w-2 bg-muted hover:bg-foreground/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 backdrop-blur"
            >
              <span className="text-2xl">{badge.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-tight text-foreground">{badge.title}</p>
                <p className="text-xs leading-snug text-muted">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
          compre por categoria
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.filter(c => c.id !== 'todos').map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                activeCategory === cat.id
                  ? 'border-neon/50 bg-neon/10'
                  : 'border-border bg-card hover:border-neon/30'
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-surface-light to-surface-lighter text-2xl leading-none transition group-hover:scale-110">
                <span className="block translate-y-[1px]">{cat.emoji}</span>
              </span>
              <div>
                <p className="font-extrabold text-foreground">{cat.label}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============ FLASH DEALS ============ */}
      <section id="ofertas" className="mx-auto mt-12 max-w-7xl scroll-mt-28 px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
            🔥 ofertas relâmpago
          </h2>
          <a
            href="/ofertas"
            className="text-sm font-bold text-neon hover:underline"
          >
            ver todas as ofertas →
          </a>
        </div>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {flashDeals.map((product) => (
            <div key={product.id} className="w-[185px] shrink-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRODUCT CATALOG ============ */}
      <section id="catalogo" className="mx-auto mt-16 max-w-7xl scroll-mt-28 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
              catálogo completo ⚡
            </h2>
            <p className="mt-1 text-sm text-muted">
              muitos produtos fictícios esperando por você
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeCategory === cat.id
                    ? 'bg-neon text-white'
                    : 'bg-surface-light text-muted hover:bg-surface-lighter hover:text-foreground'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayedProducts.map((product: any) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="rounded-full border-2 border-neon px-8 py-3.5 text-base font-extrabold text-neon transition hover:bg-neon/10 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'carregando mais dopamina...' : 'carregar mais produtos ✨'}
            </button>
          </div>
        )}
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
        <h2 className="text-center font-[var(--font-display)] text-2xl font-extrabold text-foreground">
          perguntas frequentes 🤔
        </h2>
        <div className="mt-8 space-y-4">
          {[
            { q: 'Dopaminando é uma loja de verdade?', a: 'Não — é uma loja paródia. Os produtos, o pagamento e a entrega são 100% falsos. A única coisa real é a dopaminando de comprar algo.' },
            { q: 'Como funciona?', a: "Você 'compra' um produto, 'paga' com um cartão imaginário ou Pix fantasma, e rastreia uma entrega absurda viajando pelo Brasil em tempo real — às vezes engolida por uma capivara ou abduzida por um OVNI. Nenhum centavo sai da sua conta." },
            { q: 'É realmente de graça?', a: 'Sim. Nenhuma cobrança: nenhum pagamento é processado e nenhuma fatura chega. Custo zero, sempre.' },
            { q: 'É golpe? É seguro?', a: 'Não é golpe — é comédia. Como nada é cobrado e nenhum pagamento é real, não há nada para roubar. É 100% seguro justamente porque é 100% falso.' },
            { q: 'Vocês armazenam meu cartão ou dados pessoais?', a: 'Não. A tela de pagamento é só de enfeite: nada é processado, nada é cobrado, nenhum dado de cartão é salvo. Seu endereço é usado apenas para desenhar a jornada ridícula do seu pacote no mapa.' },
          ].map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-neon/30">
              <summary className="cursor-pointer text-sm font-bold text-foreground list-none flex items-center justify-between">
                {faq.q}
                <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
