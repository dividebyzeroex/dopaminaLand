"use client";

import { useState } from "react";
import { Product } from "@/types";
import { Zap, Heart, Share2, ShoppingBag, Eye, Flame } from "lucide-react";
import Image from "next/image";

interface MobileStoriesFeedProps {
  products: Product[];
  onQuickBuy: (product: Product) => void;
}

export default function MobileStoriesFeed({ products, onQuickBuy }: MobileStoriesFeedProps) {
  const [liked, setLiked] = useState<Record<string | number, boolean>>({});

  const toggleLike = (id: string | number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!products || products.length === 0) {
    return (
      <div className="h-[calc(100dvh-120px)] flex items-center justify-center text-gray-400 text-sm">
        Carregando Feed de Dopamina...
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-70px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white no-scrollbar">
      {products.slice(0, 10).map((product, idx) => {
        const title = product.name || product.shortName;
        const imageSrc = product.localImage || product.image || "⚡";
        const isEmoji = imageSrc.length < 5 && !imageSrc.includes("/");
        const isProductLiked = liked[product.id];

        return (
          <div
            key={product.id}
            className="snap-start w-full h-full relative flex flex-col justify-between p-6 pb-24 overflow-hidden border-b border-white/10"
          >
            {/* Ambient Lighting */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#ccff00]/10 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
            </div>

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  Gatilho #{idx + 1}: {product.badge || "Dopamina Extrema"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#ccff00] px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20">
                <Eye className="w-3.5 h-3.5" />
                <span>{1420 + idx * 340} vendo</span>
              </div>
            </div>

            {/* Main Product Visual */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(204,255,0,0.1)] overflow-hidden">
                {isEmoji ? (
                  <span className="text-8xl transform hover:scale-110 transition-transform duration-300">
                    {imageSrc}
                  </span>
                ) : (
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-contain p-4"
                  />
                )}
              </div>
            </div>

            {/* Right Side Action Dock */}
            <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-5">
              <button
                onClick={() => toggleLike(product.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-md transition-all active:scale-90 ${
                    isProductLiked
                      ? "bg-red-500/20 border-red-500 text-red-500"
                      : "bg-black/50 border-white/20 text-white"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isProductLiked ? "fill-current" : ""}`} />
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400">
                  {isProductLiked ? 1421 : 1420}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-black/50 border border-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400">Enviar</span>
              </button>
            </div>

            {/* Bottom Product Info & Instant Buy */}
            <div className="relative z-10 space-y-4 max-w-[80%]">
              <div>
                <span className="text-xs font-mono font-bold text-[#ccff00] block mb-1">
                  CATEGORIA: {product.category.toUpperCase()}
                </span>
                <h2 className="text-xl font-black font-outfit leading-tight text-white line-clamp-2">
                  {title}
                </h2>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black font-outfit text-[#ccff00]">
                  R$ 0,00
                </span>
                {!!product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <button
                onClick={() => onQuickBuy(product)}
                className="w-full py-3.5 bg-[#ccff00] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(204,255,0,0.5)] active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>COMPRAR AGORA (1-TAP)</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
