'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalFakePrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface border-l border-border shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-extrabold text-foreground">
            🛒 Carrinho <span className="text-muted text-sm font-medium">({totalItems} itens)</span>
          </h2>
          <button
            onClick={closeCart}
            className="rounded-full bg-surface-light p-2 text-muted transition hover:bg-surface-lighter hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-6xl mb-4">🛒</span>
              <p className="text-lg font-bold text-foreground">Carrinho vazio!</p>
              <p className="mt-1 text-sm text-muted">
                Sua dose de dopaminando tá esperando no catálogo.
              </p>
              <button
                onClick={closeCart}
                className="mt-4 rounded-full bg-neon px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neon-light"
              >
                Ir às compras ⚡
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-border bg-card p-3"
                >
                  {/* Product image or emoji */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-light text-3xl">
                    {item.localImage ? (
                      <img src={item.localImage} alt={item.shortName} className="h-full w-full object-contain p-1" />
                    ) : (
                      item.image
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {item.shortName}
                    </h3>
                    <p className="text-xs text-muted line-through">
                      R$ {item.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm font-extrabold text-neon">
                      R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    {/* Quantity */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-surface-light text-xs font-bold text-foreground hover:bg-surface-lighter"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-surface-light text-xs font-bold text-foreground hover:bg-surface-lighter"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs text-muted hover:text-neon transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-3">
            {/* Fake price */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal (fictício):</span>
              <span className="text-sm text-muted line-through">
                R$ {totalFakePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Real price (always 0) */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-foreground">Total real:</span>
              <span className="text-2xl font-extrabold text-neon-green">R$ 0,00</span>
            </div>

            <p className="text-[10px] text-center text-muted">
              ⚡ Porque a dopaminando é de graça (e seu dinheiro continua no bolso)
            </p>

            <Link
              href="/checkout"
              onClick={() => {
                closeCart();
                items.forEach(item => {
                  trackEvent('fake_checkout', item.id, item.salePrice, { quantity: item.quantity, source: 'cart_drawer' });
                });
              }}
              className="block w-full rounded-xl bg-neon py-3.5 text-center text-base font-extrabold text-white shadow-lg transition hover:bg-neon-light active:scale-95 animate-pulse-glow"
            >
              FINALIZAR COMPRA 🚀
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
