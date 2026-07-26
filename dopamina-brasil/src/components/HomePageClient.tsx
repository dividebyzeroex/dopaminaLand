'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import useSWRInfinite from 'swr/infinite';
import { Product } from '@/types';
import dynamic from 'next/dynamic';

const SwipeMode = dynamic(() => import('@/components/SwipeMode'), { ssr: false });
import MobileAppShell from '@/components/mobile/MobileAppShell';
import LiveWebAnalyzer from '@/components/LiveWebAnalyzer';
import TrendingProductsShowcase from '@/components/TrendingProductsShowcase';
import ProductIntelligenceSuite from '@/components/ProductIntelligenceSuite';
import InsightsTelemetryModal from '@/components/InsightsTelemetryModal';

const trustBadges = [
  { emoji: '🧾', title: '100% dopamina real', desc: 'a fatura nunca chega' },
  { emoji: '🛵', title: 'motoboys (quase) reais', desc: 'saem de casa pra entregar pra você' },
  { emoji: '⚡', title: 'checkout 1-clique autopago', desc: 'em 15 segundos' },
  { emoji: '📍', title: 'rastreamento ao vivo', desc: 'a viagem real até sua porta' },
];

export default function HomePageClient({ products, flashDeals = [] }: { products: Product[], flashDeals?: Product[] }) {
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
  const [swipeMode, setSwipeMode] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const { addItem } = useCart();

  // SWR Infinite Pagination
  const getKey = (pageIndex: number, previousPageData: Product[] | null) => {
    if (previousPageData && !previousPageData.length) return null; // Reached the end
    return ['products', activeCategory, pageIndex];
  };

  const fetcher = async ([_, category, pageIndex]: [string, string, number]): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageIndex * 25, (pageIndex + 1) * 25 - 1);

    if (category !== 'todos') {
      query = query.eq('category', category);
    }

    const { data } = await query;
    return (data || []).map((p: any) => ({
      ...p,
      localImage: p.image_url,
      shortName: p.short_name,
      salePrice: p.sale_price,
    }));
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    initialSize: 1,
    fallbackData: activeCategory === 'todos' ? [products] : undefined,
  });

  const displayedProducts = data ? data.flat() : [];
  const isLoading = isValidating;
  const hasMore = data && data[data.length - 1]?.length === 25;

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setSize(1);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    setSize(size + 1);
  };



  const heroProduct = products[0]; // RTX 4090

  return (
    <div>
      {/* EXCLUSIVE MOBILE NATIVE APP SHELL (< 768px) */}
      <MobileAppShell
        products={displayedProducts.length > 0 ? displayedProducts : products}
        flashDeals={flashDeals}
      />

      {/* DESKTOP LAYOUT (>= 768px) */}
      <div className="hidden md:block">
      {/* SWIPE MODE OVERLAY */}
      {swipeMode && (
        <SwipeMode
          products={displayedProducts.length > 0 ? displayedProducts : products}
          onClose={() => setSwipeMode(false)}
        />
      )}

      {/* Floating Swipe Mode Button */}
      <button
        onClick={() => setSwipeMode(true)}
        className="fixed bottom-[72px] right-6 z-[90] flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-2.5 text-xs font-bold text-neon backdrop-blur-sm transition hover:bg-neon/20 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
      >
        <span>🔥</span>
        <span className="hidden sm:inline">Modo Vício</span>
      </button>

      {/* ============ DOPAMINA BAR HERO ============ */}
      <section className="relative w-full overflow-hidden bg-[#09090b] border-b border-border">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#f97316]/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-[#22c55e]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-red-400 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse">
              🛡️ Proteção Anti-BlackFraude 2026 Ativa
            </span>
            <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-white mb-6">
              Não pague mais a<br className="hidden lg:block"/>
              <span className="bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#22c55e] bg-clip-text text-transparent drop-shadow-sm"> metade do dobro.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#a1a1aa] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              A <strong className="text-white">Dopamina Bar & Analisador ao Vivo</strong> intercepta a inflação artificial de preços praticada pelos e-commerces semanas antes da Black Friday. Audite qualquer produto ao vivo no gráfico abaixo!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a 
                href="/extensao" 
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white text-black px-8 py-4 text-sm font-extrabold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">⚡</span> Instalar Anti-FOMO Grátis
                </span>
              </a>
              <a 
                href="#catalogo" 
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
              >
                Testar Simulador ↓
              </a>
            </div>
            
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-[#71717a]">
              <span className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> Funciona na Fast Shop</span>
              <span className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> Funciona na Amazon</span>
              <span className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> Funciona no Mercado Livre</span>
            </div>
          </div>

          {/* Right Visual / Mockup & Live Analyzer */}
          <div id="live-analyzer-section" className="flex-1 w-full max-w-[600px] lg:max-w-none relative z-10">
            {/* Live Web Analyzer Widget */}
            <LiveWebAnalyzer />
          </div>
          
        </div>

        {/* Live E-Commerce Trends Showcase */}
        <div className="px-4 sm:px-6 relative z-10 pb-4">
          <TrendingProductsShowcase />
        </div>

        {/* 5 Revolutionary Intelligence Suite Engines */}
        <div className="px-4 sm:px-6 relative z-10 pb-12">
          <ProductIntelligenceSuite />

          {/* Trigger for Live Insights Telemetry Modal */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowInsightsModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/40 text-orange-400 font-mono text-xs font-black uppercase tracking-wider hover:bg-orange-500/20 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] active:scale-95"
            >
              <span>📊 Ver Dashboard de Insights & Telemetria IA ao Vivo</span>
            </button>
          </div>
        </div>

        {/* Live Insights Telemetry Modal */}
        <InsightsTelemetryModal
          isOpen={showInsightsModal}
          onClose={() => setShowInsightsModal(false)}
        />
      </section>

      {/* ============ MARQUEE DIVIDER AT TOP ============ */}
      <div className="overflow-hidden bg-surface py-3 text-[13px] font-bold uppercase tracking-wider text-foreground border-b border-border">
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

      {/* ============ PRODUCT CATALOG W/ SIDEBAR ============ */}
      <section id="catalogo" className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-28 z-20 bg-background/80 backdrop-blur pb-4 lg:bg-transparent lg:pb-0">
              <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground mb-4">
                categorias
              </h2>
              <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 no-scrollbar pb-2 lg:pb-0">
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

          {/* Main Content (FEED) */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground">
                  seu feed de dopamina ⚡
                </h2>
                <p className="mt-1 text-sm text-muted">
                  role para baixo. descubra. consuma (falsamente).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {displayedProducts.map((product: Product, index: number) => (
                <React.Fragment key={product.id}>
                  <ProductCard {...product} />
                  
                  {/* HERO BANNER INJECTED AFTER 4 PRODUCTS */}
                  {index === 3 && (
                    <div className="col-span-full my-6">
                      <div className="group relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-surface via-surface-light to-[#1a1a2e] px-6 py-10 shadow-sm sm:px-12 lg:items-start">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-neon/30 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                        <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-purple/20 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
            
                        <div className="relative z-10 w-full text-center lg:text-left">
                          <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neon">
                            ✦ liberação de dopamina instantânea
                          </span>
                          <h2 className="mt-5 font-[var(--font-display)] text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:w-2/3">
                            libere sua <span className="gradient-text">dopamina</span>.
                            <br />
                            gaste <span className="gradient-text">zero</span>.
                          </h2>
                          <p className="mt-5 text-base font-medium text-muted lg:w-1/2">
                            O dopaminado.com.br é o simulador de e-commerce cyberpunk projetado para você obter o prazer de compras sem fatura. ⚡
                          </p>
                        </div>
                        <div className="pointer-events-none absolute -bottom-4 right-0 z-0 hidden w-[320px] lg:block">
                          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-neon to-cyan-400 opacity-60 blur-[30px]" />
                          <div className="relative z-10 h-72 w-72 animate-float">
                            <img src="/cleiton_nobg.png" alt="Cleiton Express" className="w-full h-full object-cover scale-110" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FLASH DEALS INJECTED AFTER 8 PRODUCTS */}
                  {index === 7 && (
                    <div className="col-span-full my-6 bg-gradient-to-br from-neon/10 to-purple/10 border border-neon/20 rounded-[2rem] p-6 sm:p-8">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full bg-neon/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neon mb-2">
                            🔥 delírio de descontos
                          </span>
                          <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
                            Ofertas Relâmpago
                          </h2>
                        </div>
                        <a href="/ofertas" className="text-sm font-bold text-neon hover:underline hidden sm:block">
                          ver todas →
                        </a>
                      </div>
                      <div className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:px-0">
                        {flashDeals.map((flashProduct) => (
                          <div key={flashProduct.id} className="w-[185px] shrink-0">
                            <ProductCard {...flashProduct} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COUPON BLOCK AFTER 14 PRODUCTS */}
                  {index === 13 && (
                    <div className="col-span-full my-6">
                      <div className="group relative flex items-center overflow-hidden rounded-[2rem] border border-border bg-[#160c20] px-6 py-8 text-white shadow-sm sm:px-8">
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
                              onClick={() => navigator.clipboard?.writeText('DOPAMINADO')}
                              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-pop/50 bg-white/5 px-4 py-2.5 transition hover:border-pop w-full sm:w-max"
                            >
                              <span className="font-[var(--font-display)] text-base font-extrabold tracking-wide text-pop">
                                DOPAMINADO
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
                    </div>
                  )}

                  {/* PROMO SWAG REAL AFTER 20 PRODUCTS */}
                  {index === 19 && (
                    <div className="col-span-full my-6">
                      <div className="group relative overflow-hidden rounded-[2rem] border border-orange-500/20 bg-gradient-to-br from-[#1a0e2e] via-[#2a133d] to-[#4c1256] p-8 text-white shadow-lg">
                        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white">
                              🎁 RECOMPENSA FÍSICA REAL
                            </span>
                            <h2 className="font-[var(--font-display)] text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                              GANHE BRINDES REAIS
                            </h2>
                            <p className="text-sm text-white/80 leading-relaxed md:max-w-md">
                              Junte XP comprando e completando conquistas no site, e resgate prêmios como adesivos, chaveiro, copo térmico com frete 100% grátis.
                            </p>
                            <div className="pt-2">
                              <a href="/minha-conta" className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:scale-105 hover:bg-orange-600 active:scale-95 inline-block">
                                Ver Meu Nível & Swag 🧪
                              </a>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 shrink-0">
                            {[
                              { icon: '📦', name: 'Adesivos', level: 'Nív. 2' },
                              { icon: '🔑', name: 'Chaveiro', level: 'Nív. 3' },
                              { icon: '🥤', name: 'Copo', level: 'Nív. 4' },
                            ].map((item, idx) => (
                              <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                                <span className="text-4xl">{item.icon}</span>
                                <span className="text-xs font-black text-white mt-2 text-center leading-none">{item.name}</span>
                                <span className="text-[10px] text-orange-400 font-bold mt-1 text-center leading-none">{item.level}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TRUST BADGES AFTER 24 PRODUCTS */}
                  {index === 23 && (
                    <div className="col-span-full my-6">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {trustBadges.map((badge, i) => (
                          <div key={i} className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-center sm:text-left backdrop-blur">
                            <span className="text-3xl">{badge.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold leading-tight text-foreground">{badge.title}</p>
                              <p className="text-xs leading-snug text-muted mt-1">{badge.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </React.Fragment>
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
      <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6 mb-16">
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
    </div>
  );
}
