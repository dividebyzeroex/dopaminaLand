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
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">Projeção Algorítmica</h3>
          <p className="text-xs text-muted">Baseado em padrões dos últimos 180 dias</p>
        </div>
        
        {/* Breathing Dot Indicator */}
        <div className="flex items-center gap-2 bg-black/5 rounded-full px-2.5 py-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sinal AI
          </span>
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isBuyNow ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isBuyNow ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </div>
        </div>
      </div>

      {/* Recommendation Badge */}
      <div className={`rounded-xl p-4 mb-4 ${isBuyNow ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
        <div className="flex items-center gap-3">
          {isBuyNow ? (
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" strokeWidth={1.5} />
          ) : (
            <Clock className="w-6 h-6 text-amber-600 shrink-0" strokeWidth={1.5} />
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
