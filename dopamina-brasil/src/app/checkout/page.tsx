'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useGame } from '@/contexts/GameContext';

const paymentMethods = [
  { id: 'cartao', label: '💳 Cartão de Crédito Imaginário', desc: 'Limite infinito, fatura inexistente' },
  { id: 'pix', label: '👻 Pix Fantasma', desc: 'Transferência instantânea pro além' },
  { id: 'boleto', label: '📄 Boleto que Nunca Vence', desc: 'Vencimento: quando o sol explodir' },
];

const confettiColors = ['#ff1e7a', '#7c3aed', '#06d6ff', '#ffd24a', '#39ff14'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalFakePrice, clearCart, totalItems } = useCart();
  const { completePurchase } = useGame();

  const [paymentMethod, setPaymentMethod] = useState('cartao');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confetti, setConfetti] = useState<{ id: number; color: string; left: number; delay: number }[]>([]);
  const [checkoutStart] = useState(Date.now());
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;

    setIsProcessing(true);

    // Fake processing delay
    setTimeout(() => {
      const id = completePurchase(
        items.map(item => ({ name: item.shortName, price: item.salePrice, quantity: item.quantity })),
        totalFakePrice
      );
      setOrderId(id);
      clearCart();
      setIsProcessing(false);
      setIsComplete(true);

      // Launch confetti!
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setConfetti(pieces);
    }, 2500);
  };

  const applyCoupon = () => {
    if (coupon.trim().length > 0) {
      setCouponApplied(true);
    }
  };

  if (isComplete) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Confetti */}
        {confetti.map(piece => (
          <div
            key={piece.id}
            className="animate-confetti fixed z-50 h-3 w-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}

        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <span className="text-8xl block mb-6">🎉</span>
          <h1 className="font-[var(--font-display)] text-4xl font-extrabold text-foreground">
            COMPRA CONCLUÍDA!
          </h1>
          <p className="mt-2 text-xl text-magenta font-bold">
            (Parabéns, você não gastou nada!)
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Pedido:</span>
              <span className="text-sm font-bold text-foreground">{orderId}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Total cobrado:</span>
              <span className="text-2xl font-extrabold text-neon-green">R$ 0,00</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Status:</span>
              <span className="text-sm font-bold text-pop">Processando a alegria 💊</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href={`/rastreamento/${orderId}`}
              className="block w-full rounded-2xl bg-magenta py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-magenta-light whitespace-nowrap overflow-hidden text-ellipsis px-2"
            >
              RASTREAR PEDIDO 📍
            </Link>
            <Link
              href="/"
              className="block w-full rounded-2xl border-2 border-border py-4 text-lg font-extrabold text-foreground transition hover:border-magenta hover:text-magenta whitespace-nowrap overflow-hidden text-ellipsis px-2"
            >
              COMPRAR MAIS 🛒
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted">
            💊 Lembre-se: nenhum dinheiro foi gasto, nenhum produto será entregue, e a capivara está salva.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground">
        Checkout 💳
      </h1>
      <p className="mt-1 text-sm text-muted">
        Finalize sua compra fictícia em poucos cliques. Valor final: sempre R$ 0,00.
      </p>

      {items.length === 0 && !isProcessing ? (
        <div className="mt-12 text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <p className="text-lg font-bold text-foreground">Seu carrinho está vazio!</p>
          <p className="mt-1 text-sm text-muted">Volte ao catálogo e escolha seus produtos fictícios favoritos.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-magenta px-8 py-3 text-sm font-bold text-white transition hover:bg-magenta-light"
          >
            Ir às compras 💊
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left - Form */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-foreground">Resumo do Pedido</h2>
              <div className="mt-4 space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{item.shortName}</p>
                      <p className="text-xs text-muted">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-magenta">
                      R$ {(item.salePrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Address (visual only) */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-foreground">Endereço de Entrega 📍</h2>
              <p className="mt-1 text-xs text-muted">Apenas para o mapa de rastreamento — não armazenamos dados reais.</p>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua da Capivara, 42 - São Paulo"
                className="mt-4 w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-magenta transition"
              />
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-extrabold text-foreground">Meio de Pagamento 💰</h2>
              <p className="mt-1 text-xs text-muted">Todos igualmente fictícios. Escolha seu favorito.</p>
              <div className="mt-4 space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition ${
                      paymentMethod === method.id
                        ? 'border-magenta bg-magenta/10'
                        : 'border-border bg-surface-light hover:border-magenta/30'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === method.id ? 'border-magenta bg-magenta' : 'border-muted'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-foreground">{method.label}</p>
                      <p className="text-xs text-muted">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Fake Card Form */}
              {paymentMethod === 'cartao' && (
                <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface p-4">
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    defaultValue="4242 4242 4242 4242"
                    className="w-full rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-magenta"
                    readOnly
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      defaultValue="12/99"
                      className="flex-1 rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-magenta"
                      readOnly
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      defaultValue="420"
                      className="w-20 rounded-lg border border-border bg-surface-light px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-magenta"
                      readOnly
                    />
                  </div>
                  <p className="text-[10px] text-muted text-center">
                    💊 Relaxa, esses dados são pré-preenchidos e fictícios. Nada é processado.
                  </p>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="mt-4 text-center rounded-xl border border-border bg-surface p-6">
                  <div className="inline-block rounded-xl bg-white p-4">
                    <div className="grid grid-cols-8 gap-0.5">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div key={i} className={`h-3 w-3 ${Math.random() > 0.5 ? 'bg-background' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-bold text-foreground">QR Code 100% Fictício</p>
                  <p className="text-xs text-muted">Pode escanear à vontade, não vai acontecer nada 👻</p>
                </div>
              )}

              {paymentMethod === 'boleto' && (
                <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-center">
                  <p className="font-mono text-xs text-muted tracking-wider">
                    00000.00000 00000.000000 00000.000000 0 00000000000000
                  </p>
                  <p className="mt-2 text-sm font-bold text-foreground">Vencimento: 31/12/9999</p>
                  <p className="text-xs text-muted">Esse boleto nunca vence porque nunca existiu 📄</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-foreground">Resumo</h2>

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
                {couponApplied && (
                  <div className="flex justify-between">
                    <span className="text-muted">Cupom ({coupon}):</span>
                    <span className="text-pop font-bold">-25% de nada</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Desconto Dopamina:</span>
                  <span className="text-magenta font-bold">
                    -R$ {totalFakePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-extrabold text-foreground">Total:</span>
                  <span className="text-3xl font-extrabold text-neon-green">R$ 0,00</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  className="flex-1 rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-magenta"
                />
                <button
                  onClick={applyCoupon}
                  className="rounded-lg bg-surface-lighter px-4 py-2 text-sm font-bold text-foreground hover:bg-magenta hover:text-white transition whitespace-nowrap shrink-0"
                >
                  Aplicar
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-pop">✨ Cupom aplicado! Desconto de 25% em algo que já era R$ 0,00. Parabéns.</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className={`w-full rounded-2xl py-4 text-lg font-extrabold text-white shadow-lg transition active:scale-[0.98] whitespace-nowrap overflow-hidden text-ellipsis px-2 ${
                  isProcessing
                    ? 'bg-surface-lighter cursor-wait'
                    : 'bg-magenta hover:bg-magenta-light animate-pulse-glow'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Processando dopamina...
                  </span>
                ) : (
                  'FINALIZAR COMPRA 🚀'
                )}
              </button>

              <p className="text-[10px] text-center text-muted">
                💊 Ao clicar, você não concorda com nada porque não existe nada para concordar. É tudo falso. Aproveite.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
