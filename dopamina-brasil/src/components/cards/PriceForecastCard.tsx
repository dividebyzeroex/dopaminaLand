"use client";

import { Clock, TrendingDown, CheckCircle } from "lucide-react";

interface PriceForecastCardProps {
  data: {
    future_price_prediction: {
      recommendation: string;
      daysToWait: number;
      predictedDropPercent: number;
      reason: string;
    };
    scraped_price: number;
  };
}

export default function PriceForecastCard({ data }: PriceForecastCardProps) {
  const forecast = data.future_price_prediction;
  const isBuyNow = forecast.daysToWait === 0;

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const predictedPrice = isBuyNow
    ? data.scraped_price
    : Math.round(data.scraped_price * (1 - forecast.predictedDropPercent / 100));

  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-1">Previsão de Preço</h3>
      <p className="text-xs text-muted mb-5">Baseado em padrões dos últimos 180 dias</p>

      {/* Recommendation Badge */}
      <div className={`rounded-xl p-4 mb-4 ${isBuyNow ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
        <div className="flex items-center gap-3">
          {isBuyNow ? (
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <Clock className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <p className={`text-base font-semibold ${isBuyNow ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isBuyNow ? 'Bom momento para comprar' : `Espere ${forecast.daysToWait} dias`}
            </p>
            <p className={`text-xs mt-0.5 ${isBuyNow ? 'text-emerald-600/70' : 'text-amber-600/70'}`}>
              {forecast.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Forecast Details */}
      {!isBuyNow && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Queda prevista</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              -{forecast.predictedDropPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Preço estimado</span>
            <span className="text-sm font-semibold text-foreground">{formatBRL(predictedPrice)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">Economia estimada</span>
            <span className="text-sm font-semibold text-emerald-600">{formatBRL(data.scraped_price - predictedPrice)}</span>
          </div>
        </div>
      )}

      {isBuyNow && (
        <div className="text-center py-2">
          <p className="text-xs text-muted">
            O preço atual está no menor nível recente. Não há previsão de queda adicional significativa.
          </p>
        </div>
      )}
    </div>
  );
}
