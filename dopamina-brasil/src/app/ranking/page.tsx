'use client';

import { useGame } from '@/contexts/GameContext';
import Link from 'next/link';
import gameData from '@/data/achievements.json';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Fake leaderboard data
const fakeLeaderboard = [
  { rank: 1, name: 'Capivara do Tietê 🦫', level: 7, totalSpent: 2847593.42, purchases: 342 },
  { rank: 2, name: 'Motoboy Cleiton 🛵', level: 7, totalSpent: 1923847.10, purchases: 287 },
  { rank: 3, name: 'Alien da BR-101 👽', level: 6, totalSpent: 892341.55, purchases: 198 },
  { rank: 4, name: 'Dona Maria do Rex 🐕', level: 6, totalSpent: 567234.89, purchases: 156 },
  { rank: 5, name: 'Baleia Consumista 🐋', level: 5, totalSpent: 345678.12, purchases: 123 },
  { rank: 6, name: 'Pombo Entregador 🐦', level: 5, totalSpent: 234567.90, purchases: 98 },
  { rank: 7, name: 'Catapulta Medieval 🏰', level: 4, totalSpent: 123456.78, purchases: 67 },
  { rank: 8, name: 'QR Code Fantasma 👻', level: 4, totalSpent: 89012.34, purchases: 45 },
  { rank: 9, name: 'Boleto Imortal 📄', level: 3, totalSpent: 56789.01, purchases: 34 },
  { rank: 10, name: 'Fatura Inexistente 🧾', level: 3, totalSpent: 34567.89, purchases: 23 },
];

const rankEmojis = ['🥇', '🥈', '🥉'];

export default function RankingPage() {
  const { nickname, xp, level, levelTitle, levelEmoji, totalSpent, purchaseCount, achievements, orders, userId } = useGame();
  
  const [leaderboard, setLeaderboard] = useState<any[]>(fakeLeaderboard);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('total_spent', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map((d, index) => ({
            rank: index + 1,
            name: d.nickname,
            level: d.level,
            totalSpent: Number(d.total_spent),
            purchases: d.purchase_count,
            userId: d.user_id,
          }));
          setLeaderboard(formatted);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        // Fallback to fake data
        setLeaderboard(fakeLeaderboard);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Find player rank in the current leaderboard
  const playerRank = leaderboard.findIndex(l => l.userId === userId || totalSpent > l.totalSpent);
  let displayRank = playerRank === -1 ? leaderboard.length + 1 : playerRank + 1;
  if (playerRank !== -1 && leaderboard[playerRank].userId !== userId && totalSpent > leaderboard[playerRank].totalSpent) {
    // We are beating them but not in the list (e.g. sync hasn't happened)
    displayRank = playerRank + 1;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-[var(--font-display)] text-3xl font-extrabold text-foreground text-center">
        Ranking dos Esbanjadores 🏆
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Os maiores compradores fictícios do Brasil. Gaste mais (de mentira) para subir!
      </p>

      {/* Player Stats Card */}
      <div className="mt-8 rounded-2xl border border-neon/30 bg-gradient-to-r from-neon/10 via-purple/10 to-cyan/10 p-6 neon-border">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neon/20 text-4xl">
            {levelEmoji}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-neon">Seu Perfil</p>
            <h2 className="text-xl font-extrabold text-foreground">{nickname}</h2>
            <p className="text-sm text-muted">
              {levelEmoji} Nível {level} — {levelTitle}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-neon">{xp}</p>
              <p className="text-[10px] text-muted uppercase">XP Total</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-pop">
                R$ {(totalSpent / 1000).toFixed(0)}K
              </p>
              <p className="text-[10px] text-muted uppercase">&quot;Gasto&quot;</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-neon-green">{purchaseCount}</p>
              <p className="text-[10px] text-muted uppercase">Compras</p>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Nível {level}</span>
            <span>{xp} XP</span>
            {level < 7 && <span>Nível {level + 1}</span>}
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-lighter overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-purple transition-all duration-1000"
              style={{ width: `${Math.min(100, ((xp - (gameData.levels.find(l => l.level === level)?.xpRequired || 0)) / ((gameData.levels.find(l => l.level === level + 1)?.xpRequired || xp) - (gameData.levels.find(l => l.level === level)?.xpRequired || 0))) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-10">
        <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
          Top Compradores Fictícios 🔥
        </h2>
        <div className="mt-4 space-y-2">
          {isLoading && (
            <div className="text-center py-8 text-muted">
              <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neon border-t-transparent mb-2"></span>
              <p className="text-sm">Buscando os maiores esbanjadores...</p>
            </div>
          )}
          
          {!isLoading && leaderboard.map((entry, i) => {
            const isPlayer = entry.userId === userId;
            const isBeforePlayer = !isPlayer && (displayRank === i + 1);

            return (
              <div key={entry.rank}>
                {/* Insert player row */}
                {isBeforePlayer && totalSpent > 0 && (
                  <div className="flex items-center gap-4 rounded-xl border border-neon/50 bg-neon/10 p-4 mb-2 neon-border">
                    <span className="w-8 text-center text-lg font-extrabold text-neon">
                      #{displayRank}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon/20 text-lg">
                      {levelEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-foreground truncate">{nickname} <span className="text-neon">(VOCÊ!)</span></p>
                      <p className="text-xs text-muted">Nível {level} • {purchaseCount} compras</p>
                    </div>
                    <p className="text-sm font-extrabold text-neon">
                      R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                <div className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                  isPlayer 
                    ? 'border-neon/50 bg-neon/10 neon-border' 
                    : i < 3 
                      ? 'border-border bg-gradient-to-r from-card to-surface-light hover:border-neon/20' 
                      : 'border-border bg-card hover:border-neon/20'
                }`}>
                  <span className={`w-8 text-center text-lg font-extrabold ${isPlayer ? 'text-neon' : 'text-muted'}`}>
                    {i < 3 ? rankEmojis[i] : `#${entry.rank}`}
                  </span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${isPlayer ? 'bg-neon/20' : 'bg-surface-light'}`}>
                    {isPlayer ? levelEmoji : (gameData.levels.find(l => l.level === entry.level)?.emoji || '👀')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-foreground truncate">
                      {entry.name} {isPlayer && <span className="text-neon">(VOCÊ!)</span>}
                    </p>
                    <p className="text-xs text-muted">Nível {entry.level} • {entry.purchases} compras</p>
                  </div>
                  <p className={`text-sm font-extrabold ${isPlayer ? 'text-neon' : i < 3 ? 'text-pop' : 'text-muted'}`}>
                    R$ {entry.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Player at bottom if not in top list and not already rendered */}
          {!isLoading && displayRank > leaderboard.length && totalSpent > 0 && !leaderboard.some(l => l.userId === userId) && (
            <>
              <div className="text-center text-muted py-2">• • •</div>
              <div className="flex items-center gap-4 rounded-xl border border-neon/50 bg-neon/10 p-4 neon-border">
                <span className="w-8 text-center text-lg font-extrabold text-neon">
                  #{displayRank}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon/20 text-lg">
                  {levelEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-foreground truncate">{nickname} <span className="text-neon">(VOCÊ!)</span></p>
                  <p className="text-xs text-muted">Nível {level} • {purchaseCount} compras</p>
                </div>
                <p className="text-sm font-extrabold text-neon">
                  R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-12">
        <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
          Conquistas 🏅
        </h2>
        <p className="mt-1 text-sm text-muted">
          {achievements.length}/{gameData.achievements.length} desbloqueadas
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {gameData.achievements.map((achievement) => {
            const unlocked = achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                  unlocked
                    ? 'border-pop/30 bg-pop/5'
                    : 'border-border bg-card opacity-50'
                }`}
              >
                <span className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${unlocked ? 'text-foreground' : 'text-muted'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted">{achievement.description}</p>
                </div>
                {unlocked ? (
                  <span className="text-xs font-bold text-pop">+{achievement.xpReward} XP</span>
                ) : (
                  <span className="text-xs text-muted">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order History */}
      {orders.length > 0 && (
        <div className="mt-12">
          <h2 className="font-[var(--font-display)] text-xl font-extrabold text-foreground">
            Histórico de Compras 📦
          </h2>
          <div className="mt-4 space-y-3">
            {orders.slice(0, 10).map((order) => (
              <Link
                key={order.id}
                href={`/rastreamento/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:border-neon/30"
              >
                <div>
                  <p className="text-sm font-bold text-foreground font-mono">{order.id}</p>
                  <p className="text-xs text-muted">
                    {new Date(order.date).toLocaleDateString('pt-BR')} • {order.items.length} itens • +{order.xpEarned} XP
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted line-through">
                    R$ {order.totalFake.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm font-extrabold text-neon-green">R$ 0,00</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center">
        <p className="text-muted text-sm">Quer subir no ranking?</p>
        <Link
          href="/"
          className="mt-3 inline-block rounded-full bg-neon px-8 py-3.5 text-base font-extrabold text-background shadow-lg transition hover:bg-neon-light hover:scale-105 active:scale-95 animate-pulse-glow"
        >
          Comprar mais (de mentira) ⚡
        </Link>
      </div>
    </div>
  );
}
