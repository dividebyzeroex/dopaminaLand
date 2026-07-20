'use client';

import { useGame } from '@/contexts/GameContext';
import { useCart } from '@/contexts/CartContext';

export default function GuiltStatement() {
  const { xp, level, levelTitle, levelEmoji, purchaseCount, totalSpent } = useGame();
  const { items } = useCart();

  const totalCartValue = items.reduce((s, i) => s + i.salePrice * i.quantity, 0);
  const totalEverSaved = totalSpent + totalCartValue;

  // Dopamine weight calculation (obviously fake science)
  const dopamineGrams = (xp * 0.0015).toFixed(1);
  const coffeeEquivalent = Math.floor(xp / 80);
  const hoursOfTherapySaved = (purchaseCount * 0.5).toFixed(1);
  const carbonFootprintFake = (purchaseCount * 0.02).toFixed(2);

  const now = new Date();
  const receiptId = `DOP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

  return (
    <div className="mx-auto max-w-lg">
      {/* Receipt-style card */}
      <div className="relative rounded-3xl border border-border bg-gradient-to-b from-card to-surface p-8 shadow-2xl overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-neon/5 rounded-bl-[100%]" />

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-2">🧾</p>
          <h2 className="text-2xl font-black text-foreground">Extrato da Culpa</h2>
          <p className="text-xs text-muted mt-1">Comprovante Oficial de Alívio Dopaminérgico</p>
          <p className="text-[10px] text-muted/50 mt-1 font-mono">{receiptId}</p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border my-4" />

        {/* User Info */}
        <div className="flex items-center justify-between text-sm mb-6">
          <span className="text-muted">Nível</span>
          <span className="font-black text-foreground">{levelEmoji} {levelTitle} (Lv.{level})</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox label="Compras fictícias" value={String(purchaseCount)} icon="🛒" />
          <StatBox label="Economia real" value={`R$ ${totalEverSaved.toLocaleString('pt-BR')}`} icon="💰" accent />
          <StatBox label="Dopamina gerada" value={`${dopamineGrams}g`} icon="🧠" />
          <StatBox label="Equivalente a" value={`${coffeeEquivalent} cafés`} icon="☕" />
          <StatBox label="Horas de terapia salvas" value={hoursOfTherapySaved} icon="🧘" />
          <StatBox label="Pegada de CO₂ evitada" value={`${carbonFootprintFake}kg`} icon="🌱" />
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border my-4" />

        {/* Grand Total */}
        <div className="text-center py-4">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Total economizado na vida real</p>
          <p className="text-5xl font-black text-neon">
            R$ {totalEverSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted/60 mt-2">
            Ao invés de gastar, você extraiu {dopamineGrams}g de dopamina pura do nada.
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border my-4" />

        {/* Verdict */}
        <div className="rounded-2xl bg-neon/5 border border-neon/20 p-4 text-center">
          <p className="text-lg font-black text-neon">
            {purchaseCount === 0
              ? '⚠️ Você ainda não comprou nada! Vá fazer uma terapia de dopamina.'
              : purchaseCount < 5
              ? '🌟 Iniciante dopaminérgico. Continue comprando (de mentira)!'
              : purchaseCount < 20
              ? '🔥 Dependente funcional de compras fictícias. Parabéns!'
              : '🏆 VICIADO PROFISSIONAL. Sua fatura é R$ 0,00 e sua dopamina é infinita.'}
          </p>
        </div>

        {/* Fine Print */}
        <p className="text-[9px] text-muted/30 text-center mt-6 leading-relaxed">
          Este comprovante não tem valor fiscal, legal, moral, espiritual ou gravitacional.
          Emitido pela Receita Federal Imaginária do Brasil (RFIB). Válido em universos paralelos.
          A Dopamina Brasil não se responsabiliza por surtos de felicidade inexplicável.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, accent }: { label: string; value: string; icon: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${accent ? 'border-neon/30 bg-neon/5' : 'border-border bg-black/20'}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-lg font-black ${accent ? 'text-neon' : 'text-foreground'}`}>{value}</p>
      <p className="text-[10px] text-muted leading-tight">{label}</p>
    </div>
  );
}
