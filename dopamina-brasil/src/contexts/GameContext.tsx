'use client';

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode } from 'react';
import gameData from '@/data/achievements.json';
import { supabase } from '@/lib/supabase';

interface OrderHistory {
  id: string;
  date: string;
  items: { name: string; price: number; quantity: number }[];
  totalFake: number;
  xpEarned: number;
}

interface GameState {
  xp: number;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  totalSpent: number;
  purchaseCount: number;
  achievements: string[];
  orders: OrderHistory[];
  nickname: string;
  email: string;
  toasts: { id: string; title: string; description: string; icon: string }[];
  rewardClaimed?: boolean;
  claimedRewards?: string[];
  userId?: string;
}

type GameAction =
  | { type: 'ADD_XP'; payload: number }
  | { type: 'COMPLETE_PURCHASE'; payload: { items: { name: string; price: number; quantity: number }[]; totalFake: number } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_NICKNAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'DISMISS_TOAST'; payload: string }
  | { type: 'CLAIM_REWARD'; payload: { id: string; name: string } }
  | { type: 'LOAD_STATE'; payload: Partial<GameState> };

function getLevelForXP(xp: number) {
  const levels = gameData.levels;
  let current = levels[0];
  for (const level of levels) {
    if (xp >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

function getNextLevel(currentLevel: number) {
  return gameData.levels.find(l => l.level === currentLevel + 1) || null;
}

function generateOrderId() {
  return 'DOP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

const defaultNicknames = [
  'Capivara Anônima',
  'Motoboy Fantasma',
  'Comprador Misterioso',
  'Alien da BR-101',
  'Baleia Consumista',
];

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_XP': {
      const newXP = state.xp + action.payload;
      const level = getLevelForXP(newXP);
      const toasts = [...state.toasts];

      if (level.level > state.level) {
        toasts.push({
          id: `level-${level.level}-${Date.now()}`,
          title: `Level Up! Nível ${level.level}`,
          description: `Você agora é: ${level.emoji} ${level.title}`,
          icon: '🆙',
        });
      }

      return {
        ...state,
        xp: newXP,
        level: level.level,
        levelTitle: level.title,
        levelEmoji: level.emoji,
        toasts,
      };
    }

    case 'COMPLETE_PURCHASE': {
      const xpEarned = gameData.xpPerCheckout + (action.payload.items.length * gameData.xpPerItemInCart);
      const orderId = generateOrderId();
      const newXP = state.xp + xpEarned;
      const level = getLevelForXP(newXP);
      const newTotalSpent = state.totalSpent + action.payload.totalFake;
      const newPurchaseCount = state.purchaseCount + 1;
      const toasts = [...state.toasts];
      const newAchievements = [...state.achievements];

      // Check achievements
      const achievementsToCheck = [
        { id: 'first_purchase', condition: newPurchaseCount === 1 },
        { id: 'five_purchases', condition: newPurchaseCount >= 5 },
        { id: 'big_spender', condition: newTotalSpent >= 100000 },
        { id: 'cart_hoarder', condition: action.payload.items.reduce((s, i) => s + i.quantity, 0) >= 10 },
        { id: 'night_owl', condition: new Date().getHours() >= 0 && new Date().getHours() < 5 },
      ];

      let bonusXP = 0;
      for (const check of achievementsToCheck) {
        if (check.condition && !state.achievements.includes(check.id)) {
          const achievement = gameData.achievements.find(a => a.id === check.id);
          if (achievement) {
            newAchievements.push(check.id);
            bonusXP += achievement.xpReward;
            toasts.push({
              id: `achievement-${check.id}-${Date.now()}`,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
            });
          }
        }
      }

      const totalXP = newXP + bonusXP;
      const finalLevel = getLevelForXP(totalXP);

      if (finalLevel.level > state.level) {
        toasts.push({
          id: `level-${finalLevel.level}-${Date.now()}`,
          title: `Level Up! Nível ${finalLevel.level}`,
          description: `Você agora é: ${finalLevel.emoji} ${finalLevel.title}`,
          icon: '🆙',
        });
      }

      const order: OrderHistory = {
        id: orderId,
        date: new Date().toISOString(),
        items: action.payload.items,
        totalFake: action.payload.totalFake,
        xpEarned: xpEarned + bonusXP,
      };

      return {
        ...state,
        xp: totalXP,
        level: finalLevel.level,
        levelTitle: finalLevel.title,
        levelEmoji: finalLevel.emoji,
        totalSpent: newTotalSpent,
        purchaseCount: newPurchaseCount,
        achievements: newAchievements,
        orders: [order, ...state.orders],
        toasts,
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.payload)) return state;
      const achievement = gameData.achievements.find(a => a.id === action.payload);
      if (!achievement) return state;
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
        xp: state.xp + achievement.xpReward,
        toasts: [
          ...state.toasts,
          {
            id: `achievement-${action.payload}-${Date.now()}`,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
          },
        ],
      };
    }

    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload };

    case 'SET_EMAIL':
      return { ...state, email: action.payload };

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'CLAIM_REWARD': {
      const alreadyClaimed = state.claimedRewards || [];
      const newClaimed = [...alreadyClaimed, action.payload.id];
      return {
        ...state,
        rewardClaimed: true,
        claimedRewards: newClaimed,
        toasts: [
          ...state.toasts,
          {
            id: `claim-reward-${action.payload.id}-${Date.now()}`,
            title: 'Recompensa Resgatada! 📦',
            description: `Seu ${action.payload.name} foi solicitado com sucesso.`,
            icon: '🎁',
          },
        ],
      };
    }

    case 'LOAD_STATE':
      return { 
        ...state, 
        ...action.payload, 
        userId: action.payload.userId || state.userId,
        toasts: [] 
      };

    default:
      return state;
  }
}

const initialState: GameState = {
  xp: 0,
  level: 1,
  levelTitle: 'Curioso',
  levelEmoji: '👀',
  totalSpent: 0,
  purchaseCount: 0,
  achievements: [],
  orders: [],
  nickname: defaultNicknames[Math.floor(Math.random() * defaultNicknames.length)] + ' #' + Math.floor(Math.random() * 9999),
  email: '',
  toasts: [],
  rewardClaimed: false,
  claimedRewards: [],
  userId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
};

interface GameContextType extends GameState {
  completePurchase: (items: { name: string; price: number; quantity: number }[], totalFake: number) => string;
  unlockAchievement: (id: string) => void;
  setNickname: (name: string) => void;
  setEmail: (email: string) => void;
  dismissToast: (id: string) => void;
  claimReward: (id: string, name: string) => void;
  nextLevel: { level: number; xpRequired: number; title: string; emoji: string } | null;
  xpProgress: number;
  latestOrderId: string | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dopamina-game');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save to localStorage (exclude toasts)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const { toasts, ...rest } = state;
      // Ensure userId exists
      if (!rest.userId) {
        rest.userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem('dopamina-game', JSON.stringify(rest));
    } catch {}
  }, [state, isLoaded]);

  // Sync to Supabase Leaderboard
  useEffect(() => {
    if (!isLoaded || !state.userId || state.xp === 0) return;

    const syncToSupabase = async () => {
      try {
        await supabase
          .from('leaderboard')
          .upsert({
            user_id: state.userId,
            nickname: state.nickname,
            level: state.level,
            xp: state.xp,
            total_spent: state.totalSpent,
            purchase_count: state.purchaseCount,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Failed to sync leaderboard:', err);
      }
    };

    const debounce = setTimeout(syncToSupabase, 2000);
    return () => clearTimeout(debounce);
  }, [
    state.xp,
    state.level,
    state.nickname,
    state.totalSpent,
    state.purchaseCount,
    state.userId,
    isLoaded
  ]);

  const nextLevel = getNextLevel(state.level);
  const currentLevelXP = gameData.levels.find(l => l.level === state.level)?.xpRequired || 0;
  const nextLevelXP = nextLevel?.xpRequired || currentLevelXP;
  const xpProgress = nextLevel
    ? ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  const completePurchase = useCallback((items: { name: string; price: number; quantity: number }[], totalFake: number) => {
    dispatch({ type: 'COMPLETE_PURCHASE', payload: { items, totalFake } });
    // Return the order ID that will be generated
    return 'DOP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }, []);

  const value: GameContextType = {
    ...state,
    completePurchase,
    unlockAchievement: (id) => dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id }),
    setNickname: (name) => dispatch({ type: 'SET_NICKNAME', payload: name }),
    setEmail: (email) => dispatch({ type: 'SET_EMAIL', payload: email }),
    dismissToast: (id) => dispatch({ type: 'DISMISS_TOAST', payload: id }),
    claimReward: (id, name) => dispatch({ type: 'CLAIM_REWARD', payload: { id, name } }),
    nextLevel,
    xpProgress,
    latestOrderId: state.orders[0]?.id || null,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
