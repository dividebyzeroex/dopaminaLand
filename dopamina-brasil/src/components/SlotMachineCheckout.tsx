'use client';

import { useState, useCallback } from 'react';

const SLOT_SYMBOLS = ['💎', '🍒', '7️⃣', '🎰', '⚡', '🔥', '💰', '🃏'];
const WIN_MESSAGES = [
  'CARTÃO APROVADO! 💳✅',
  'PAGAMENTO ACEITO COM SUCESSO! 🎉',
  'TRANSAÇÃO FICTÍCIA CONFIRMADA! ✨',
  'CARTÃO FAKE PASSOU NO ANTI-FRAUDE! 🤯',
];
const LOSE_MESSAGES = [
  'QUASE! Gire de novo! 🎰',
  'O banco (inexistente) recusou! 🏦❌',
  'Erro 404: Dinheiro não encontrado 💸',
  'Operadora de cartão imaginário bloqueou! 🃏',
];

interface SlotMachineCheckoutProps {
  onConfirm: () => void;
  totalValue: number;
}

export default function SlotMachineCheckout({ onConfirm, totalValue }: SlotMachineCheckoutProps) {
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(['❓', '❓', '❓']);
  const [result, setResult] = useState<'idle' | 'win' | 'lose'>('idle');
  const [message, setMessage] = useState('Puxe a alavanca para aprovar seu cartão fake!');
  const [attempts, setAttempts] = useState(0);
  const [leverPulled, setLeverPulled] = useState(false);

  const playSound = useCallback((win: boolean) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (win) {
        // Jackpot arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.4);
        });
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  }, []);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setLeverPulled(true);
    setResult('idle');

    // Always win on 3rd attempt
    const willWin = attempts >= 2 || Math.random() > 0.6;
    const duration = 2000;
    const tickInterval = 80;
    let elapsed = 0;

    const ticker = setInterval(() => {
      elapsed += tickInterval;
      setSlots([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);

      if (elapsed >= duration) {
        clearInterval(ticker);
        if (willWin) {
          const winSymbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
          setSlots([winSymbol, winSymbol, winSymbol]);
          setResult('win');
          setMessage(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
          playSound(true);
        } else {
          const s1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
          let s2 = s1;
          while (s2 === s1) s2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
          setSlots([s1, s1, s2]);
          setResult('lose');
          setMessage(LOSE_MESSAGES[Math.floor(Math.random() * LOSE_MESSAGES.length)]);
          playSound(false);
        }
        setSpinning(false);
        setLeverPulled(false);
        setAttempts(a => a + 1);
      }
    }, tickInterval);
  }, [spinning, attempts, playSound]);

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-gradient-to-b from-surface to-card p-8 shadow-2xl max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-foreground">🎰 Cassino do Checkout</h2>
        <p className="text-sm text-muted mt-1">Tente a sorte para aprovar seu cartão falso!</p>
      </div>

      {/* Display Total */}
      <div className="rounded-xl bg-black/40 border border-neon/20 px-6 py-3 text-center">
        <p className="text-xs text-muted uppercase tracking-wider">Total Fictício</p>
        <p className="text-3xl font-black text-neon">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Slot Machine */}
      <div className="flex items-center gap-2">
        {/* Reels */}
        <div className="flex gap-3 rounded-2xl border-2 border-border bg-black/60 p-4">
          {slots.map((symbol, i) => (
            <div
              key={i}
              className={`flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-surface text-4xl font-black transition-all ${
                spinning ? 'animate-pulse scale-110' : ''
              } ${result === 'win' ? 'border-neon shadow-[0_0_20px_rgba(204,255,0,0.3)]' : ''}`}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Lever */}
        <button
          onClick={spin}
          disabled={spinning || result === 'win'}
          className={`relative ml-2 flex flex-col items-center gap-1 transition-transform ${leverPulled ? 'translate-y-4' : ''}`}
        >
          <div className="h-8 w-3 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-lg" />
          <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-zinc-400 to-zinc-600" />
          <div className="h-3 w-6 rounded-full bg-zinc-500" />
        </button>
      </div>

      {/* Message */}
      <p className={`text-center font-black text-lg transition-all ${
        result === 'win' ? 'text-neon animate-pulse' : result === 'lose' ? 'text-red-400' : 'text-muted'
      }`}>
        {message}
      </p>

      {/* Action Buttons */}
      {result === 'win' ? (
        <button
          onClick={onConfirm}
          className="w-full rounded-2xl bg-neon py-4 text-lg font-extrabold text-background shadow-[0_0_30px_rgba(204,255,0,0.4)] transition hover:scale-105 active:scale-95"
        >
          CONFIRMAR COMPRA FAKE! 🎉
        </button>
      ) : (
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full rounded-2xl border-2 border-neon/30 bg-neon/10 py-4 text-lg font-extrabold text-neon transition hover:bg-neon/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          {spinning ? '⏳ Girando...' : attempts === 0 ? '🎰 PUXAR ALAVANCA' : '🎰 TENTAR NOVAMENTE'}
        </button>
      )}

      <p className="text-[10px] text-muted/40 text-center">
        Cassino regulamentado pela ANATEL (Agência Nacional de Alucinações Temporárias). Tentativa {attempts}/∞
      </p>
    </div>
  );
}
