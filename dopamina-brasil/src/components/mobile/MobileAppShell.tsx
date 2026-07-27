"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import MobileBottomNav from "./MobileBottomNav";
import MobileStoriesFeed from "./MobileStoriesFeed";
import MobileQuickBuySheet from "./MobileQuickBuySheet";
import LiveWebAnalyzer from "@/components/LiveWebAnalyzer";
import TrendingProductsShowcase from "@/components/TrendingProductsShowcase";
import ProductIntelligenceSuite from "@/components/ProductIntelligenceSuite";
import DopaminaTerminal from "@/components/DopaminaTerminal";
import ForensicReplay from "@/components/ForensicReplay";
import PricePredator from "@/components/PricePredator";
import LivePriceSeismograph from "@/components/LivePriceSeismograph";
import PriceWarArena from "@/components/PriceWarArena";
import DarkPatternRadar from "@/components/DarkPatternRadar";
import NeuralNetworkVisualizer from "@/components/NeuralNetworkVisualizer";
import { Zap, Flame, ShoppingBag, Trophy, ShieldAlert, Sparkles, BarChart3, Brain, Store } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface MobileAppShellProps {
  products: Product[];
  flashDeals?: Product[];
}

export default function MobileAppShell({ products, flashDeals = [] }: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<"home" | "analyzer" | "insights" | "feed" | "cart" | "ranking">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [dopamineScore, setDopamineScore] = useState(1450);
  const [mobileInsights, setMobileInsights] = useState<any>(null);

  useEffect(() => {
    fetch("/api/insights-summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMobileInsights(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenQuickBuy = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickBuyOpen(true);
  };

  const handleConfirmBuy = (product: Product) => {
    setCartItems((prev) => [...prev, product]);
    setDopamineScore((prev) => prev + 500);
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="fixed inset-0 z-[9900] bg-[#050505] text-white flex flex-col font-inter overflow-hidden md:hidden">
      {/* Top Mobile App Bar */}
      <header className="h-14 px-4 bg-[#0a0a0f]/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#ccff00] p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[#ccff00]">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="font-black font-outfit text-sm tracking-wider text-white">
            DOPAMINA <span className="text-[#ccff00]">APP</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-mono font-bold">
            ⚡ {dopamineScore} DP
          </span>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "home" && (
          <div className="p-4 space-y-6">
            {/* Mobile Hero Protection Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#22c55e]/20 via-[#0a0a0f] to-[#f97316]/20 border border-white/10 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 font-mono text-[9px] font-extrabold uppercase">
                  PROTEÇÃO ANTI-BLACKFRAUDE MOBILE
                </span>
                <h2 className="text-xl font-black font-outfit text-white">
                  NÃO PAGUE A METADE DO DOBRO
                </h2>
                <p className="text-xs text-gray-400">
                  Cole o link de qualquer e-commerce abaixo para auditar a curva real de preços mês a mês direto pelo celular.
                </p>
              </div>
            </div>

            {/* Mobile Live Web Analyzer */}
            <LiveWebAnalyzer />

            {/* Mobile Live Trends Carousel */}
            <TrendingProductsShowcase />

            {/* Mobile 5-Engine Intelligence Suite */}
            <ProductIntelligenceSuite />

            {/* Mobile Dopamina Terminal */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#22c55e]" />
                Dopamina Terminal
              </h3>
              <DopaminaTerminal />
            </div>

            {/* Mobile Forensic Replay */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-red-500" />
                Forensic Replay
              </h3>
              <ForensicReplay />
            </div>

            {/* Mobile Price Predator */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#22c55e]" />
                Price Predator
              </h3>
              <PricePredator />
            </div>

            {/* Mobile Seismograph */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-amber-500" />
                Sismógrafo de Preços
              </h3>
              <LivePriceSeismograph />
            </div>

            {/* Mobile Dark Pattern Radar */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-red-500" />
                Dark Pattern Radar
              </h3>
              <DarkPatternRadar />
            </div>

            {/* Mobile Price War Arena */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-purple-500" />
                Price War Arena
              </h3>
              <PriceWarArena />
            </div>

            {/* Mobile Neural Network */}
            <div className="space-y-2">
              <h3 className="text-sm font-black font-outfit text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-purple-400" />
                Neural Network H53
              </h3>
              <NeuralNetworkVisualizer />
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  Ofertas em Destaque
                </h3>
                <span className="text-xs text-[#ccff00] font-mono">100% GRÁTIS</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 8).map((product) => (
                  <div key={product.id} onClick={() => handleOpenQuickBuy(product)}>
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analyzer" && (
          <div className="p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-black to-red-900/20 border border-white/10 space-y-1">
              <h2 className="text-lg font-black font-outfit text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Auditoria de Preço Mês a Mês</span>
              </h2>
              <p className="text-xs text-gray-400">
                Cole a URL de um e-commerce para verificar a curva temporal de preço e identificar falsos descontos.
              </p>
            </div>

            <LiveWebAnalyzer />
          </div>
        )}

        {/* Dedicated Mobile Insights Dashboard */}
        {activeTab === "insights" && (
          <div className="p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-black to-purple-950/40 border border-orange-500/30 space-y-1">
              <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                H53 DATA AGENCY TELEMETRY
              </span>
              <h2 className="text-lg font-black font-outfit text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-400" />
                <span>Insights Mobile ao Vivo</span>
              </h2>
              <p className="text-xs text-gray-400">
                Acompanhe as métricas de telemetria da rede neural H5 e auditorias de e-commerce direto do seu celular.
              </p>
            </div>

            {mobileInsights && (
              <div className="space-y-4 text-xs">
                {/* AI Model Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold font-mono text-[10px] uppercase flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" />
                      IA NEURAL {mobileInsights.neural_model?.name}
                    </span>
                    <span className="text-[#22c55e] font-mono font-bold text-[10px]">
                      {mobileInsights.neural_model?.accuracy_percentage} ACURÁCIA
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Pesquisas Hoje</span>
                      <strong className="text-white text-xs">+{mobileInsights.neural_model?.total_inferences_today}</strong>
                    </div>
                    <div className="bg-black/50 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 block">Economia Gerada</span>
                      <strong className="text-[#22c55e] text-xs">{formatBRL(mobileInsights.neural_model?.total_savings_generated_brl || 0)}</strong>
                    </div>
                  </div>
                </div>

                {/* Vector Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <span className="text-[9px] text-purple-300 block">Bots Barrados</span>
                    <strong className="text-purple-400 text-sm">{mobileInsights.vector_engines_captured?.bot_reviews_flagged_count}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30">
                    <span className="text-[9px] text-[#22c55e] block">Cupons Resgatados</span>
                    <strong className="text-[#22c55e] text-sm">{formatBRL(mobileInsights.vector_engines_captured?.valid_coupons_redeemed_value_brl || 0)}</strong>
                  </div>
                </div>

                {/* Active Coupons Grid */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 block">
                    🏷️ Cupons Ativos Mapeados nas Lojas:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {mobileInsights.vector_engines_captured?.top_active_coupons?.map((c: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px]">
                        <span className="text-gray-400 block truncate">{c.store}</span>
                        <strong className="text-amber-400 font-mono">{c.code}</strong>
                        <span className="text-[#22c55e] block font-bold">{c.discount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Retailer Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-outfit uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-blue-400" />
                    Divisão de Auditoria por Loja
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {mobileInsights.retailers_breakdown?.map((ret: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-white text-xs truncate">{ret.store}</strong>
                          <span className="text-[10px] text-orange-400 font-bold font-mono">{ret.share}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 block">{ret.volume} auditorias</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "feed" && (
          <MobileStoriesFeed
            products={products}
            onQuickBuy={handleOpenQuickBuy}
          />
        )}

        {activeTab === "cart" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold font-outfit">Meu Carrinho ({cartItems.length})</h2>
              <span className="text-xs font-mono text-[#ccff00]">TOTAL: R$ 0,00</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center space-y-3 text-gray-500">
                <ShoppingBag className="w-12 h-12 stroke-1" />
                <p className="text-sm">Seu carrinho mobile está vazio.</p>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-6 py-2.5 bg-[#ccff00] text-[#050505] font-bold text-xs uppercase tracking-widest rounded-xl"
                >
                  Ir para o Dopamina Feed
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.shortName || item.name}</h4>
                      <span className="text-xs text-[#ccff00] font-mono">R$ 0,00</span>
                    </div>
                    <span className="text-xs font-bold text-[#ccff00] px-2 py-1 bg-[#ccff00]/10 rounded">
                      +500 DP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ranking" && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#ccff00]" />
              <span>Ranking de Dopamina [Top 5]</span>
            </h2>
            <div className="space-y-2">
              {[
                { rank: "🥇 #1", name: "Cleiton_VIP", score: "48,500 DP" },
                { rank: "🥈 #2", name: "CyberUser_99", score: "34,200 DP" },
                { rank: "🥉 #3", name: "DopaminaKing", score: "28,100 DP" },
                { rank: "4 #4", name: "ZeroFatura", score: "19,400 DP" },
                { rank: "5 #5", name: "Você", score: `${dopamineScore} DP`, isUser: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-sm ${
                    row.isUser
                      ? "bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]"
                      : "bg-white/5 border-white/10 text-white"
                  }`}
                >
                  <span className="font-bold font-mono">{row.rank}</span>
                  <span className="font-semibold">{row.name}</span>
                  <span className="font-mono text-xs text-gray-400">{row.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cartItems.length}
      />

      {/* Quick Buy Bottom Sheet */}
      <MobileQuickBuySheet
        product={selectedProduct}
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        onConfirmBuy={handleConfirmBuy}
      />
    </div>
  );
}
