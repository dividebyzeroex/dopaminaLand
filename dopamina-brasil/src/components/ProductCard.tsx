'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  id: string | number;
  slug: string;
  name: string;
  shortName: string;
  category?: string;
  image?: string;
  localImage?: string;
  gradient?: string;
  price: number;
  salePrice: number;
  discount: number;
  rating: string | number;
  reviews: number;
  installments?: number;
  badge?: string | null;
}

export default function ProductCard({
  id, slug, name, shortName, image, localImage, gradient,
  price, salePrice, discount, rating, reviews,
  installments = 4, badge,
}: ProductCardProps) {
  const { addItem } = useCart();

  const numRating = Number(rating) || 5;
  const stars = '★'.repeat(Math.floor(numRating)) + (numRating % 1 >= 0.5 ? '★' : '');
  const installmentValue = (salePrice / installments).toFixed(2);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ 
      id: String(id), slug, name, shortName, 
      image: image || '', localImage, gradient: gradient || '', 
      originalPrice: price, salePrice 
    });
  };

  return (
    <Link
      href={`/produto/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-1 hover:border-magenta/30 hover:shadow-[0_18px_40px_-12px_rgba(255,30,122,0.28)]"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-surface-light to-surface">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta/10 blur-2xl" />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-pop px-2.5 py-1 text-[11px] font-black text-background shadow">
            -{discount}%
          </span>
        )}

        {/* Custom Badge */}
        {badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-magenta px-2.5 py-1 text-[10px] font-black text-white shadow">
            {badge}
          </span>
        )}

        {/* Product Image or Emoji */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {localImage ? (
            <img 
              src={localImage} 
              alt={shortName}
              className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_10px_18px_rgba(27,16,32,0.18)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2"
            />
          ) : (
            <span className="text-7xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2">
              {image}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Stars */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
          {stars}
          <span className="text-muted">({reviews.toLocaleString('pt-BR')})</span>
        </div>

        {/* Name */}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {shortName}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-3">
          <p className="text-xs text-muted line-through">
            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="font-[var(--font-display)] text-lg font-extrabold leading-tight tracking-tight tabular-nums text-magenta sm:text-xl">
            R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-medium text-muted">
            {installments}x de R$ {Number(installmentValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros 💳
          </p>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full rounded-xl bg-magenta py-2.5 text-sm font-extrabold text-white transition hover:bg-magenta-light active:scale-95"
          >
            adicionar ao carrinho
          </button>
        </div>
      </div>
    </Link>
  );
}
