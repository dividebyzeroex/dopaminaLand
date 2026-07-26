"use client";

import { Zap, Calculator, FolderGit2, Rocket } from "lucide-react";
import { mobileEffects } from "@/lib/mobileEffects";

interface H53MobileDockProps {
  activeTab: "scanner" | "calculator" | "cases" | "apply";
  onTabChange: (tab: "scanner" | "calculator" | "cases" | "apply") => void;
}

interface H53TabItem {
  id: "scanner" | "calculator" | "cases" | "apply";
  label: string;
  icon: any;
  isHighlight?: boolean;
}

export default function H53MobileDock({ activeTab, onTabChange }: H53MobileDockProps) {
  const tabs: H53TabItem[] = [
    { id: "scanner", label: "Scan ⚡", icon: Zap },
    { id: "calculator", label: "ROI 📊", icon: Calculator },
    { id: "cases", label: "Cases 📁", icon: FolderGit2 },
    { id: "apply", label: "Aplicar 🚀", icon: Rocket, isHighlight: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0a0f]/95 border-t border-white/10 backdrop-blur-xl px-4 py-2 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  mobileEffects.trigger("dopamine");
                  onTabChange(tab.id);
                }}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ccff00] text-black font-black text-xs uppercase tracking-wider active:scale-90 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.4)]"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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
              className={`relative flex flex-col items-center py-1 px-3 transition-all active:scale-90 ${
                isActive ? "text-[#ccff00]" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight mt-1">{tab.label}</span>
              {isActive && <div className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#ccff00]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
