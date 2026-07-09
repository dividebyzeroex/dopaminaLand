'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

export default function OfertasClient({ flashDeals, todayPicks }: { flashDeals: any[], todayPicks: any[] }) {
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
    // End of day countdown
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const int = setInterval(updateTimer, 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <main className="flex-1 overflow-x-clip bg-background">
      <div className="mx-auto max-w-[92rem] px-4 py-8 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground sm:text-4xl">
              🔥 Ofertas
            </h1>
            <p className="mt-1 text-sm text-foreground/55">
              100% produtos falsos, 100% dopamina real — ofertas frescas todos os dias.
            </p>
          </div>
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold text-foreground/55">
            Ofertas rodam a cada 24h
          </span>
        </div>

        {/* Flash Deals Section */}
        <section className="mt-6 rounded-3xl border border-pop/30 bg-gradient-to-br from-[#fff7fb] to-[#fff1e8] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-[var(--font-display)] text-xl font-extrabold text-magenta">
              ⚡ Ofertas Relâmpago
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs font-black tabular-nums text-[#faf6f2]">
              ⏳ termina em <span className="text-pop">{timeLeft}</span>
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {flashDeals.map((item, i) => {
              const stockSold = 85 + (i * 4); // Fake sold percentage: 85%, 89%, 93%
              return (
                <a
                  key={item.id}
                  href={`/produto/${item.slug}`}
                  className="group flex gap-4 rounded-2xl border border-foreground/8 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-white to-[#f1ebf2]">
                    <span className="absolute left-1 top-1 rounded-full bg-pop px-1.5 py-0.5 text-[10px] font-black text-foreground">
                      -{item.discount}% OFF
                    </span>
                    <img
                      src={item.image_url}
                      alt={item.short_name}
                      className="max-h-[80%] max-w-[80%] object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-foreground/35 line-through">
                      R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="font-[var(--font-display)] text-lg font-extrabold text-magenta">
                      R$ {item.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-auto pt-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pop to-magenta"
                          style={{ width: `${stockSold}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-foreground/45">
                        {stockSold}% vendido
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Today's Picks Section */}
        <section className="mt-10">
          <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
            Escolhas de Hoje
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {todayPicks.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                shortName={product.short_name}
                category={product.category}
                price={product.price}
                salePrice={product.sale_price}
                discount={product.discount}
                rating={product.rating}
                reviews={product.reviews}
                localImage={product.image_url}
              />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
