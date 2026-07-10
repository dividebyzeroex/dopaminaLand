'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import gameData from '@/data/achievements.json';

// Leaderboard Mock
const leaderboard = [
  { rank: 1, name: 'Chuck Norris', orders: 999, dopamine: 149850 },
  { rank: 2, name: 'Elon M.', orders: 300, dopamine: 42500 },
  { rank: 3, name: 'John Wick', orders: 150, dopamine: 22000 },
  { rank: 4, name: 'MC Xamã', orders: 100, dopamine: 14000 },
  { rank: 5, name: 'Tia do Zap', orders: 66, dopamine: 9600 },
  { rank: 6, name: 'Keanu R.', orders: 45, dopamine: 6500 },
  { rank: 7, name: 'Comprei Tudo', orders: 30, dopamine: 4000 },
  { rank: 8, name: 'Faminto 24h', orders: 15, dopamine: 2000 },
  { rank: 9, name: 'V', orders: 9, dopamine: 1350 },
  { rank: 10, name: 'Zé das Compras', orders: 8, dopamine: 1050 },
];

export default function ContaClient() {
  const {
    nickname,
    email,
    setNickname,
    setEmail,
    xp,
    level,
    levelEmoji,
    levelTitle,
    xpProgress,
    nextLevel,
    purchaseCount,
    totalSpent,
    achievements,
  } = useGame();

  const [inputName, setInputName] = useState(nickname);
  const [inputEmail, setInputEmail] = useState(email);
  const [isSaved, setIsSaved] = useState(false);

  // Stats mock
  const delivered = purchaseCount; // Assumes all arrived immediately
  const lost = 0; // Faked 0 lost
  const kmTraveled = purchaseCount * 850; // Random multiplier for km traveled

  useEffect(() => {
    setInputName(nickname);
  }, [nickname]);

  useEffect(() => {
    setInputEmail(email);
  }, [email]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setNickname(inputName || 'Anônimo');
    setEmail(inputEmail);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-5xl font-black text-foreground">
          Minha conta ⚡
        </h1>
        <p className="mt-2 text-lg font-medium text-muted">
          Seu histórico de pedidos puramente dopaminérgico
        </p>
      </div>

      {/* Profile Creation Section */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-surface-light p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-foreground">
            Crie um perfil para ver tudo em qualquer lugar
          </h2>
          <p className="text-sm font-medium text-muted">
            Sem senhas — apenas nome e email. Seus pedidos acompanham você.
          </p>
        </div>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="seu nome"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
            required
          />
          <input
            type="email"
            placeholder="seu email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-white px-5 py-4 font-medium text-foreground outline-none transition focus:border-neon"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-neon px-8 py-4 font-extrabold text-white transition hover:scale-105 active:scale-95"
          >
            {isSaved ? 'Salvo! ✓' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🛒</div>
          <div className="mt-2 text-4xl font-black text-foreground">{purchaseCount}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Pedidos Feitos
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🎉</div>
          <div className="mt-2 text-4xl font-black text-emerald-500">{delivered}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Entregues
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🐳</div>
          <div className="mt-2 text-4xl font-black text-rose-500">{lost}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Perdidos
          </div>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm md:col-span-1">
          <div className="text-2xl">💸</div>
          <div className="mt-2 text-4xl font-black text-neon">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Total Economizado
          </div>
          <p className="mt-1 text-[10px] text-muted">que você NÃO gastou</p>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">🌍</div>
          <div className="mt-2 text-4xl font-black text-foreground">
            {new Intl.NumberFormat('pt-BR').format(kmTraveled)} km
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Km Viajados
          </div>
        </div>
        <div className="col-span-1 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="text-2xl">⚡</div>
          <div className="mt-2 text-4xl font-black text-purple-600">{xp}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">
            Dopamina Ganha
          </div>
        </div>
      </div>

      {/* Hall of Shame */}
      <div className="mb-12 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <span>🏆</span> HALL DA VERGONHA
        </div>
        <p className="mt-2 font-medium text-foreground">
          Nenhum desastre... ainda. 😇
        </p>
      </div>

      {/* Level XP Bar */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-[#2a1a3a] p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-inner">
              {levelEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon px-2.5 py-0.5 text-xs font-black uppercase">
                  Level {level}
                </span>
                <h3 className="font-[var(--font-display)] text-3xl font-black">
                  {levelTitle}
                </h3>
              </div>
            </div>
          </div>
          <div className="text-right text-sm font-bold text-white/60">
            {xp} ⚡
          </div>
        </div>
        
        <div className="mt-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, xpProgress))}%` }}
            />
          </div>
          <div className="mt-3 text-xs font-medium text-white/50">
            {nextLevel 
              ? `${nextLevel.xpRequired - xp} ⚡ restantes para: ${nextLevel.title}`
              : 'Nível Máximo Alcançado! Sua dopamina transbordou.'}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[var(--font-display)] text-2xl font-extrabold uppercase tracking-wide text-foreground">
            <span>🏅</span> CONQUISTAS
          </h2>
          <div className="text-sm font-bold text-muted">
            {achievements.length}/{gameData.achievements.length} desbloqueadas
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {gameData.achievements.map((ach) => {
            const isUnlocked = achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-6 text-center transition ${
                  isUnlocked 
                    ? 'border-border bg-purple-50/50 shadow-sm' 
                    : 'border-transparent bg-surface-light opacity-60 grayscale'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute right-3 top-3 text-xs text-muted">🔒</div>
                )}
                {isUnlocked && (
                  <div className="absolute right-3 top-3 text-xs text-emerald-500">✔️</div>
                )}
                <div className="mb-3 text-4xl">{ach.icon}</div>
                <h4 className="font-bold text-foreground">{ach.title}</h4>
                <p className="mt-1 text-[11px] text-muted">{ach.description}</p>
                {isUnlocked && (
                  <div className="mt-3 rounded-full bg-neon/10 px-2 py-0.5 text-[10px] font-black text-neon">
                    +{ach.xpReward} ⚡
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-12 rounded-3xl bg-surface-light p-6 shadow-sm md:p-8">
        <h2 className="mb-6 flex items-center gap-2 font-[var(--font-display)] text-xl font-extrabold uppercase tracking-wide text-foreground">
          <span>🏆</span> LEADERBOARD — TOP COMPRADORES
        </h2>
        <div className="flex flex-col gap-2">
          {leaderboard.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-lg font-black text-muted">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                </div>
                <div className="font-bold text-foreground">{user.name}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-sm font-medium text-muted sm:block">
                  {user.orders} pedidos
                </div>
                <div className="font-[var(--font-display)] text-lg font-black text-purple-600">
                  {new Intl.NumberFormat('pt-BR').format(user.dopamine)} ⚡
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
