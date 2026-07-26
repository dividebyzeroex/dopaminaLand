'use client';

import { useState, useEffect } from 'react';
import { useDaily } from '@/contexts/DailyContext';
import { useGame } from '@/contexts/GameContext';

export default function DailyModal() {
  const { streak, streakEmoji, hasClaimedToday, todayChallenges, multiplier, claimDailyBonus } = useDaily();
  const { xp } = useGame();
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    if (hasClaimedToday) return;

    // Check if user already dismissed or closed the daily bonus modal today
    try {
      const todayStr = new Date().toDateString();
      const dismissedToday = localStorage.getItem('dopamina-daily-dismissed-date');
      if (dismissedToday === todayStr) return;
    } catch (e) {}

    // Delay after page load
    const timer = setTimeout(() => {
      try {
        if (window.self !== window.top) return; // Hide in iframes (e.g., Insights heatmap)
        const introSeen = localStorage.getItem('dopamina-intro-seen');
        if (introSeen) setShow(true);
      } catch {
        if (window.self === window.top) setShow(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [hasClaimedToday]);

  const handleDismiss = () => {
    setShow(false);
    try {
      const todayStr = new Date().toDateString();
      localStorage.setItem('dopamina-daily-dismissed-date', todayStr);
    } catch (e) {}
  };

  const handleClaim = () => {
    const gained = claimDailyBonus();
    setXpGained(gained);
    setClaimed(true);
    // Store dismissal so it doesn't prompt again today
    try {
      const todayStr = new Date().toDateString();
      localStorage.setItem('dopamina-daily-dismissed-date', todayStr);
    } catch (e) {}
    // Close after a moment
    setTimeout(() => setShow(false), 2000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm mx-4 rounded-3xl border border-neon/20 bg-card p-8 shadow-2xl animate-slide-up overflow-hidden">
        {/* Glow bg */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-pop/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-neon/10 blur-3xl" />

        <div className="relative z-10">
          {/* Streak */}
          <div className="text-center mb-6">
            <div className="text-5xl animate-fire mb-2">{streakEmoji}</div>
            <p className="text-xs font-black uppercase tracking-widest text-pop">Streak de {streak} dia{streak > 1 ? 's' : ''}</p>
            <p className="text-foreground font-[var(--font-display)] text-2xl font-black mt-1">
              Bônus Diário
            </p>
            {multiplier > 1 && (
              <span className="inline-block mt-1 rounded-full bg-pop/20 border border-pop/30 px-3 py-1 text-[10px] font-black text-pop">
                MULTIPLICADOR {multiplier}x ⚡
              </span>
            )}
          </div>

          {/* Daily Challenges */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Desafios de hoje</p>
            {todayChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                  challenge.completed
                    ? 'border-neon/30 bg-neon/5'
                    : 'border-border bg-surface'
                }`}
              >
                <span className="text-xl shrink-0">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${challenge.completed ? 'text-neon line-through' : 'text-foreground'}`}>
                    {challenge.description}
                  </p>
                </div>
                <span className={`text-xs font-extrabold shrink-0 ${challenge.completed ? 'text-neon' : 'text-pop'}`}>
                  {challenge.completed ? '✓' : `+${Math.floor(challenge.xpReward * multiplier)}`}
                </span>
              </div>
            ))}
          </div>

          {/* Claim button */}
          {claimed ? (
            <div className="text-center animate-slide-up">
              <p className="text-neon font-[var(--font-display)] text-3xl font-black">+{xpGained} XP</p>
              <p className="text-sm text-muted mt-1">Coletado! Volte amanhã.</p>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full rounded-2xl bg-neon py-4 text-base font-extrabold text-background transition hover:bg-neon-light active:scale-[0.98] animate-pulse-glow"
            >
              Coletar Bônus Diário ⚡
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="mt-3 w-full text-center text-xs text-muted hover:text-foreground transition"
          >
            fechar
          </button>
        </div>
      </div>
    </div>
  );
}
