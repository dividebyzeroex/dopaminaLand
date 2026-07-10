'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';

const trustBadges = [
  { emoji: '🧾', title: '100% dopamina real', desc: 'a fatura nunca chega' },
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
      {/* ============ HERO BANNER BENTO GRID ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          
          {/* Main Hero Block */}
          <div className="group relative flex min-h-[480px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-surface via-surface-light to-[#ffedd5] px-6 py-10 shadow-sm sm:px-12 lg:items-start lg:justify-between">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-neon/30 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-purple/20 blur-3xl transition-transform duration-1000 group-hover:scale-110" />

            <div className="relative z-10 w-full text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neon">
                ✦ sua dose de consumismo simulado
              </span>
              <h1 className="mt-5 font-[var(--font-display)] text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-7xl">
                escolha. <span className="gradient-text">clique</span>.
                <br />
                sinta <span className="gradient-text">o brilho</span>.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base font-medium text-muted sm:text-lg lg:mx-0">
                O único e-commerce onde seu limite é infinito e a culpa financeira não existe. Inicie seu ritual de dopamina. ⚡
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href="#catalogo"
                  className="rounded-full bg-neon px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:scale-105 hover:bg-neon-light active:scale-95 whitespace-nowrap"
                >
                  quero minha dopamina 🚀
                </a>
              </div>
            </div>

            {/* Product floating illustration (hidden on small screens, shown absolute on desktop) */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 z-0 hidden w-[350px] lg:block">
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-neon to-purple opacity-90 blur-[20px]" />
              <div className="absolute inset-10 rounded-full bg-gradient-to-br from-neon/80 to-purple/80" />
              <div className="relative z-10 text-[180px] animate-float drop-shadow-[0_22px_40px_rgba(27,16,32,0.45)] text-center">
                🎮
              </div>
              <div className="absolute bottom-16 -left-4 z-20 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">destaque</p>
                <p className="max-w-[10rem] truncate text-xs font-bold text-foreground">{heroProduct?.shortName || "DualSense Edge"}</p>
                <p className="font-[var(--font-display)] text-lg font-extrabold text-neon">
                  R$ {(heroProduct?.salePrice || 1499).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Stacked Blocks) */}
          <div className="flex flex-col gap-4">
            
            {/* Coupon Block */}
            <div className="group relative flex flex-1 items-center overflow-hidden rounded-[2rem] border border-border bg-[#160c20] px-6 py-8 text-white shadow-sm sm:px-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-pop/20 blur-3xl transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 grid w-full items-center gap-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-pop/40 bg-pop/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-pop">
                    ✦ hackeando o sistema
                  </span>
                  <h2 className="mt-3 font-[var(--font-display)] text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl">
                    Código <span className="gradient-text-gold">VIP</span> liberado
                  </h2>
                  <p className="mt-2 text-sm text-white/70">Aplique no checkout e tenha a ilusão de economizar uma grana violenta.</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText('DOPAMINANDO')}
                    className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-pop/50 bg-white/5 px-4 py-2.5 transition hover:border-pop w-full sm:w-auto"
                  >
                    <span className="font-[var(--font-display)] text-base font-extrabold tracking-wide text-pop">
                      DOPAMINANDO
                    </span>
                    <span className="shrink-0 rounded-lg bg-pop px-3 py-1 text-[10px] font-black text-background">
                      copiar
                    </span>
                  </button>
                </div>
                <div className="hidden sm:block">
                  <div className="relative flex aspect-square w-24 items-center justify-center">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#ffe9a3] via-pop to-[#e0982e] shadow-[0_0_40px_rgba(255,210,74,0.4)]" />
                    <p className="relative z-10 font-[var(--font-display)] text-4xl font-black leading-none text-background">25%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Deals Block */}
            <div className="group relative flex flex-1 items-center overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-neon via-[#d61f8c] to-purple px-6 py-8 text-white shadow-sm sm:px-8">
              <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-white/15 blur-3xl transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 flex w-full flex-col justify-between sm:flex-row sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                    🔥 delírio de descontos
                  </span>
                  <h2 className="mt-3 font-[var(--font-display)] text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl">
                    Ofertas que <span className="text-pop">desaparecem</span>
                  </h2>
                  <p className="mt-2 text-sm text-white/75">Preços derretidos em itens que só existem na sua tela. Aproveite a adrenalina. 🛒</p>
                  <a
                    href="/ofertas"
                    className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-extrabold text-neon shadow-lg transition hover:scale-105 active:scale-95"
                  >
                    ver ofertas imaginárias →
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ MARQUEE DIVIDER ============ */}
      <div className="mt-12 overflow-hidden bg-foreground py-3 text-[13px] font-bold uppercase tracking-wider text-background">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pr-12">
          {[
            '🛵 ENTREGA POR MOTOBOYS (QUASE) REAIS',
            '📍 RASTREAMENTO AO VIVO PELO BRASIL',
            '💸 CHECKOUT 1-CLIQUE QUE SE PAGA SOZINHO',
            '⚡ 100% FALSO, 200% DOPAMINA',
            '🧾 A FATURA NUNCA CHEGA',
            '🛍️ PREÇO FINAL: SEMPRE R$ 0,00',
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="text-neon">✦</span> {item}
            </span>
          ))}
          {[
            '🛵 ENTREGA POR MOTOBOYS (QUASE) REAIS',
            '📍 RASTREAMENTO AO VIVO PELO BRASIL',
            '💸 CHECKOUT 1-CLIQUE QUE SE PAGA SOZINHO',
            '⚡ 100% FALSO, 200% DOPAMINA',
            '🧾 A FATURA NUNCA CHEGA',
            '🛍️ PREÇO FINAL: SEMPRE R$ 0,00',
          ].map((item, i) => (
            <span key={i + 10} className="flex items-center gap-3">
              <span className="text-neon">✦</span> {item}
            </span>
          ))}
        </div>
      </div>

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

      {/* ============ PRODUCT CATALOG W/ SIDEBAR ============ */}
      <section id="catalogo" className="mx-auto mt-16 max-w-7xl scroll-mt-28 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-28">
              <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground mb-4">
                categorias
              </h2>
              <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 no-scrollbar pb-4 lg:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'bg-neon text-white shadow-md'
                        : 'bg-surface hover:bg-surface-light text-foreground'
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground">
                catálogo completo ⚡
              </h2>
              <p className="mt-1 text-sm text-muted">
                muitos produtos fictícios esperando por você
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
          </div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
        <h2 className="text-center font-[var(--font-display)] text-2xl font-extrabold text-foreground">
          perguntas frequentes 🤔
        </h2>
        <div className="mt-8 space-y-4">
          {[
            { q: 'Dopamina é uma loja de verdade?', a: 'Não — é uma loja paródia. Os produtos, o pagamento e a entrega são 100% falsos. A única coisa real é a dopamina de comprar algo.' },
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
