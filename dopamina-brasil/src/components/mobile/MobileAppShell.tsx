"use client";

import { useState } from "react";
import { Product } from "@/types";
import MobileBottomNav from "./MobileBottomNav";
import MobileStoriesFeed from "./MobileStoriesFeed";
import MobileQuickBuySheet from "./MobileQuickBuySheet";
import LiveWebAnalyzer from "@/components/LiveWebAnalyzer";
import { Zap, Flame, ShoppingBag, Trophy, ShieldAlert, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface MobileAppShellProps {
  products: Product[];
  flashDeals?: Product[];
}

export default function MobileAppShell({ products, flashDeals = [] }: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<"home" | "analyzer" | "feed" | "cart" | "ranking">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [dopamineScore, setDopamineScore] = useState(1450);

  const handleOpenQuickBuy = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickBuyOpen(true);
  };

  const handleConfirmBuy = (product: Product) => {
    setCartItems((prev) => [...prev, product]);
    setDopamineScore((prev) => prev + 500);
  };

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

        {/* Dopamina Balance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-mono font-bold text-xs">
          <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-orange-400" />
          <span>{dopamineScore.toLocaleString()} DP</span>
        </div>
      </header>

      {/* Dynamic Content Area based on Tab */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "home" && (
          <div className="p-4 space-y-6">
            {/* Anti-BlackFraude Banner */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-red-950/50 via-black to-[#ccff00]/10 border border-red-500/30 overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/20 flex items-center gap-1 w-max">
                  <ShieldAlert className="w-3 h-3" />
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

            {/* Mobile Live Web Analyzer with Dynamic Price Chart */}
            <LiveWebAnalyzer />

            {/* Mobile Grid */}
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
