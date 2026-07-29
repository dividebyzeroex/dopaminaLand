"use client";

import { Calculator, Sparkles } from "lucide-react";

interface CostPerUseCardProps {
  data: {
    cost_per_use_calc: {
      dailyCost30d: string;
      dailyCost365d: string;
      rationalityRating: string;
    };
  };
}

export default function CostPerUseCard({ data }: CostPerUseCardProps) {
  const calc = data.cost_per_use_calc;

  const isHighInvestment = calc.rationalityRating === "Alto Investimento";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Custo por Uso</h3>
          <p className="text-xs text-muted mt-0.5">Impacto financeiro diário</p>
        </div>
        <Calculator className="w-5 h-5 text-muted-light" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-surface-light p-4 text-center">
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-1">Em 30 dias</p>
          <p className="text-lg font-bold text-foreground">{calc.dailyCost30d.replace(' / dia', '')}</p>
          <p className="text-[10px] text-muted">/ dia</p>
        </div>
        <div className="rounded-xl bg-surface-light p-4 text-center">
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-1">Em 1 ano</p>
          <p className="text-lg font-bold text-foreground">{calc.dailyCost365d.replace(' / dia', '')}</p>
          <p className="text-[10px] text-muted">/ dia</p>
        </div>
      </div>

      <div className={`rounded-xl p-3 flex items-center justify-center gap-2 ${isHighInvestment ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">{calc.rationalityRating}</span>
      </div>
    </div>
  );
}
