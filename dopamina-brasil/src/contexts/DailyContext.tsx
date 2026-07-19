'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import dailyData from '@/data/dailyChallenges.json';

interface DailyChallenge {
  id: string;
  type: string;
  description: string;
  xpReward: number;
  icon: string;
  target?: number;
  category?: string;
  page?: string;
  method?: string;
  completed: boolean;
}

interface DailyState {
  streak: number;
  lastLoginDate: string;
  hasClaimedToday: boolean;
  todayChallenges: DailyChallenge[];
  completedToday: string[];
  multiplier: number;
  streakEmoji: string;
}

interface DailyContextType extends DailyState {
  claimDailyBonus: () => number;
  completeChallenge: (id: string) => void;
  checkPageVisit: (path: string) => void;
}

const DailyContext = createContext<DailyContextType | undefined>(undefined);

function getDateString() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDailyChallenges(dateStr: string): DailyChallenge[] {
  // Deterministic hash from date string to select 3 challenges
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const pool = dailyData.challenges;
  const indices = new Set<number>();
  let h = Math.abs(hash);
  while (indices.size < 3) {
    indices.add(h % pool.length);
    h = Math.floor(h / pool.length) + h * 7 + 1;
    h = Math.abs(h) % 10000;
  }
  return Array.from(indices).map(i => ({ ...pool[i], completed: false }));
}

function getStreakMultiplier(streak: number) {
  const bonuses = dailyData.streakBonuses;
  let current = bonuses[0];
  for (const bonus of bonuses) {
    if (streak >= bonus.days) current = bonus;
    else break;
  }
  return current;
}

export function DailyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DailyState>({
    streak: 0,
    lastLoginDate: '',
    hasClaimedToday: false,
    todayChallenges: [],
    completedToday: [],
    multiplier: 1.0,
    streakEmoji: '🔥',
  });

  useEffect(() => {
    const today = getDateString();
    try {
      const saved = localStorage.getItem('dopamina-daily');
      if (saved) {
        const parsed = JSON.parse(saved);
        const lastDate = parsed.lastLoginDate;
        
        if (lastDate === today) {
          // Same day — restore state
          const challenges = getDailyChallenges(today).map(c => ({
            ...c,
            completed: (parsed.completedToday || []).includes(c.id),
          }));
          const bonus = getStreakMultiplier(parsed.streak);
          setState({
            ...parsed,
            todayChallenges: challenges,
            multiplier: bonus.multiplier,
            streakEmoji: bonus.emoji,
          });
          return;
        }

        // New day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const newStreak = lastDate === yesterdayStr ? parsed.streak + 1 : 1;
        const bonus = getStreakMultiplier(newStreak);
        const challenges = getDailyChallenges(today);

        setState({
          streak: newStreak,
          lastLoginDate: today,
          hasClaimedToday: false,
          todayChallenges: challenges,
          completedToday: [],
          multiplier: bonus.multiplier,
          streakEmoji: bonus.emoji,
        });
      } else {
        // First time
        const challenges = getDailyChallenges(today);
        setState({
          streak: 1,
          lastLoginDate: today,
          hasClaimedToday: false,
          todayChallenges: challenges,
          completedToday: [],
          multiplier: 1.0,
          streakEmoji: '🔥',
        });
      }
    } catch {
      const challenges = getDailyChallenges(today);
      setState({
        streak: 1,
        lastLoginDate: today,
        hasClaimedToday: false,
        todayChallenges: challenges,
        completedToday: [],
        multiplier: 1.0,
        streakEmoji: '🔥',
      });
    }
  }, []);

  // Persist
  useEffect(() => {
    if (!state.lastLoginDate) return;
    try {
      const { todayChallenges, ...rest } = state;
      localStorage.setItem('dopamina-daily', JSON.stringify(rest));
    } catch {}
  }, [state]);

  const claimDailyBonus = useCallback(() => {
    const xp = Math.floor(dailyData.dailyLoginXP * state.multiplier);
    setState(prev => ({ ...prev, hasClaimedToday: true }));
    return xp;
  }, [state.multiplier]);

  const completeChallenge = useCallback((id: string) => {
    setState(prev => {
      if (prev.completedToday.includes(id)) return prev;
      return {
        ...prev,
        completedToday: [...prev.completedToday, id],
        todayChallenges: prev.todayChallenges.map(c =>
          c.id === id ? { ...c, completed: true } : c
        ),
      };
    });
  }, []);

  const checkPageVisit = useCallback((path: string) => {
    setState(prev => {
      const challenge = prev.todayChallenges.find(
        c => c.type === 'visit_page' && c.page === path && !c.completed
      );
      if (!challenge) return prev;
      return {
        ...prev,
        completedToday: [...prev.completedToday, challenge.id],
        todayChallenges: prev.todayChallenges.map(c =>
          c.id === challenge.id ? { ...c, completed: true } : c
        ),
      };
    });
  }, []);

  return (
    <DailyContext.Provider value={{ ...state, claimDailyBonus, completeChallenge, checkPageVisit }}>
      {children}
    </DailyContext.Provider>
  );
}

export function useDaily() {
  const context = useContext(DailyContext);
  if (!context) throw new Error('useDaily must be used within DailyProvider');
  return context;
}
