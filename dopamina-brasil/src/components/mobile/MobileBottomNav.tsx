"use client";

import { Home, Zap, ShoppingBag, Trophy, ShieldAlert, BarChart3 } from "lucide-react";
import { mobileEffects } from "@/lib/mobileEffects";

interface MobileBottomNavProps {
  activeTab: "home" | "analyzer" | "insights" | "feed" | "cart" | "ranking";
  onTabChange: (tab: "home" | "analyzer" | "insights" | "feed" | "cart" | "ranking") => void;
  cartCount: number;
}

interface TabItem {
  id: "home" | "analyzer" | "insights" | "feed" | "cart" | "ranking";
  label: string;
  icon: any;
  isSpecial?: boolean;
  badge?: number;
}

export default function MobileBottomNav({ activeTab, onTabChange, cartCount }: MobileBottomNavProps) {
  const tabs: TabItem[] = [
    { id: "home", label: "Início", icon: Home },
    { id: "analyzer", label: "Analisar", icon: ShieldAlert },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "feed", label: "Dopamina", icon: Zap, isSpecial: true },
    { id: "cart", label: "Carrinho", icon: ShoppingBag, badge: cartCount },
    { id: "ranking", label: "Ranking", icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0a0f]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  mobileEffects.trigger("dopamine");
                  onTabChange(tab.id);
                }}
                className="relative -top-4 flex flex-col items-center justify-center focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#ccff00] p-0.5 shadow-[0_0_20px_rgba(204,255,0,0.5)] active:scale-90 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center text-[#ccff00]">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#ccff00] mt-0.5 tracking-wider uppercase">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                mobileEffects.trigger("tab");
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center py-1 px-2.5 transition-colors active:scale-90 ${
                isActive ? "text-[#ccff00]" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {!!tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#ccff00] text-black text-[9px] font-black flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-tight mt-1">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#ccff00]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
