'use client';

import { useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export default function ShareableReceipt({ items, orderId, totalFake }: { items: ReceiptItem[]; orderId: string; totalFake: number }) {
  const { nickname, level, levelEmoji, levelTitle, xp } = useGame();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/rastreamento/${orderId}` : '';
  const shareText = `🧬 Acabei de "gastar" R$ ${totalFake.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no Dopamina! Meu total real: R$ 0,00. Nível: ${levelEmoji} ${levelTitle}. Vem se viciar também:`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up">
      {/* Receipt Card */}
      <div ref={receiptRef} className="mx-auto max-w-sm rounded-3xl border border-neon/20 bg-card p-6 shadow-2xl overflow-hidden relative">
        {/* Glow */}
        <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-neon/5 blur-3xl" />

        {/* Header */}
        <div className="text-center border-b border-border pb-4 mb-4">
          <p className="text-neon font-black text-xs uppercase tracking-widest">⚡ Recibo de Dopamina</p>
          <p className="text-foreground font-[var(--font-display)] text-xl font-black mt-1">dopaminado.com.br</p>
          <p className="text-muted text-[10px] font-mono mt-1">{orderId}</p>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-3 rounded-xl bg-surface p-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon/10 text-xl">{levelEmoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{nickname}</p>
            <p className="text-[10px] text-muted">Nível {level} • {xp} XP</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted truncate flex-1 mr-2">{item.quantity}x {item.name}</span>
              <span className="text-foreground font-bold shrink-0">
                R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {items.length > 5 && (
            <p className="text-xs text-muted text-center">+ {items.length - 5} itens</p>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-border pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal:</span>
            <span className="text-muted line-through">R$ {totalFake.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Desconto Dopamina:</span>
            <span className="text-neon font-bold">-100%</span>
          </div>
          <div className="flex justify-between text-lg font-black pt-2 border-t border-border">
            <span className="text-foreground">TOTAL:</span>
            <span className="text-neon-green">R$ 0,00</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-muted mt-4 leading-relaxed">
          Este recibo é 100% fictício. Nenhum valor foi cobrado.
          <br />A única coisa real é a dopamina. 🧬
        </p>
      </div>

      {/* Share Buttons */}
      <div className="mx-auto max-w-sm mt-6 space-y-3">
        <button
          onClick={handleWhatsApp}
          className="w-full rounded-2xl bg-[#25D366] py-3.5 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Compartilhar no WhatsApp 💬
        </button>
        <button
          onClick={handleTwitter}
          className="w-full rounded-2xl bg-[#1DA1F2] py-3.5 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Postar no Twitter/X 🐦
        </button>
        <button
          onClick={handleCopyLink}
          className="w-full rounded-2xl border border-border bg-surface py-3.5 text-sm font-extrabold text-foreground transition hover:border-neon/30 active:scale-[0.98]"
        >
          {copied ? '✓ Link copiado!' : 'Copiar Link de Rastreamento 🔗'}
        </button>
      </div>
    </div>
  );
}
