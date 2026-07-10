'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { items, totalFakePrice, totalItems, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground">
        Carrinho 🛒
      </h1>
      <p className="mt-1 text-sm text-muted">
        {totalItems} {totalItems === 1 ? 'item fictício' : 'itens fictícios'} esperando pelo checkout mais honesto da internet.
      </p>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <span className="text-8xl block mb-6">🛒</span>
          <h2 className="text-2xl font-extrabold text-foreground">Seu carrinho está vazio!</h2>
          <p className="mt-2 text-muted">Nenhum produto fictício por aqui. Vamos resolver isso?</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-neon px-8 py-3.5 text-base font-extrabold text-white shadow-lg transition hover:bg-neon-light hover:scale-105"
          >
            Ir às compras ⚡
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-neon/20"
              >
                {/* Product emoji */}
                <Link
                  href={`/produto/${item.slug}`}
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-surface-light text-5xl transition hover:bg-surface-lighter"
                >
                  {item.image}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/produto/${item.slug}`} className="hover:text-neon transition">
                    <h3 className="text-sm font-bold text-foreground">{item.shortName}</h3>
                  </Link>
                  <p className="text-xs text-muted line-through mt-1">
                    R$ {item.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-lg font-extrabold text-neon">
                    R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>

                  {/* Quantity Controls */}
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 rounded-lg bg-surface-light text-sm font-bold text-foreground hover:bg-surface-lighter transition"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-foreground w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-lg bg-surface-light text-sm font-bold text-foreground hover:bg-surface-lighter transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-sm text-muted hover:text-neon transition"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-muted hover:text-neon transition"
            >
              🗑️ Limpar carrinho
            </button>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-foreground">Resumo do Pedido</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal ({totalItems} itens):</span>
                  <span className="text-muted line-through">
                    R$ {totalFakePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Frete imaginário:</span>
                  <span className="text-neon-green font-bold">GRÁTIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Desconto Dopaminando:</span>
                  <span className="text-neon font-bold">-100%</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-extrabold text-foreground">Total:</span>
                  <span className="text-3xl font-extrabold text-neon-green">R$ 0,00</span>
                </div>
                <p className="text-[10px] text-muted mt-1">
                  (de R$ {totalFakePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por R$ 0,00 — que pechincha!)
                </p>
              </div>

              <Link
                href="/checkout"
                className="block w-full rounded-2xl bg-neon py-4 text-center text-lg font-extrabold text-white shadow-lg transition hover:bg-neon-light active:scale-[0.98] animate-pulse-glow"
              >
                FINALIZAR COMPRA 🚀
              </Link>

              <p className="text-[10px] text-center text-muted">
                ⚡ Nenhum cartão será cobrado. Nenhuma fatura será gerada. Zero stress.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
