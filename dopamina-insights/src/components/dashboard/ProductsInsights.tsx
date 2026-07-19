import { Search, ShoppingCart, TrendingDown, Package } from 'lucide-react';

export default function ProductsInsights({ ecommerceInsights }: { ecommerceInsights: any }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Search className="h-4 w-4 text-muted" /> Buscas com Intenção (Search Signals)
          </h3>
          {ecommerceInsights.searchTerms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ecommerceInsights.searchTerms.map((term: any, i: number) => (
                <span key={i} className="inline-flex items-center gap-2 rounded border border-border bg-surface px-3 py-1.5 text-xs">
                  <span className="font-medium text-foreground">{term.name}</span>
                  <span className="text-muted">{term.value}x</span>
                </span>
              ))}
            </div>
          ) : <p className="text-sm text-muted">Nenhuma busca registrada ainda.</p>}
        </div>

        <div className="rounded-xl border border-border bg-surface-light p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShoppingCart className="h-4 w-4 text-muted" /> Combinação de Interesses (Cesta)
          </h3>
          {ecommerceInsights.boughtTogether.length > 0 ? (
            <div className="space-y-3">
              {ecommerceInsights.boughtTogether.map((pair: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                  <span className="text-sm font-medium text-foreground">{pair.name}</span>
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{pair.value} vezes</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted">Nenhum padrão de cesta identificado.</p>}
        </div>
      </div>

      {/* Carrinhos Abandonados */}
      <div className="rounded-xl border border-border bg-surface-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingDown className="h-4 w-4 text-muted" /> Perda de Interesse / Drop-off no Carrinho
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Data</th>
                <th className="py-3 px-6 font-medium text-xs">Sessão ID</th>
                <th className="py-3 px-6 font-medium text-xs">Valor do Interesse (Fake)</th>
                <th className="py-3 px-6 font-medium text-xs">Itens Abandonados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ecommerceInsights.abandonedCarts.map((cart: any, i: number) => (
                <tr key={i} className="transition hover:bg-surface">
                  <td className="py-3 px-6 text-foreground">{cart.date}</td>
                  <td className="py-3 px-6 text-muted"><code className="rounded bg-surface px-1.5 py-0.5 text-xs font-mono">{cart.sid.split('-')[0]}</code></td>
                  <td className="py-3 px-6 font-medium text-primary">R$ {cart.value.toFixed(2)}</td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col gap-1">
                      {cart.items.map((item: any, j: number) => (
                        <span key={j} className="text-xs text-muted">• {item.qty}x {item.name}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {ecommerceInsights.abandonedCarts.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted">Nenhum abandono registrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funil de Produtos */}
      <div className="rounded-xl border border-border bg-surface-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="h-4 w-4 text-muted" /> Sinais de Interesse por Produto
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50">
              <tr className="border-b border-border text-muted">
                <th className="py-3 px-6 font-medium text-xs">Produto</th>
                <th className="py-3 px-6 font-medium text-center text-xs">Visualizações</th>
                <th className="py-3 px-6 font-medium text-center text-xs">Adições ao Carrinho</th>
                <th className="py-3 px-6 font-medium text-right text-xs">Valor Total Estimado (Fake)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ecommerceInsights.topProducts.map((p: any, i: number) => (
                <tr key={i} className="transition hover:bg-surface">
                  <td className="py-3 px-6 text-foreground max-w-[250px] truncate" title={p.name}>{p.name}</td>
                  <td className="py-3 px-6 text-center text-muted">{p.views}</td>
                  <td className="py-3 px-6 text-center text-muted">{p.carts}</td>
                  <td className="py-3 px-6 text-right font-medium text-primary">R$ {p.rev.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
