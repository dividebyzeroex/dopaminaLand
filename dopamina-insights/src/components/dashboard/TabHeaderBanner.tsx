'use client';

interface TabHeaderBannerProps {
  icon: string;
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
      box: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      badge: 'border-orange-500/40 bg-orange-500/20 text-orange-400',
      gradient: 'from-slate-950 via-slate-900 to-orange-950/30 border-orange-500/30'
    },
    cyan: {
      box: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      badge: 'border-cyan-500/40 bg-cyan-500/20 text-cyan-400',
      gradient: 'from-slate-950 via-slate-900 to-cyan-950/30 border-cyan-500/30'
    },
    purple: {
      box: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      badge: 'border-purple-500/40 bg-purple-500/20 text-purple-400',
      gradient: 'from-slate-950 via-slate-900 to-purple-950/30 border-purple-500/30'
    },
    emerald: {
      box: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      badge: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400',
      gradient: 'from-slate-950 via-slate-900 to-emerald-950/30 border-emerald-500/30'
    },
    rose: {
      box: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
      badge: 'border-rose-500/40 bg-rose-500/20 text-rose-400',
      gradient: 'from-slate-950 via-slate-900 to-rose-950/30 border-rose-500/30'
    },
    amber: {
      box: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      badge: 'border-amber-500/40 bg-amber-500/20 text-amber-400',
      gradient: 'from-slate-950 via-slate-900 to-amber-950/30 border-amber-500/30'
    },
    blue: {
      box: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      badge: 'border-blue-500/40 bg-blue-500/20 text-blue-400',
      gradient: 'from-slate-950 via-slate-900 to-blue-950/30 border-blue-500/30'
    },
  };

  const style = colorStyles[badgeColor] || colorStyles.cyan;

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border bg-gradient-to-r p-6 md:p-8 shadow-md text-foreground mb-6 ${style.gradient}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-3xl shadow-inner ${style.box}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-foreground font-[var(--font-display)]">{title}</h1>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${style.badge}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              {badgeText}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {highlightLabel && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-border bg-surface-light px-4 py-2 text-right shadow-inner">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{highlightLabel}</span>
            <span className={`text-lg font-black ${highlightColor}`}>{highlightValue}</span>
          </div>
        </div>
      )}
    </div>
  );
}
