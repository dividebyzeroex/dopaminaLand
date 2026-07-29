"use client";

import { ShieldCheck, AlertTriangle, ExternalLink, TrendingDown } from "lucide-react";

interface PriceOverviewCardProps {
  data: {
    scraped_name: string;
    current_price: number;
    scraped_price: number;
    savings: number;
    overpriced_percent: number;
    is_fomo_alert: boolean;
    url?: string;
    message?: string;
  };
}

export default function PriceOverviewCard({ data }: PriceOverviewCardProps) {
  const isFair = !data.is_fomo_alert;
  const savingsPercent = data.current_price > 0
    ? Math.round((data.savings / data.current_price) * 100)
    : 0;

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        {/* Left: Price Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            {isFair ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-semibold">Preço Justo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">Sobrepreço de {data.overpriced_percent}%</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted mb-1">Melhor preço encontrado</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {formatBRL(data.scraped_price)}
              </p>
            </div>

            {data.savings > 0 && (
              <div>
                <p className="text-xs text-muted mb-1">Preço na loja</p>
                <p className="text-lg text-muted line-through">
                  {formatBRL(data.current_price)}
                </p>
              </div>
            )}
          </div>

          {data.savings > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Economia de {formatBRL(data.savings)} ({savingsPercent}%)
              </span>
            </div>
          )}
        </div>

        {/* Right: Savings Visual */}
        <div className="flex flex-col items-end gap-3">
          {data.savings > 0 && (
            <div className="w-48">
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>Melhor preço</span>
                <span>Preço loja</span>
              </div>
              <div className="h-2.5 bg-surface-lighter rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (data.scraped_price / data.current_price) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1.5 transition"
            >
              Ver no Buscapé
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
