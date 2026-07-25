'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  level: number;
  xp: number;
  total_spent: number;
  purchase_count: number;
  updated_at: string;
}

interface GamificationAnalyticsTabProps {
  events: any[];
}

export default function GamificationAnalyticsTab({ events }: GamificationAnalyticsTabProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('xp', { ascending: false })
          .limit(20);

        if (!error && data) {
          setLeaderboardData(data);
        }
      } catch (e) {
        console.error('Failed to fetch leaderboard for insights:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Resistance training metrics
  const resistanceStarts = events.filter(e => e.event_type === 'resistance_training_start').length;
  const resistanceFails = events.filter(e => e.event_type === 'resistance_training_fail').length;
  const resistanceCompletes = events.filter(e => e.event_type === 'resistance_training_complete').length;

  // Level Distribution
  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  leaderboardData.forEach(entry => {
    const lvl = Math.min(Math.max(entry.level || 1, 1), 7);
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Resistance Training Summary Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="text-base font-black text-amber-400">Analytics do Treinamento de Resistência</h3>
            <p className="text-xs text-zinc-400">Comportamento dos usuários perante a manipulação extrema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500 font-bold">Tentativas Iniciadas</p>
            <p className="text-3xl font-black text-zinc-100 mt-1">{resistanceStarts}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500 font-bold">Derrotados pela Manipulação</p>
            <p className="text-3xl font-black text-red-400 mt-1">{resistanceFails}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500 font-bold">Imunes à Dopamina (Vitórias)</p>
            <p className="text-3xl font-black text-neon mt-1">{resistanceCompletes}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table & Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gamified Users */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2">
              <span>🏆</span> Top Jogadores da Dopamina Land
            </h3>
            <span className="text-xs text-zinc-500">Sincronizados via Supabase</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Jogador</th>
                  <th className="pb-2">Nível</th>
                  <th className="pb-2">XP Acumulado</th>
                  <th className="pb-2">Gasto Fictício</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500 italic">
                      Nenhum jogador registrado no ranking ainda.
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((user, idx) => (
                    <tr key={user.user_id || idx} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 font-bold text-neon">{idx + 1}º</td>
                      <td className="py-2.5 font-bold text-zinc-200">{user.nickname || 'Anônimo'}</td>
                      <td className="py-2.5">
                        <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                          Lvl {user.level || 1}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-300 font-mono">{(user.xp || 0).toLocaleString('pt-BR')} XP</td>
                      <td className="py-2.5 text-emerald-400 font-mono font-bold">R$ {(user.total_spent || 0).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Level distribution */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-zinc-100 mb-4 flex items-center gap-2">
              <span>📊</span> Distribuição por Nível
            </h3>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map(lvl => {
                const count = levelCounts[lvl] || 0;
                const total = leaderboardData.length || 1;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={lvl}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-bold">Nível {lvl}</span>
                      <span className="text-zinc-500 font-mono">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-neon rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-zinc-600 italic text-center mt-6">
            Métricas calculadas dos jogadores no ranking global do Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
