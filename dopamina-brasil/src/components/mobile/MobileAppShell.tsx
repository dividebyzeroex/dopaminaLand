"use client";

import { useState } from "react";
import { Product } from "@/types";
import MobileBottomNav from "./MobileBottomNav";
import MobileStoriesFeed from "./MobileStoriesFeed";
import MobileQuickBuySheet from "./MobileQuickBuySheet";
import { Zap, Flame, ShoppingBag, Search, Sparkles, Trophy, ShieldCheck } from "lucide-react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

interface MobileAppShellProps {
  products: Product[];
  flashDeals?: Product[];
}

export default function MobileAppShell({ products, flashDeals = [] }: MobileAppShellProps) {
  const [activeTab, setActiveTab] = useState<"home" | "feed" | "cart" | "ranking" | "profile">("home");
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
            {/* Mobile Banner */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-black to-[#ccff00]/10 border border-[#ccff00]/20 overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest px-2 py-0.5 rounded bg-[#ccff00]/20">
                  MODO MOBILE ATIVADO
                </span>
                <h2 className="text-xl font-black font-outfit text-white">
                  COMPRAS ZERO REAIS
                </h2>
                <p className="text-xs text-gray-400">
                  Toque nos produtos para obter prazer imediato sem fatura no cartão.
                </p>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="space-y-3">
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

        {activeTab === "profile" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#ccff00] p-1">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl">
                  ⚡
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit">Comprador Dopaminado</h3>
                <p className="text-xs text-gray-400 font-mono">ID: #8942-BR</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Pontos DP</span>
                <span className="text-2xl font-black font-outfit text-[#ccff00]">{dopamineScore}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider block">Compras R$0</span>
                <span className="text-2xl font-black font-outfit text-purple-400">{cartItems.length}</span>
              </div>
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
