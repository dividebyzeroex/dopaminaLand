'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import lootData from '@/data/lootbox.json';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface LootItem {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  rarityLabel: string;
  xpReward: number;
}

function rollItem(): LootItem {
  const weights = lootData.rarityWeights as Record<Rarity, number>;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  let selectedRarity: Rarity = 'common';

  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) {
      selectedRarity = rarity as Rarity;
      break;
    }
  }

  const pool = lootData.items.filter(i => i.rarity === selectedRarity);
  const item = pool[Math.floor(Math.random() * pool.length)];
  return item as LootItem;
}

export default function LootBox() {
  const [phase, setPhase] = useState<'idle' | 'shaking' | 'exploding' | 'revealed'>('idle');
  const [item, setItem] = useState<LootItem | null>(null);
  const [canOpen, setCanOpen] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState('');
  const { unlockAchievement } = useGame();

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkCooldown = () => {
    try {
      const lastOpen = localStorage.getItem('dopamina-lootbox-last');
      if (!lastOpen) { setCanOpen(true); setCooldownLeft(''); return; }
      const elapsed = Date.now() - parseInt(lastOpen);
      const remaining = lootData.cooldownMs - elapsed;
      if (remaining <= 0) { setCanOpen(true); setCooldownLeft(''); return; }
      setCanOpen(false);
      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCooldownLeft(`${hours}h ${mins}m ${secs}s`);
    } catch { setCanOpen(true); }
  };

  const handleOpen = useCallback(() => {
    if (!canOpen || phase !== 'idle') return;

    setPhase('shaking');

    setTimeout(() => {
      setPhase('exploding');
      const rolledItem = rollItem();
      setItem(rolledItem);

      setTimeout(() => {
        setPhase('revealed');
        try { localStorage.setItem('dopamina-lootbox-last', Date.now().toString()); } catch {}

        // Save to collection
        try {
          const collection = JSON.parse(localStorage.getItem('dopamina-collection') || '[]');
          collection.push({ ...rolledItem, date: new Date().toISOString() });
          localStorage.setItem('dopamina-collection', JSON.stringify(collection));
        } catch {}

        setCanOpen(false);
      }, 800);
    }, 1500);
  }, [canOpen, phase]);

  const handleReset = () => {
    setPhase('idle');
    setItem(null);
    checkCooldown();
  };

  const rarityColor = item ? (lootData.rarityColors as Record<string, string>)[item.rarity] || '#a1a1aa' : '#a1a1aa';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neon mb-4">
          📦 Caixa Misteriosa
        </span>
        <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-black text-foreground">
          O que vai sair?
        </h1>
        <p className="mt-2 text-sm text-muted">Abra e descubra. Cooldown: 4 horas.</p>
      </div>

      {/* Box */}
      <div className="relative">
        {phase === 'idle' && (
          <button
            onClick={handleOpen}
            disabled={!canOpen}
            className={`relative flex h-48 w-48 items-center justify-center rounded-3xl border-2 transition-all ${
              canOpen
                ? 'border-neon bg-surface animate-loot-pulse hover:scale-105 active:scale-95'
                : 'border-border bg-surface/50 opacity-50'
            }`}
          >
            <span className="text-7xl">{canOpen ? '📦' : '🔒'}</span>
            {!canOpen && cooldownLeft && (
              <div className="absolute -bottom-8 text-xs font-bold text-muted">
                Próxima em: {cooldownLeft}
              </div>
            )}
          </button>
        )}

        {phase === 'shaking' && (
          <div className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-neon bg-surface"
            style={{ animation: 'glitch-anim 0.1s infinite' }}
          >
            <span className="text-7xl">📦</span>
          </div>
        )}

        {phase === 'exploding' && (
          <div className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-white bg-white/20 animate-pulse">
            <div className="absolute inset-0 rounded-3xl bg-white/40 animate-ping" />
          </div>
        )}

        {phase === 'revealed' && item && (
          <div className="text-center animate-loot-reveal">
            <div
              className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 mx-auto"
              style={{
                borderColor: rarityColor,
                boxShadow: `0 0 30px ${rarityColor}40, 0 0 60px ${rarityColor}20`,
                background: `linear-gradient(135deg, ${rarityColor}10, transparent)`,
              }}
            >
              <span className="text-7xl">{item.emoji}</span>
            </div>

            <div className="mt-6 space-y-2">
              <span
                className="inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `${rarityColor}20`, color: rarityColor, border: `1px solid ${rarityColor}40` }}
              >
                {item.rarityLabel}
              </span>
              <h2 className="font-[var(--font-display)] text-2xl font-black text-foreground">{item.name}</h2>
              <p className="text-neon font-extrabold text-lg">+{item.xpReward} XP</p>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 rounded-xl bg-surface border border-border px-6 py-3 text-sm font-bold text-foreground hover:border-neon/30 transition"
            >
              Voltar ←
            </button>
          </div>
        )}

        {/* Particles during explosion */}
        {(phase === 'exploding' || phase === 'shaking') && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-neon"
                style={{
                  left: '50%', top: '50%',
                  animation: `confetti-fall ${1 + Math.random()}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.3}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Collection Preview */}
      <CollectionPreview />
    </div>
  );
}

function CollectionPreview() {
  const [collection, setCollection] = useState<(LootItem & { date: string })[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dopamina-collection') || '[]');
      setCollection(saved.slice(-10).reverse());
    } catch {}
  }, []);

  if (collection.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-md">
      <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
        Últimos Drops ({collection.length})
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {collection.map((item, i) => {
          const color = (lootData.rarityColors as Record<string, string>)[item.rarity] || '#a1a1aa';
          return (
            <div
              key={i}
              className="flex h-14 w-14 items-center justify-center rounded-xl border text-2xl mx-auto"
              style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
              title={`${item.name} (${item.rarityLabel})`}
            >
              {item.emoji}
            </div>
          );
        })}
      </div>
    </div>
  );
}
