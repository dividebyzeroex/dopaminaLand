"use client";

import { ArrowDown, Tag, CreditCard, Percent, Gift } from "lucide-react";

interface NetPriceCardProps {
  data: {
    net_price_breakdown: {
      storePrice: number;
      bestMarketPrice: number;
      suggestedCoupon: string;
      couponDiscountPercent: number;
      storeName: string;
      pixPrice: number;
      cashbackAmount: number;
      finalNetPrice: number;
    };
  };
}

export default function NetPriceCard({ data }: NetPriceCardProps) {
  const b = data.net_price_breakdown;

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const steps = [
    {
      icon: CreditCard,
      label: "Melhor preço de mercado",
      value: formatBRL(b.bestMarketPrice),
      color: "text-foreground",
      bg: "bg-surface-light",
    },
    {
      icon: Percent,
      label: "Desconto Pix (10%)",
      value: formatBRL(b.pixPrice),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Tag,
      label: `Cupom ${b.suggestedCoupon}`,
      value: `-${b.couponDiscountPercent}%`,
      color: "text-purple-600",
      bg: "bg-purple-50",
      subtitle: b.storeName,
    },
    {
      icon: Gift,
      label: "Cashback estimado",
      value: `-${formatBRL(b.cashbackAmount)}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-full">
      <h3 className="text-sm font-semibold text-foreground mb-1">Melhor Preço Net</h3>
      <p className="text-xs text-muted mb-5">Combinando todas as economias possíveis</p>

      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i}>
              <div className="flex items-center gap-3 py-3">
                <div className={`w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{step.label}</p>
                  {step.subtitle && (
                    <p className="text-xs text-muted">{step.subtitle}</p>
                  )}
                </div>
                <span className={`text-sm font-semibold ${step.color} shrink-0`}>{step.value}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-3.5 h-3.5 text-muted-light" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Price */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Preço Net Final</span>
          <span className="text-2xl font-bold text-emerald-600">{formatBRL(b.finalNetPrice)}</span>
        </div>
        <p className="text-xs text-muted mt-1">
          Economia total de {formatBRL(b.storePrice - b.finalNetPrice)} vs preço da loja
        </p>
      </div>
    </div>
  );
}
