"use client";

import { useState } from "react";
import SuperSearchHero from "@/components/SuperSearchHero";
import TrendingProductsShowcase from "@/components/TrendingProductsShowcase";
import { Search, Compass, BarChart3 } from "lucide-react";

export default function MobileAppShell() {
  const [activeTab, setActiveTab] = useState<"search" | "trending">("search");

  return (
    <div className="fixed inset-0 z-[9900] bg-background text-foreground flex flex-col font-inter overflow-hidden md:hidden">
      {/* Top Mobile App Bar */}
      <header className="h-14 px-4 bg-white/80 border-b border-border backdrop-blur-xl flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold font-[var(--font-display)] text-base tracking-tight text-foreground">
            dopamina
          </span>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "search" && (
          <div className="pt-6 pb-12 min-h-full flex flex-col items-center justify-center relative">
            <SuperSearchHero />
          </div>
        )}

        {activeTab === "trending" && (
          <div className="p-4 space-y-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Trending
              </h2>
              <p className="text-xs text-muted mt-0.5">Mais pesquisados</p>
            </div>
            <TrendingProductsShowcase />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 border-t border-border backdrop-blur-xl flex items-center justify-around px-2 z-50">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === "search" ? "text-primary" : "text-muted-light"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pesquisar</span>
        </button>

        <button
          onClick={() => setActiveTab("trending")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === "trending" ? "text-primary" : "text-muted-light"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Trending</span>
        </button>
      </nav>
    </div>
  );
}
