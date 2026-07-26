"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types";
import { X, Zap, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";

interface MobileQuickBuySheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBuy: (product: Product) => void;
}

export default function MobileQuickBuySheet({ product, isOpen, onClose, onConfirmBuy }: MobileQuickBuySheetProps) {
  if (!isOpen || !product) return null;

  const title = product.name || product.shortName;
  const imageSrc = product.localImage || product.image || "⚡";
  const isEmoji = imageSrc.length < 5 && !imageSrc.includes("/");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/80 backdrop-blur-sm md:hidden">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-full bg-[#0a0a0f] border-t border-white/10 rounded-t-3xl p-6 pb-10 text-white shadow-2xl"
        >
          {/* Handle bar */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
              {isEmoji ? (
                <span className="text-4xl">{imageSrc}</span>
              ) : (
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#ccff00] uppercase tracking-wider px-2 py-0.5 rounded bg-[#ccff00]/10 border border-[#ccff00]/20">
                {product.badge || "OFERTA RESTRITA"}
              </span>
              <h3 className="text-base font-bold font-outfit text-white mt-1 line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-black text-[#ccff00] font-outfit">
                  R$ 0,00
                </span>
                {!!product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dopamina reward box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#a855f7]/10 to-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ccff00] animate-bounce" />
              <span className="text-xs font-bold text-gray-200">Recompensa de Dopamina:</span>
            </div>
            <span className="text-xs font-black text-[#ccff00] font-mono">+500 XP</span>
          </div>

          <button
            onClick={() => {
              onConfirmBuy(product);
              onClose();
            }}
            className="w-full py-4 bg-gradient-to-r from-[#ccff00] to-[#22c55e] text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(204,255,0,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span>COMPRAR AGORA (R$ 0,00)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
