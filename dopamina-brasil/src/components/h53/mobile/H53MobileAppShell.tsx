"use client";

import { useState } from "react";
import H53MobileDock from "./H53MobileDock";
import UrlScannerWidget from "@/components/h53/UrlScannerWidget";
import NeuromarketingRoiCalculator from "@/components/h53/NeuromarketingRoiCalculator";
import CaseStudiesSection from "@/components/h53/CaseStudiesSection";
import MultiStepFormModal from "@/components/h53/MultiStepFormModal";
import { Zap, ShieldCheck, Radio, Sparkles } from "lucide-react";

export default function H53MobileAppShell() {
  const [activeTab, setActiveTab] = useState<"scanner" | "calculator" | "cases" | "apply">("scanner");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [prefilledUrl, setPrefilledUrl] = useState("");

  const handleOpenForm = (url: string = "") => {
    setPrefilledUrl(url);
    setIsFormOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[9950] bg-[#050505] text-white flex flex-col font-inter overflow-hidden md:hidden">
      {/* Top Mobile Executive Header */}
      <header className="h-14 px-4 bg-[#0a0a0f]/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ccff00] text-black flex items-center justify-center font-black text-xs">
            H53
          </div>
          <span className="font-black font-outfit text-sm tracking-wider text-white">
            DATA INTENT <span className="text-[#ccff00]">APP</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-mono text-[10px] font-bold uppercase">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>CYBERINTEL: ONLINE</span>
        </div>
      </header>

      {/* Main Dynamic Scroll Container */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 space-y-6">
        {activeTab === "scanner" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-black to-[#ccff00]/10 border border-[#ccff00]/20 space-y-2">
              <span className="text-[10px] font-bold text-[#ccff00] uppercase tracking-widest px-2 py-0.5 rounded bg-[#ccff00]/20">
                MOBILE AUDIT ENGINE
              </span>
              <h2 className="text-xl font-black font-outfit text-white">
                WE DECODE HUMAN INTENT.
              </h2>
              <p className="text-xs text-gray-400">
                Insira o domínio da sua operação para executar um diagnóstico instantâneo de fricção cognitiva.
              </p>
            </div>

            <UrlScannerWidget onOpenForm={(url) => handleOpenForm(url)} />
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="space-y-4">
            <NeuromarketingRoiCalculator onOpenForm={() => handleOpenForm("")} />
          </div>
        )}

        {activeTab === "cases" && (
          <div className="space-y-4">
            <CaseStudiesSection />
          </div>
        )}

        {activeTab === "apply" && (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black font-outfit text-white">
              INICIAR PROTOCOLO H53
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Aplicação direta de consultoria para e-commerces e SaaS de alto ticket.
            </p>
            <button
              onClick={() => handleOpenForm("")}
              className="w-full py-4 bg-[#ccff00] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(204,255,0,0.4)]"
            >
              Preencher Aplicação Multi-step
            </button>
          </div>
        )}
      </main>

      {/* Mobile Executive Bottom Dock */}
      <H53MobileDock
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "apply") {
            handleOpenForm("");
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Multi-Step Lead Qualification Modal */}
      <MultiStepFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialUrl={prefilledUrl}
      />
    </div>
  );
}
