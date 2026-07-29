"use client";

import { ShoppingCart, ExternalLink, Tag } from "lucide-react";

interface Alternative {
  name: string;
  price: number;
  link: string;
}

interface MarketAlternativesCardProps {
  data: {
    market_alternatives?: Alternative[];
  };
}

export default function MarketAlternativesCard({ data }: MarketAlternativesCardProps) {
  const alternatives = data.market_alternatives || [];

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (alternatives.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-1">Alternativas de Mercado</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted">
          <Tag className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-sm">Nenhuma alternativa mapeada no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Alternativas de Mercado</h3>
          <p className="text-xs text-muted mt-0.5">Opções com melhor custo-benefício encontradas</p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 shrink-0">
          <ShoppingCart className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {alternatives.slice(0, 3).map((alt, i) => (
          <a
            key={i}
            href={alt.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-surface-light hover:border-primary/30 transition-colors"
          >
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {alt.name}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black text-foreground">
                {formatBRL(alt.price)}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
