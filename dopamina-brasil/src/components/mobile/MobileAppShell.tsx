"use client";

import { useState } from "react";
import SuperSearchHero from "@/components/SuperSearchHero";
import TrendingProductsShowcase from "@/components/TrendingProductsShowcase";
import InsightsTelemetryModal from "@/components/InsightsTelemetryModal";
import { Zap, Activity, Search, Compass, ShieldAlert } from "lucide-react";

export default function MobileAppShell() {
  const [activeTab, setActiveTab] = useState<"search" | "trending" | "insights">("search");
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  return (
    <div className="fixed inset-0 z-[9900] bg-gradient-to-b from-[#0a192f] via-[#050508] to-[#050508] text-white flex flex-col font-inter overflow-hidden md:hidden">
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
          <span className="px-2.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-mono font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> AUDITORIA ATIVA
          </span>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "search" && (
          <div className="pt-6 pb-12 min-h-full flex flex-col items-center justify-center relative">
            <SuperSearchHero />
          </div>
        )}

        {activeTab === "trending" && (
          <div className="p-4 space-y-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-500 to-amber-500/0" />
              <div>
                <h2 className="text-xl font-black font-outfit text-white uppercase tracking-wider">
                  Trending
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">MAIS AUDITADOS</p>
              </div>
            </div>
            <TrendingProductsShowcase />
          </div>
        )}

        {activeTab === "insights" && (
          <div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
            <Activity className="w-12 h-12 text-orange-500 mb-2" />
            <h2 className="text-xl font-black font-outfit">Telemetria de Mercado</h2>
            <p className="text-sm text-gray-400">
              Acompanhe fraudes interceptadas e varreduras em tempo real na rede.
            </p>
            <button
              onClick={() => setShowInsightsModal(true)}
              className="mt-4 px-6 py-3 rounded-full bg-orange-500/10 border border-orange-500/40 text-orange-400 font-mono text-xs font-black uppercase tracking-wider"
            >
              Abrir Dashboard Global
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0f]/95 border-t border-white/10 backdrop-blur-xl flex items-center justify-around px-2 z-50">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === "search" ? "text-purple-400" : "text-gray-500"
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === "search" ? "fill-purple-400/20" : ""}`} />
          <span className="text-[9px] font-bold tracking-widest uppercase">Auditar</span>
        </button>

        <button
          onClick={() => setActiveTab("trending")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === "trending" ? "text-amber-400" : "text-gray-500"
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === "trending" ? "fill-amber-400/20" : ""}`} />
          <span className="text-[9px] font-bold tracking-widest uppercase">Trending</span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === "insights" ? "text-orange-400" : "text-gray-500"
          }`}
        >
          <Activity className={`w-5 h-5 ${activeTab === "insights" ? "fill-orange-400/20" : ""}`} />
          <span className="text-[9px] font-bold tracking-widest uppercase">Radar</span>
        </button>
      </nav>

      <InsightsTelemetryModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
      />
    </div>
  );
}
