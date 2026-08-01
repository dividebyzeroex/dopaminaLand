import { ArrowRight, Tag, Search, ShoppingBag } from "lucide-react";

interface Alternative {
  name: string;
  price: number;
  link: string;
  image?: string;
  // Mocks for UI that would come from API:
  installments?: number;
  cashbackPct?: number;
  storeName?: string;
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
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-10 flex flex-col items-center justify-center text-center">
        <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Nenhuma outra loja encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">Não encontramos esse produto em outros marketplaces no momento.</p>
      </div>
    );
  }

  // Sort by price to guarantee the cheapest is first
  const sorted = [...alternatives].sort((a, b) => a.price - b.price);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground font-[var(--font-display)] flex items-center gap-2">
          Compare preços em {sorted.length} lojas
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1">
            <Tag className="w-3 h-3" /> calcular frete
          </span>
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ordenar por</span>
          <select className="border border-[#e2e8f0] rounded-md px-3 py-1.5 bg-white font-medium outline-none focus:border-black cursor-pointer">
            <option>Menor preço com cashback</option>
            <option>Menor preço</option>
            <option>Maior desconto</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((alt, i) => {
          const isLowest = i === 0;
          
          // Fallback mocks if API doesn't have these fields yet
          const storeName = alt.storeName || (alt.link.includes('mercadolivre') ? 'Mercado Livre' : alt.link.includes('amazon') ? 'Amazon' : alt.link.includes('magazineluiza') ? 'Magazine Luiza' : 'Loja Parceira');
          const installments = alt.installments || 10;
          const installmentValue = alt.price / installments;
          const cashbackPct = alt.cashbackPct || (isLowest ? 1 : 0.5);
          const cashbackValue = alt.price * (cashbackPct / 100);

          return (
            <div 
              key={i} 
              className={`relative bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
                isLowest ? 'border-[1.5px] border-[#00C853]' : 'border border-[#e2e8f0]'
              }`}
            >
              {isLowest && (
                <div className="absolute -top-[1.5px] -left-[1.5px] bg-[#00C853] text-white text-[11px] font-bold px-3 py-0.5 rounded-tl-xl rounded-br-lg z-10">
                  Menor preço
                </div>
              )}

              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                {/* Left: Product Thumb & Prices */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-2">
                    {alt.image ? (
                      <img src={alt.image} alt={alt.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground tracking-tight">{formatBRL(alt.price)}</span>
                      <span className="text-xs font-semibold text-muted-foreground">à vista</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-0.5">
                      ou {installments}x de {formatBRL(installmentValue)}
                    </span>
                    
                    {/* Cashback Badge */}
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md w-fit">
                      <div className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[9px]">
                        b
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        {cashbackPct}% na loja toda • <span className="font-bold">{formatBRL(cashbackValue)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Store & CTA */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 mt-4 sm:mt-0 border-t sm:border-t-0 border-[#e2e8f0] pt-4 sm:pt-0">
                  
                  {/* Store Info */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-foreground">{storeName}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      {storeName.charAt(0)}
                    </div>
                  </div>

                  {/* CTA */}
                  <a 
                    href={alt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-black hover:bg-black/90 text-white font-bold text-sm px-8 py-3 rounded-lg transition-colors focus:ring-4 focus:ring-black/10"
                  >
                    Ir à loja
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
