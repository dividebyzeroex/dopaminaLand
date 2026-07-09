'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { trackEvent } from '@/lib/tracking';
import { useEffect } from 'react';

const fakeReviews = [
  { name: 'Maria S.', rating: 5, text: 'Melhor compra que já fiz! Não paguei nada e recebi nada. 10/10 recomendo! 💊', date: '3 dias atrás' },
  { name: 'João P.', rating: 5, text: 'Chegou em perfeito estado de inexistência. Produto fictício de altíssima qualidade.', date: '1 semana atrás' },
  { name: 'Ana L.', rating: 4, text: 'Adorei! Minha capivara de estimação tentou roubar o pacote, mas tudo bem pq o pacote também não existe.', date: '2 semanas atrás' },
  { name: 'Carlos M.', rating: 5, text: 'Finalmente um e-commerce honesto. Faz 3 dias que estou tentando parar de comprar. Não consigo. Socorro.', date: '1 mês atrás' },
  { name: 'Fernanda R.', rating: 5, text: 'Comprei 47 unidades. Meu psicólogo está preocupado mas meu cartão imaginário está ileso.', date: '2 meses atrás' },
];

export default function ProductPageClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const { addItem } = useCart();

  useEffect(() => {
    // Track view item
    trackEvent('view_item', product.id, product.salePrice, { slug: product.slug });

    // Track dwell time (15 seconds)
    const timer = setTimeout(() => {
      trackEvent('dwell_time_exceeded', product.id, product.salePrice, { slug: product.slug, time_spent: 15 });
    }, 15000);

    return () => clearTimeout(timer);
  }, [product]);

  const installments = 4;
  const installmentValue = (product.salePrice / installments).toFixed(2);
  const numRating = Number(product.rating) || 5;
  const stars = '★'.repeat(Math.floor(numRating)) + (numRating % 1 >= 0.5 ? '★' : '');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-magenta transition">Início</Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{product.shortName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/10 blur-3xl" />
          
          {product.badge && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-magenta px-3 py-1.5 text-xs font-black text-white shadow-lg">
              {product.badge}
            </span>
          )}
          {product.discount > 0 && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-pop px-3 py-1.5 text-xs font-black text-background shadow-lg">
              -{product.discount}%
            </span>
          )}

          <div className="flex h-full items-center justify-center p-6">
            {product.localImage ? (
              <img src={product.localImage} alt={product.shortName} className="max-h-[85%] max-w-[85%] object-contain animate-float drop-shadow-2xl" />
            ) : (
              <span className="text-[160px] animate-float drop-shadow-2xl sm:text-[200px]">
                {product.image}
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Rating */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400 font-bold">{stars}</span>
            <span className="text-magenta font-extrabold">{product.rating}</span>
            <span className="text-muted">({product.reviews.toLocaleString('pt-BR')} avaliações)</span>
          </div>

          {/* Title */}
          <h1 className="mt-3 font-[var(--font-display)] text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-6 rounded-2xl border border-border bg-surface-light p-6">
            <p className="text-sm text-muted">
              De <span className="line-through">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="mt-1 font-[var(--font-display)] text-4xl font-extrabold text-magenta">
              R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-sm text-muted">
              em até <span className="font-bold text-foreground">{installments}x de R$ {Number(installmentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> sem juros no cartão imaginário 💳
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-neon-green/10 border border-neon-green/20 px-4 py-2">
              <span className="text-neon-green text-lg">✓</span>
              <p className="text-sm font-bold text-neon-green">
                Preço final no checkout: <span className="text-lg">R$ 0,00</span> (como tudo aqui)
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 text-base text-muted leading-relaxed">
            {product.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 space-y-3 flex flex-col">
            <Link
              href="/checkout"
              onClick={() => addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                shortName: product.shortName,
                image: product.image || '',
                localImage: product.localImage,
                gradient: product.gradient || '',
                originalPrice: product.price,
                salePrice: product.salePrice,
              })}
              className="order-1 block w-full rounded-2xl bg-magenta py-4 text-center text-base sm:text-lg font-extrabold text-white shadow-lg transition hover:bg-magenta-light active:scale-[0.98] animate-pulse-glow whitespace-nowrap overflow-hidden text-ellipsis px-2"
            >
              COMPRAR AGORA ⚡
            </Link>
            <button
              onClick={() => {
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  shortName: product.shortName,
                  image: product.image || '',
                  localImage: product.localImage,
                  gradient: product.gradient || '',
                  originalPrice: product.price,
                  salePrice: product.salePrice,
                });
                trackEvent('add_to_cart', product.id, product.salePrice, { source: 'product_page', slug: product.slug, category: product.category });
              }}
              className="order-2 w-full rounded-2xl border-2 border-magenta py-4 text-base sm:text-lg font-extrabold text-magenta transition hover:bg-magenta/10 active:scale-[0.98] whitespace-nowrap overflow-hidden text-ellipsis px-2"
            >
              ADICIONAR AO CARRINHO 🛒
            </button>
          </div>

          {/* Share Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: `Compre ${product.shortName} por R$ 0,00!`,
                    text: `Olha só o que eu encontrei na Dopamina: ${product.name}. 100% gratuito e 200% dopamina! 💊`,
                    url: url,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(url);
                  alert('🔗 Link copiado! Envie para seus amigos e espalhe a dopamina.');
                }
                trackEvent('share_product', product.id, 0, { slug: product.slug });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface-light py-3 text-sm font-bold text-muted transition hover:border-magenta hover:text-magenta active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Compartilhar dopamina
            </button>
          </div>

          {/* Shipping */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>🛵</span> Entrega por motoboy (quase) real
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>📍</span> Rastreamento ao vivo com eventos cômicos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>🔄</span> Devolução: impossível devolver o que não existe
            </div>
          </div>
        </div>
      </div>

      {/* ============ REVIEWS ============ */}
      <section className="mt-16">
        <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
          Avaliações dos compradores fictícios ⭐
        </h2>
        <div className="mt-6 space-y-4">
          {fakeReviews.map((review, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-magenta/20 text-sm font-bold text-magenta">
                    {review.name[0]}
                  </span>
                  <span className="text-sm font-bold text-foreground">{review.name}</span>
                </div>
                <span className="text-xs text-muted">{review.date}</span>
              </div>
              <div className="mt-2 text-amber-400 text-xs">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p className="mt-2 text-sm text-muted">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ RELATED ============ */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
            Produtos relacionados (igualmente fictícios) 💊
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map(p => {
              const ProductCard = require('@/components/ProductCard').default;
              return <ProductCard key={p.id} {...p} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
