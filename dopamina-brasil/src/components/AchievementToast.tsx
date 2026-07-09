'use client';

import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export default function AchievementToast() {
  const { toasts, dismissToast } = useGame();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dismissToast(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.slice(0, 3).map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in flex items-center gap-3 rounded-2xl border border-magenta/30 bg-surface-light/95 px-5 py-4 shadow-[0_20px_60px_-15px_rgba(255,30,122,0.3)] backdrop-blur-xl max-w-sm"
        >
          <span className="text-3xl">{toast.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-foreground">{toast.title}</p>
            <p className="text-xs text-muted">{toast.description}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-muted hover:text-foreground transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
