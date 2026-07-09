'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import products from '@/data/products.json';
import { useCart } from '@/contexts/CartContext';

const categories = [
  { id: 'todos', label: 'Todos', emoji: '🔥', count: products.length },
  { id: 'games', label: 'Games', emoji: '🎮', count: products.filter(p => p.category === 'games').length },
  { id: 'tecnologia', label: 'Tecnologia', emoji: '📱', count: products.filter(p => p.category === 'tecnologia').length },
  { id: 'beleza', label: 'Beleza', emoji: '💄', count: products.filter(p => p.category === 'beleza').length },
  { id: 'moda', label: 'Moda', emoji: '👟', count: products.filter(p => p.category === 'moda').length },
  { id: 'casa', label: 'Casa', emoji: '🛋️', count: products.filter(p => p.category === 'casa').length },
];

const trustBadges = [
  { emoji: '🧾', title: '100% dopamina real', desc: 'a fatura nunca chega' },
  { emoji: '🛵', title: 'motoboys (quase) reais', desc: 'saem de casa pra entregar pra você' },
  { emoji: '⚡', title: 'checkout 1-clique autopago', desc: 'em 15 segundos' },
  { emoji: '📍', title: 'rastreamento ao vivo', desc: 'a viagem real até sua porta' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [heroSlide, setHeroSlide] = useState(0);
  const { addItem } = useCart();

  const filteredProducts = activeCategory === 'todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  const flashDeals = products.filter(p => p.discount >= 28).slice(0, 8);

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
                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-magenta/30 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-violet/20 blur-3xl" />

                <div className="relative grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-magenta/30 bg-magenta/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-magenta">
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
                      A loja que vende a dopamina de comprar. A fatura nunca chega. 🧠
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <a
                        href="#catalogo"
                        className="rounded-full bg-magenta px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:scale-105 hover:bg-magenta-light active:scale-95"
                      >
                        quero minha dopamina 🚀
                      </a>
                      <a
                        href="#ofertas"
                        className="rounded-full border-2 border-border px-7 py-3 text-base font-bold text-foreground transition hover:border-magenta hover:text-magenta"
                      >
                        ver ofertas 🔥
                      </a>
                    </div>
                  </div>

                  {/* Hero Product */}
                  <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-magenta to-violet opacity-90 blur-[2px]" />
                    <div className="absolute inset-10 rounded-full bg-gradient-to-br from-magenta/80 to-violet/80" />
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
                      <text x="50" y="58" textAnchor="middle" fontSize="26">💊</text>
                    </svg>

                    {/* Product info card */}
                    <div className="absolute -bottom-3 left-0 z-20 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">destaque</p>
                      <p className="max-w-[10rem] truncate text-xs font-bold text-foreground">{heroProduct.shortName}</p>
                      <p className="font-[var(--font-display)] text-lg font-extrabold text-magenta">
                        R$ {heroProduct.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 — Coupon */}
            <div className="w-full shrink-0">
              <div className="relative flex min-h-[460px] items-center overflow-hidden bg-[#160c20] px-6 py-10 text-foreground sm:px-12">
                <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-pop/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-magenta/20 blur-3xl" />

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
                    <p className="mt-4 max-w-md text-base font-medium text-muted">
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
                        className="rounded-full bg-foreground px-7 py-3 text-base font-extrabold text-background transition hover:scale-105 active:scale-95"
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
              <div className="relative flex min-h-[460px] items-center overflow-hidden bg-gradient-to-br from-magenta via-[#d61f8c] to-violet px-6 py-10 text-white sm:px-12">
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
                      Descontos absurdos em produtos que você nunca vai receber. Pegue enquanto a dopamina tá em promoção. 🐋
                    </p>
                    <a
                      href="#ofertas"
                      className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-magenta shadow-lg transition hover:scale-105 active:scale-95"
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
                    <div className="absolute bottom-8 left-2 -rotate-6 rounded-2xl bg-white px-4 py-2 font-[var(--font-display)] text-xl font-black text-magenta shadow-xl">
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
                  heroSlide === i ? 'w-6 bg-magenta' : 'w-2 bg-muted hover:bg-foreground/40'
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
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                activeCategory === cat.id
                  ? 'border-magenta/50 bg-magenta/10'
                  : 'border-border bg-card hover:border-magenta/30'
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-surface-light to-surface-lighter text-2xl leading-none transition group-hover:scale-110">
                <span className="block translate-y-[1px]">{cat.emoji}</span>
              </span>
              <div>
                <p className="font-extrabold text-foreground">{cat.label}</p>
                <p className="text-xs text-muted">{cat.count} produtos</p>
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
          <button
            onClick={() => setActiveCategory('todos')}
            className="text-sm font-bold text-magenta hover:underline"
          >
            ver todos →
          </button>
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
              catálogo completo 💊
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filteredProducts.length} produtos fictícios esperando por você
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  activeCategory === cat.id
                    ? 'bg-magenta text-white'
                    : 'bg-surface-light text-muted hover:bg-surface-lighter hover:text-foreground'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
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
            <details key={i} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-magenta/30">
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
