"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Flaw {
  title: string;
  severity: "high" | "medium" | "low";
  frequency: number;
  description: string;
  source: string;
}

interface ProductFlawsCardProps {
  data: {
    product_flaws: Flaw[];
  };
}

export default function ProductFlawsCard({ data }: ProductFlawsCardProps) {
  const flaws = data.product_flaws || [];

  if (flaws.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-1">Defeitos Conhecidos</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted">
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-sm">Nenhum defeito relevante encontrado.</p>
        </div>
      </div>
    );
  }

  const severityConfig = {
    high: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", label: "Alto" },
    medium: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", label: "Médio" },
    low: { dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700", label: "Baixo" },
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Defeitos Conhecidos</h3>
          <p className="text-xs text-muted mt-0.5">Relatos de consumidores e fóruns</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <AlertTriangle className="w-3.5 h-3.5" />
          {flaws.length} {flaws.length === 1 ? 'relato' : 'relatos'}
        </div>
      </div>

      <div className="space-y-3">
        {flaws.map((flaw, i) => {
          const config = severityConfig[flaw.severity] || severityConfig.low;
          return (
            <div key={i} className={`rounded-xl ${config.bg} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${config.dot} mt-1.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold ${config.text}`}>{flaw.title}</p>
                    <span className={`text-[10px] font-medium ${config.text} px-2 py-0.5 rounded-full bg-white/60 shrink-0`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">{flaw.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {flaw.source}
                    </span>
                    <span className="text-[10px] font-medium text-muted">
                      {flaw.frequency}% dos relatos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
