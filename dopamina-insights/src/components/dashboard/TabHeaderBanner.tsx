'use client';

import { ReactNode } from 'react';

interface TabHeaderBannerProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor?: 'orange' | 'cyan' | 'purple' | 'emerald' | 'rose' | 'amber' | 'blue';
  highlightLabel?: string;
  highlightValue?: string | number;
  highlightColor?: string;
}

export function TabHeaderBanner({
  icon,
  title,
  subtitle,
  badgeText,
  badgeColor = 'cyan',
  highlightLabel,
  highlightValue,
  highlightColor = 'text-emerald-400'
}: TabHeaderBannerProps) {
  const colorStyles = {
    orange: {
      box: 'border-orange-500/50 bg-orange-900/20 text-orange-400',
      badge: 'border-orange-500 bg-orange-500/10 text-orange-400',
      borderTop: 'border-t-orange-500'
    },
    cyan: {
      box: 'border-cyan-500/50 bg-cyan-900/20 text-cyan-400',
      badge: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
      borderTop: 'border-t-cyan-500'
    },
    purple: {
      box: 'border-purple-500/50 bg-purple-900/20 text-purple-400',
      badge: 'border-purple-500 bg-purple-500/10 text-purple-400',
      borderTop: 'border-t-purple-500'
    },
    emerald: {
      box: 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400',
      badge: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
      borderTop: 'border-t-emerald-500'
    },
    rose: {
      box: 'border-rose-500/50 bg-rose-900/20 text-rose-400',
      badge: 'border-rose-500 bg-rose-500/10 text-rose-400',
      borderTop: 'border-t-rose-500'
    },
    amber: {
      box: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
      badge: 'border-amber-500 bg-amber-500/10 text-amber-400',
      borderTop: 'border-t-amber-500'
    },
    blue: {
      box: 'border-blue-500/50 bg-blue-900/20 text-blue-400',
      badge: 'border-blue-500 bg-blue-500/10 text-blue-400',
      borderTop: 'border-t-blue-500'
    },
  };

  const style = colorStyles[badgeColor] || colorStyles.cyan;

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm border border-[#2a2e37] border-t-[3px] bg-[#181b1f] p-4 md:p-6 shadow-none text-foreground mb-4 ${style.borderTop}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${style.box}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-lg font-mono font-bold tracking-wider text-[#e4e4e7] uppercase">{title}</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${style.badge}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              {badgeText}
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-wider">{subtitle}</p>
        </div>
      </div>

      {highlightLabel && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-sm border border-[#2a2e37] bg-[#111217] px-4 py-2 text-right shadow-none">
            <span className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">{highlightLabel}</span>
            <span className={`text-xl font-mono font-bold ${highlightColor}`}>{highlightValue}</span>
          </div>
        </div>
      )}
    </div>
  );
}
